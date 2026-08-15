import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { RoomState, ChatMessage, ExecutionResponse, RoomSettings } from '../types';
import { sound } from '../utils/sound';

interface ReactionNotification {
  id: string;
  playerId: string;
  username: string;
  emoji: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  room: RoomState | null;
  currentUser: {
    username: string;
    avatar: string;
  };
  setUsername: (name: string) => void;
  setAvatar: (avatar: string) => void;
  publicRooms: any[];
  reactions: ReactionNotification[];
  createRoom: (roomName: string, settings?: Partial<RoomSettings>) => Promise<{ success: boolean; error?: string }>;
  joinRoom: (code: string) => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => void;
  toggleReady: () => void;
  updateSettings: (settings: Partial<RoomSettings>) => void;
  startGame: () => Promise<boolean>;
  submitQuizAnswer: (optionIndex: number) => Promise<{ success: boolean; pointsEarned?: number }>;
  runCode: (language: 'javascript' | 'python', code: string) => Promise<ExecutionResponse>;
  submitCode: (language: 'javascript' | 'python', code: string) => Promise<ExecutionResponse>;
  sendTypingStatus: (linesCount: number, charCount: number) => void;
  sendChat: (text: string) => void;
  sendReaction: (emoji: string) => void;
  returnToLobby: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

const DEFAULT_AVATARS = ['⚡', '👾', '🚀', '🔥', '💻', '🦊', '🧠', '🛡️'];

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [reactions, setReactions] = useState<ReactionNotification[]>([]);

  // Persistent user identity
  const [username, setUsernameState] = useState(() => {
    return localStorage.getItem('bitbattle_username') || `Dev_${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const [avatar, setAvatarState] = useState(() => {
    return localStorage.getItem('bitbattle_avatar') || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
  });

  const setUsername = (name: string) => {
    const trimmed = name.trim().slice(0, 16);
    setUsernameState(trimmed);
    localStorage.setItem('bitbattle_username', trimmed);
  };

  const setAvatar = (newAvatar: string) => {
    setAvatarState(newAvatar);
    localStorage.setItem('bitbattle_avatar', newAvatar);
  };

  useEffect(() => {
    // Determine backend socket URL
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('Connected to BitBattle Server:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('room_updated', (updatedRoom: RoomState) => {
      setRoom((prev) => {
        // Sound cues on status change
        if (prev?.status === 'LOBBY' && updatedRoom.status === 'STARTING') {
          sound.playCountdownTick();
        } else if (prev?.status === 'STARTING' && updatedRoom.status === 'IN_PROGRESS') {
          sound.playCountdownGo();
        } else if (updatedRoom.status === 'FINISHED' && prev?.status !== 'FINISHED') {
          sound.playVictory();
        }
        return updatedRoom;
      });
    });

    socketInstance.on('public_rooms_updated', (rooms: any[]) => {
      setPublicRooms(rooms);
    });

    socketInstance.on('chat_message', (msg: ChatMessage) => {
      sound.playClick();
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, msg]
        };
      });
    });

    socketInstance.on('player_reaction', (data: { playerId: string; username: string; emoji: string }) => {
      const id = `react_${Date.now()}_${Math.random()}`;
      setReactions((prev) => [...prev, { id, ...data }]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2500);
    });

    setSocket(socketInstance);

    // Initial public rooms fetch
    fetch(`${socketUrl}/api/rooms`)
      .then((res) => res.json())
      .then((data) => setPublicRooms(data))
      .catch(() => {});

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const createRoom = (
    roomName: string,
    settings?: Partial<RoomSettings>
  ): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket) return resolve({ success: false, error: 'Socket not connected.' });

      socket.emit(
        'create_room',
        { username, avatar, roomName, settings },
        (res: { success: boolean; room?: RoomState; error?: string }) => {
          if (res.success && res.room) {
            setRoom(res.room);
            sound.playClick();
            resolve({ success: true });
          } else {
            resolve({ success: false, error: res.error });
          }
        }
      );
    });
  };

  const joinRoom = (code: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket) return resolve({ success: false, error: 'Socket not connected.' });

      socket.emit(
        'join_room',
        { code, username, avatar },
        (res: { success: boolean; room?: RoomState; error?: string }) => {
          if (res.success && res.room) {
            setRoom(res.room);
            sound.playClick();
            resolve({ success: true });
          } else {
            resolve({ success: false, error: res.error });
          }
        }
      );
    });
  };

  const leaveRoom = () => {
    if (!socket) return;
    socket.emit('leave_room');
    setRoom(null);
  };

  const toggleReady = () => {
    if (!socket) return;
    sound.playClick();
    socket.emit('toggle_ready');
  };

  const updateSettings = (settings: Partial<RoomSettings>) => {
    if (!socket) return;
    socket.emit('update_settings', settings);
  };

  const startGame = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!socket) return resolve(false);
      socket.emit('start_game', (res: { success: boolean }) => {
        resolve(res?.success ?? false);
      });
    });
  };

  const submitQuizAnswer = (
    optionIndex: number
  ): Promise<{ success: boolean; pointsEarned?: number }> => {
    return new Promise((resolve) => {
      if (!socket) return resolve({ success: false });
      socket.emit(
        'submit_quiz_answer',
        { optionIndex },
        (res: { success: boolean; pointsEarned?: number }) => {
          if (res?.success) {
            if ((res.pointsEarned || 0) > 0) {
              sound.playCorrect();
            } else {
              sound.playIncorrect();
            }
          }
          resolve(res);
        }
      );
    });
  };

  const runCode = (
    language: 'javascript' | 'python',
    code: string
  ): Promise<ExecutionResponse> => {
    return new Promise((resolve) => {
      if (!socket) {
        return resolve({
          success: false,
          totalTests: 0,
          passedTests: 0,
          results: [],
          compilerError: 'Not connected to server',
          allPassed: false,
          executionTimeMs: 0
        });
      }
      socket.emit('run_code', { language, code }, (res: ExecutionResponse) => {
        if (res.allPassed) {
          sound.playPass();
        }
        resolve(res);
      });
    });
  };

  const submitCode = (
    language: 'javascript' | 'python',
    code: string
  ): Promise<ExecutionResponse> => {
    return new Promise((resolve) => {
      if (!socket) {
        return resolve({
          success: false,
          totalTests: 0,
          passedTests: 0,
          results: [],
          compilerError: 'Not connected to server',
          allPassed: false,
          executionTimeMs: 0
        });
      }
      socket.emit('submit_code', { language, code }, (res: ExecutionResponse) => {
        if (res.allPassed) {
          sound.playVictory();
        } else {
          sound.playIncorrect();
        }
        resolve(res);
      });
    });
  };

  const sendTypingStatus = (linesCount: number, charCount: number) => {
    if (!socket) return;
    socket.emit('code_typing', { linesCount, charCount });
  };

  const sendChat = (text: string) => {
    if (!socket) return;
    socket.emit('send_chat', { text });
  };

  const sendReaction = (emoji: string) => {
    if (!socket) return;
    socket.emit('send_reaction', { emoji });
  };

  const returnToLobby = () => {
    if (!socket) return;
    sound.playClick();
    socket.emit('return_to_lobby');
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        room,
        currentUser: { username, avatar },
        setUsername,
        setAvatar,
        publicRooms,
        reactions,
        createRoom,
        joinRoom,
        leaveRoom,
        toggleReady,
        updateSettings,
        startGame,
        submitQuizAnswer,
        runCode,
        submitCode,
        sendTypingStatus,
        sendChat,
        sendReaction,
        returnToLobby
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
