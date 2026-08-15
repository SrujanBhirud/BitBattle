import { Room, Player, RoomSettings, GameMode, ChatMessage } from '../types';
import { QUIZ_QUESTIONS } from '../data/questions';
import { CODE_CHALLENGES } from '../data/challenges';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  /**
   * Generate a random 6-character room code
   */
  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  /**
   * Create a new room
   */
  public createRoom(
    hostId: string,
    username: string,
    avatar: string,
    roomName: string,
    settings: Partial<RoomSettings> = {}
  ): Room {
    const code = this.generateRoomCode();

    const defaultSettings: RoomSettings = {
      mode: settings.mode || 'QUIZ',
      maxPlayers: settings.maxPlayers || 8,
      isPrivate: settings.isPrivate ?? false,
      roundTimeSeconds: settings.roundTimeSeconds || (settings.mode === 'CODE_CLASH' ? 300 : 20),
      questionCount: settings.questionCount || 5,
      difficulty: settings.difficulty || 'mixed',
      selectedChallengeId: settings.selectedChallengeId || (CODE_CHALLENGES[0]?.id)
    };

    const hostPlayer: Player = {
      id: hostId,
      username,
      avatar,
      isHost: true,
      isReady: true,
      score: 0,
      streak: 0,
      accuracy: 100,
      codeProgress: 0,
      testCasesPassed: 0,
      totalTestCases: 0
    };

    const room: Room = {
      code,
      name: roomName || `${username}'s Arena`,
      status: 'LOBBY',
      hostId,
      settings: defaultSettings,
      players: new Map([[hostId, hostPlayer]]),
      currentRound: 0,
      totalRounds: defaultSettings.mode === 'QUIZ' ? defaultSettings.questionCount : 1,
      roundAnswers: new Map(),
      messages: [],
      createdAt: Date.now()
    };

    this.rooms.set(code, room);
    return room;
  }

  public getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  public getPublicRooms(): any[] {
    return Array.from(this.rooms.values())
      .filter((r) => !r.settings.isPrivate && r.status === 'LOBBY')
      .map((r) => ({
        code: r.code,
        name: r.name,
        mode: r.settings.mode,
        playerCount: r.players.size,
        maxPlayers: r.settings.maxPlayers,
        difficulty: r.settings.difficulty,
        hostName: r.players.get(r.hostId)?.username || 'Host'
      }));
  }

  public joinRoom(
    code: string,
    playerId: string,
    username: string,
    avatar: string
  ): { room?: Room; error?: string } {
    const room = this.getRoom(code);
    if (!room) {
      return { error: 'Room not found. Check your room code.' };
    }

    if (room.status !== 'LOBBY') {
      return { error: 'Match is already in progress in this room.' };
    }

    if (room.players.size >= room.settings.maxPlayers) {
      return { error: 'Room is full.' };
    }

    const player: Player = {
      id: playerId,
      username,
      avatar,
      isHost: room.players.size === 0,
      isReady: false,
      score: 0,
      streak: 0,
      accuracy: 100,
      codeProgress: 0,
      testCasesPassed: 0,
      totalTestCases: 0
    };

    room.players.set(playerId, player);
    return { room };
  }

  public leaveRoom(playerId: string): { room?: Room; wasHost?: boolean; destroyed?: boolean } {
    for (const [code, room] of this.rooms.entries()) {
      if (room.players.has(playerId)) {
        const wasHost = room.hostId === playerId;
        room.players.delete(playerId);

        if (room.players.size === 0) {
          this.rooms.delete(code);
          return { room, wasHost, destroyed: true };
        }

        // Migrate host if current host left
        if (wasHost) {
          const nextHost = room.players.values().next().value;
          if (nextHost) {
            nextHost.isHost = true;
            nextHost.isReady = true;
            room.hostId = nextHost.id;
          }
        }

        return { room, wasHost, destroyed: false };
      }
    }
    return {};
  }

  public toggleReady(code: string, playerId: string): Room | null {
    const room = this.getRoom(code);
    if (!room) return null;
    const player = room.players.get(playerId);
    if (!player) return null;

    player.isReady = !player.isReady;
    return room;
  }

  public updateSettings(code: string, hostId: string, newSettings: Partial<RoomSettings>): Room | null {
    const room = this.getRoom(code);
    if (!room || room.hostId !== hostId || room.status !== 'LOBBY') return null;

    room.settings = { ...room.settings, ...newSettings };
    room.totalRounds = room.settings.mode === 'QUIZ' ? room.settings.questionCount : 1;
    return room;
  }

  public addMessage(code: string, message: ChatMessage): Room | null {
    const room = this.getRoom(code);
    if (!room) return null;
    room.messages.push(message);
    if (room.messages.length > 50) room.messages.shift();
    return room;
  }

  /**
   * Serialize Room object for socket transmission (Maps converted to plain arrays/objects)
   */
  public serializeRoom(room: Room): any {
    return {
      code: room.code,
      name: room.name,
      status: room.status,
      hostId: room.hostId,
      settings: room.settings,
      players: Array.from(room.players.values()),
      currentRound: room.currentRound,
      totalRounds: room.totalRounds,
      roundEndTime: room.roundEndTime,
      messages: room.messages,
      currentQuestion:
        room.status === 'IN_PROGRESS' || room.status === 'ROUND_REVIEW'
          ? room.quizQuestions?.[room.currentRound - 1]
          : null,
      currentChallenge:
        room.status === 'IN_PROGRESS' || room.status === 'ROUND_REVIEW' || room.status === 'FINISHED'
          ? room.currentChallenge
          : null
    };
  }
}
