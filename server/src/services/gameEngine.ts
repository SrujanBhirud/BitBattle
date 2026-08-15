import { Server } from 'socket.io';
import { Room, QuizQuestion, CodeChallenge } from '../types';
import { QUIZ_QUESTIONS } from '../data/questions';
import { CODE_CHALLENGES } from '../data/challenges';
import { RoomManager } from './roomManager';

export class GameEngine {
  private io: Server;
  private roomManager: RoomManager;
  private roomTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: Server, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  /**
   * Start a match for a room
   */
  public startMatch(code: string, hostId: string): boolean {
    const room = this.roomManager.getRoom(code);
    if (!room || room.hostId !== hostId || room.status !== 'LOBBY') {
      return false;
    }

    // Reset player match statistics
    room.players.forEach((p) => {
      p.score = 0;
      p.streak = 0;
      p.accuracy = 100;
      p.codeProgress = 0;
      p.testCasesPassed = 0;
      p.totalTestCases = 0;
      p.completedAt = null;
      p.lastAnswerCorrect = undefined;
    });

    room.currentRound = 0;
    room.status = 'STARTING';

    if (room.settings.mode === 'QUIZ') {
      // Pick random questions based on difficulty/count
      let pool = [...QUIZ_QUESTIONS];
      if (room.settings.difficulty !== 'mixed') {
        const filtered = pool.filter((q) => q.difficulty === room.settings.difficulty);
        if (filtered.length > 0) pool = filtered;
      }
      // Shuffle
      pool.sort(() => Math.random() - 0.5);
      room.quizQuestions = pool.slice(0, Math.min(room.settings.questionCount, pool.length));
      room.totalRounds = room.quizQuestions.length;
    } else {
      // CODE_CLASH mode
      let challenge = CODE_CHALLENGES.find((c) => c.id === room.settings.selectedChallengeId);
      if (!challenge) {
        challenge = CODE_CHALLENGES[Math.floor(Math.random() * CODE_CHALLENGES.length)];
      }
      room.currentChallenge = challenge;
      room.totalRounds = 1;
      room.players.forEach((p) => {
        p.totalTestCases = challenge?.testCases.length || 0;
      });
    }

    this.broadcastRoomUpdate(room);

    // 3-second countdown before round 1 begins
    setTimeout(() => {
      this.nextRound(code);
    }, 3000);

    return true;
  }

  /**
   * Progress to the next round / question or end match
   */
  public nextRound(code: string): void {
    const room = this.roomManager.getRoom(code);
    if (!room) return;

    this.clearTimer(code);

    if (room.currentRound >= room.totalRounds) {
      this.finishMatch(room);
      return;
    }

    room.currentRound += 1;
    room.status = 'IN_PROGRESS';
    room.roundAnswers.clear();

    const durationSeconds = room.settings.roundTimeSeconds;
    room.roundEndTime = Date.now() + durationSeconds * 1000;

    this.broadcastRoomUpdate(room);

    // Set authoritative round timer
    const timer = setTimeout(() => {
      this.handleRoundTimeout(code);
    }, durationSeconds * 1000);

    this.roomTimers.set(code, timer);
  }

  /**
   * Handle time expiration for a round
   */
  private handleRoundTimeout(code: string): void {
    const room = this.roomManager.getRoom(code);
    if (!room || room.status !== 'IN_PROGRESS') return;

    if (room.settings.mode === 'QUIZ') {
      this.showQuizRoundReview(room);
    } else {
      this.finishMatch(room);
    }
  }

  /**
   * Handle a quiz answer submission from a player
   */
  public handleQuizAnswer(
    code: string,
    playerId: string,
    optionIndex: number
  ): { success: boolean; pointsEarned?: number } {
    const room = this.roomManager.getRoom(code);
    if (!room || room.status !== 'IN_PROGRESS' || room.settings.mode !== 'QUIZ') {
      return { success: false };
    }

    if (room.roundAnswers.has(playerId)) {
      return { success: false }; // Already answered this round
    }

    const currentQuestion = room.quizQuestions?.[room.currentRound - 1];
    if (!currentQuestion) return { success: false };

    const player = room.players.get(playerId);
    if (!player) return { success: false };

    const now = Date.now();
    const remainingTimeMs = Math.max(0, (room.roundEndTime || 0) - now);
    const roundTotalMs = room.settings.roundTimeSeconds * 1000;
    const timeRatio = remainingTimeMs / roundTotalMs; // 1.0 at start, 0.0 at end

    const isCorrect = optionIndex === currentQuestion.correctIndex;
    let pointsEarned = 0;

    if (isCorrect) {
      player.streak += 1;
      // Base points (500) + Speed bonus (up to 500) + Streak bonus (50 per streak up to 250)
      const basePoints = 500;
      const speedBonus = Math.round(timeRatio * 500);
      const streakBonus = Math.min(250, (player.streak - 1) * 50);
      pointsEarned = basePoints + speedBonus + streakBonus;
      player.score += pointsEarned;
      player.lastAnswerCorrect = true;
    } else {
      player.streak = 0;
      player.lastAnswerCorrect = false;
    }

    room.roundAnswers.set(playerId, {
      optionIndex,
      timeTaken: roundTotalMs - remainingTimeMs,
      isCorrect,
      points: pointsEarned
    });

    this.broadcastRoomUpdate(room);

    // If all players have submitted answers, advance to review immediately
    if (room.roundAnswers.size >= room.players.size) {
      this.clearTimer(code);
      this.showQuizRoundReview(room);
    }

    return { success: true, pointsEarned };
  }

  /**
   * Show Quiz round review (correct answer + explanation) for 4 seconds, then proceed
   */
  private showQuizRoundReview(room: Room): void {
    room.status = 'ROUND_REVIEW';
    this.broadcastRoomUpdate(room);

    const timer = setTimeout(() => {
      this.nextRound(room.code);
    }, 4000);

    this.roomTimers.set(room.code, timer);
  }

  /**
   * Update Code Clash progress for a player
   */
  public updateCodeProgress(
    code: string,
    playerId: string,
    passedTests: number,
    totalTests: number
  ): void {
    const room = this.roomManager.getRoom(code);
    if (!room || room.status !== 'IN_PROGRESS' || room.settings.mode !== 'CODE_CLASH') return;

    const player = room.players.get(playerId);
    if (!player) return;

    player.testCasesPassed = passedTests;
    player.totalTestCases = totalTests;
    player.codeProgress = Math.round((passedTests / Math.max(1, totalTests)) * 100);

    // Calculate score based on passed tests and completion speed
    if (passedTests === totalTests && !player.completedAt) {
      player.completedAt = Date.now();
      const remainingMs = Math.max(0, (room.roundEndTime || 0) - player.completedAt);
      const totalMs = room.settings.roundTimeSeconds * 1000;
      const speedScore = Math.round((remainingMs / totalMs) * 1000);
      player.score = 1000 + speedScore; // 1000 base for solving + speed bonus
    } else if (!player.completedAt) {
      player.score = Math.round((passedTests / Math.max(1, totalTests)) * 800);
    }

    this.broadcastRoomUpdate(room);

    // Check if all players completed the challenge
    const allFinished = Array.from(room.players.values()).every((p) => p.codeProgress === 100);
    if (allFinished) {
      this.clearTimer(code);
      this.finishMatch(room);
    }
  }

  /**
   * Conclude match and transition to FINISHED status
   */
  public finishMatch(room: Room): void {
    this.clearTimer(room.code);
    room.status = 'FINISHED';
    room.roundEndTime = null;
    this.broadcastRoomUpdate(room);
  }

  /**
   * Reset match to LOBBY status so players can play again
   */
  public returnToLobby(code: string, hostId: string): boolean {
    const room = this.roomManager.getRoom(code);
    if (!room || room.hostId !== hostId) return false;

    this.clearTimer(code);
    room.status = 'LOBBY';
    room.currentRound = 0;
    room.roundEndTime = null;
    room.roundAnswers.clear();
    room.players.forEach((p) => {
      p.isReady = p.isHost;
      p.score = 0;
      p.streak = 0;
      p.codeProgress = 0;
      p.testCasesPassed = 0;
      p.completedAt = null;
      p.lastAnswerCorrect = undefined;
    });

    this.broadcastRoomUpdate(room);
    return true;
  }

  private clearTimer(code: string): void {
    if (this.roomTimers.has(code)) {
      clearTimeout(this.roomTimers.get(code)!);
      this.roomTimers.delete(code);
    }
  }

  private broadcastRoomUpdate(room: Room): void {
    const payload = this.roomManager.serializeRoom(room);
    this.io.to(room.code).emit('room_updated', payload);
  }
}
