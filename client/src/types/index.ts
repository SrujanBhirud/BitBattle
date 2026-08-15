export type GameMode = 'QUIZ' | 'CODE_CLASH';
export type RoomStatus = 'LOBBY' | 'STARTING' | 'IN_PROGRESS' | 'ROUND_REVIEW' | 'FINISHED';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  id: string;
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
  input: string;
  expectedOutput: string;
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
  roundTimeSeconds: number;
  questionCount: number;
  difficulty: Difficulty | 'mixed';
  selectedChallengeId?: string;
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

export interface RoomState {
  code: string;
  name: string;
  status: RoomStatus;
  hostId: string;
  settings: RoomSettings;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  roundEndTime?: number | null;
  messages: ChatMessage[];
  currentQuestion?: QuizQuestion | null;
  currentChallenge?: CodeChallenge | null;
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
