import { Server, Socket } from 'socket.io';
import { RoomManager } from '../services/roomManager';
import { GameEngine } from '../services/gameEngine';
import { CodeJudge } from '../services/codeJudge';
import { ChatMessage, RoomSettings } from '../types';

export function setupSocketHandlers(io: Server, roomManager: RoomManager, gameEngine: GameEngine) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket Connected] ID: ${socket.id}`);

    // Track which room this socket is currently in
    let currentRoomCode: string | null = null;

    /**
     * Create Room
     */
    socket.on(
      'create_room',
      (
        data: { username: string; avatar: string; roomName: string; settings?: Partial<RoomSettings> },
        callback: (res: any) => void
      ) => {
        try {
          const room = roomManager.createRoom(
            socket.id,
            data.username || 'Coder',
            data.avatar || '⚡',
            data.roomName,
            data.settings
          );

          currentRoomCode = room.code;
          socket.join(room.code);

          const serialized = roomManager.serializeRoom(room);
          callback({ success: true, room: serialized });
          io.emit('public_rooms_updated', roomManager.getPublicRooms());
        } catch (err: any) {
          callback({ success: false, error: err.message });
        }
      }
    );

    /**
     * Join Room
     */
    socket.on(
      'join_room',
      (
        data: { code: string; username: string; avatar: string },
        callback: (res: any) => void
      ) => {
        try {
          const { room, error } = roomManager.joinRoom(
            data.code.toUpperCase(),
            socket.id,
            data.username || 'Challenger',
            data.avatar || '🚀'
          );

          if (error || !room) {
            callback({ success: false, error: error || 'Failed to join room.' });
            return;
          }

          currentRoomCode = room.code;
          socket.join(room.code);

          // Add join system message
          const sysMsg: ChatMessage = {
            id: `sys_${Date.now()}_${Math.random()}`,
            senderId: 'system',
            senderName: 'System',
            avatar: '📢',
            text: `${data.username || 'A player'} joined the arena!`,
            timestamp: Date.now(),
            type: 'system'
          };
          roomManager.addMessage(room.code, sysMsg);

          const serialized = roomManager.serializeRoom(room);
          callback({ success: true, room: serialized });
          io.to(room.code).emit('room_updated', serialized);
          io.emit('public_rooms_updated', roomManager.getPublicRooms());
        } catch (err: any) {
          callback({ success: false, error: err.message });
        }
      }
    );

    /**
     * Leave Room
     */
    socket.on('leave_room', () => {
      handleLeave();
    });

    /**
     * Toggle Ready
     */
    socket.on('toggle_ready', () => {
      if (!currentRoomCode) return;
      const room = roomManager.toggleReady(currentRoomCode, socket.id);
      if (room) {
        io.to(room.code).emit('room_updated', roomManager.serializeRoom(room));
      }
    });

    /**
     * Update Room Settings (Host only)
     */
    socket.on('update_settings', (settings: Partial<RoomSettings>) => {
      if (!currentRoomCode) return;
      const room = roomManager.updateSettings(currentRoomCode, socket.id, settings);
      if (room) {
        io.to(room.code).emit('room_updated', roomManager.serializeRoom(room));
        io.emit('public_rooms_updated', roomManager.getPublicRooms());
      }
    });

    /**
     * Start Match (Host only)
     */
    socket.on('start_game', (callback?: (res: any) => void) => {
      if (!currentRoomCode) return;
      const success = gameEngine.startMatch(currentRoomCode, socket.id);
      if (callback) callback({ success });
      if (success) {
        io.emit('public_rooms_updated', roomManager.getPublicRooms());
      }
    });

    /**
     * Submit Quiz Answer
     */
    socket.on('submit_quiz_answer', (data: { optionIndex: number }, callback?: (res: any) => void) => {
      if (!currentRoomCode) return;
      const result = gameEngine.handleQuizAnswer(currentRoomCode, socket.id, data.optionIndex);
      if (callback) callback(result);
    });

    /**
     * Run Code (Test run against visible test cases only)
     */
    socket.on(
      'run_code',
      async (
        data: { language: 'javascript' | 'python'; code: string },
        callback: (res: any) => void
      ) => {
        if (!currentRoomCode) {
          callback({ success: false, error: 'Not in a room.' });
          return;
        }

        const room = roomManager.getRoom(currentRoomCode);
        if (!room || !room.currentChallenge) {
          callback({ success: false, error: 'No active coding challenge.' });
          return;
        }

        const visibleCases = room.currentChallenge.testCases.filter((tc) => !tc.isHidden);
        const result = await CodeJudge.executeCode(
          data.language,
          data.code,
          room.currentChallenge.functionName,
          visibleCases
        );

        callback(result);
      }
    );

    /**
     * Submit Code (Full evaluation including hidden test cases)
     */
    socket.on(
      'submit_code',
      async (
        data: { language: 'javascript' | 'python'; code: string },
        callback: (res: any) => void
      ) => {
        if (!currentRoomCode) {
          callback({ success: false, error: 'Not in a room.' });
          return;
        }

        const room = roomManager.getRoom(currentRoomCode);
        if (!room || !room.currentChallenge) {
          callback({ success: false, error: 'No active coding challenge.' });
          return;
        }

        const result = await CodeJudge.executeCode(
          data.language,
          data.code,
          room.currentChallenge.functionName,
          room.currentChallenge.testCases
        );

        // Update real-time progress for all players to see
        gameEngine.updateCodeProgress(
          currentRoomCode,
          socket.id,
          result.passedTests,
          result.totalTests
        );

        callback(result);
      }
    );

    /**
     * Live code broadcast for spectator / peer progress sync
     */
    socket.on('code_typing', (data: { linesCount: number; charCount: number }) => {
      if (!currentRoomCode) return;
      socket.to(currentRoomCode).emit('opponent_typing', {
        playerId: socket.id,
        linesCount: data.linesCount,
        charCount: data.charCount
      });
    });

    /**
     * Send In-game Chat Message
     */
    socket.on('send_chat', (data: { text: string }) => {
      if (!currentRoomCode || !data.text?.trim()) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player) return;

      const msg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        senderId: player.id,
        senderName: player.username,
        avatar: player.avatar,
        text: data.text.trim().slice(0, 200),
        timestamp: Date.now(),
        type: 'chat'
      };

      roomManager.addMessage(currentRoomCode, msg);
      io.to(currentRoomCode).emit('chat_message', msg);
    });

    /**
     * Send Real-Time Emoji Reaction
     */
    socket.on('send_reaction', (data: { emoji: string }) => {
      if (!currentRoomCode || !data.emoji) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player) return;

      io.to(currentRoomCode).emit('player_reaction', {
        playerId: socket.id,
        username: player.username,
        emoji: data.emoji
      });
    });

    /**
     * Return to Lobby
     */
    socket.on('return_to_lobby', (callback?: (res: any) => void) => {
      if (!currentRoomCode) return;
      const success = gameEngine.returnToLobby(currentRoomCode, socket.id);
      if (callback) callback({ success });
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] ID: ${socket.id}`);
      handleLeave();
    });

    function handleLeave() {
      if (!currentRoomCode) return;
      const code = currentRoomCode;
      currentRoomCode = null;
      socket.leave(code);

      const { room, wasHost, destroyed } = roomManager.leaveRoom(socket.id);
      if (destroyed) {
        io.emit('public_rooms_updated', roomManager.getPublicRooms());
        return;
      }

      if (room) {
        io.to(room.code).emit('room_updated', roomManager.serializeRoom(room));
        io.emit('public_rooms_updated', roomManager.getPublicRooms());
      }
    }
  });
}
