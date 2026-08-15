export type GameMode = 'QUIZ' | 'CODE_CLASH';
export type RoomStatus = 'LOBBY' | 'STARTING' | 'IN_PROGRESS' | 'ROUND_REVIEW' | 'FINISHED';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  id: string; // Socket ID
  username: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  streak: number;
  accuracy: number;
  testCasesPassed?: number;
  totalTestCases?: number;
  codeProgress?: number; // 0 to 100%
  completedAt?: number | null;
  lastAnswerCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  category: string;
  difficulty: Difficulty;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TestCase {
  id: string;
  input: string; // JSON string or raw input
  expectedOutput: string; // JSON string or raw output
  isHidden?: boolean;
  description?: string;
}

export interface CodeChallenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
  };
  functionName: string;
  testCases: TestCase[];
}

export interface RoomSettings {
  mode: GameMode;
  maxPlayers: number;
  isPrivate: boolean;
  roundTimeSeconds: number; // For quiz question or coding battle
  questionCount: number; // For quiz
  difficulty: Difficulty | 'mixed';
  selectedChallengeId?: string; // For code clash
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  text: string;
  timestamp: number;
  type?: 'chat' | 'system' | 'reaction';
}

export interface Room {
  code: string;
  name: string;
  status: RoomStatus;
  hostId: string;
  settings: RoomSettings;
  players: Map<string, Player>;
  currentRound: number;
  totalRounds: number;
  quizQuestions?: QuizQuestion[];
  currentChallenge?: CodeChallenge;
  roundEndTime?: number | null;
  roundAnswers: Map<string, { optionIndex: number; timeTaken: number; isCorrect: boolean; points: number }>;
  messages: ChatMessage[];
  createdAt: number;
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
  executionTimeMs: number;
  isHidden?: boolean;
}

export interface ExecutionResponse {
  success: boolean;
  totalTests: number;
  passedTests: number;
  results: TestResult[];
  compilerError?: string;
  allPassed: boolean;
  executionTimeMs: number;
}
