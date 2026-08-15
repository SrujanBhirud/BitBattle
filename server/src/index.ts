import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { RoomManager } from './services/roomManager';
import { GameEngine } from './services/gameEngine';
import { setupSocketHandlers } from './socket';
import { QUIZ_QUESTIONS } from './data/questions';
import { CODE_CHALLENGES } from './data/challenges';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Initialize Core Services
const roomManager = new RoomManager();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const gameEngine = new GameEngine(io, roomManager);

// Setup WebSockets
setupSocketHandlers(io, roomManager, gameEngine);

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    activeRooms: roomManager.getAllRooms().length,
    activeSockets: io.engine.clientsCount
  });
});

app.get('/api/rooms', (req, res) => {
  res.json(roomManager.getPublicRooms());
});

app.get('/api/challenges', (req, res) => {
  res.json(
    CODE_CHALLENGES.map((c) => ({
      id: c.id,
      title: c.title,
      difficulty: c.difficulty,
      category: c.category,
      description: c.description
    }))
  );
});

app.get('/api/quiz-stats', (req, res) => {
  res.json({
    totalQuestions: QUIZ_QUESTIONS.length,
    categories: Array.from(new Set(QUIZ_QUESTIONS.map((q) => q.category)))
  });
});

server.listen(PORT, () => {
  console.log(`🚀 BitBattle Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});
