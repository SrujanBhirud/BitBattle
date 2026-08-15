# ⚔️ BitBattle — Real-Time Multiplayer Coding & Quiz Contest Platform

**BitBattle** is a full-stack real-time multiplayer platform designed for competitive programming showdowns and speed computer science trivia contests. Built for CS455.

---

## 🌟 Key Features

1. **⚡ Real-Time WebSocket Synchronization (Socket.IO)**
   - Authoritative game loops and room state machines.
   - Low-latency matchmaking, ready checks, and room code sharing.
   - Live opponent progress tracking (showing real-time % test cases passed by rivals).

2. **🧠 Quiz Showdown Mode**
   - Timed multiple-choice questions spanning Algorithms, Data Structures, Web/JS, Python, Computer Networks, Operating Systems, and System Design.
   - Streak multipliers, speed bonus scoring, and instant answer explanation cards.

3. **💻 Code Clash Mode**
   - Split-pane in-browser IDE powered by **Monaco Editor**.
   - Polyglot support (**JavaScript** and **Python 3**).
   - Real-time test runner & code judge evaluating against visible and hidden test suites.
   - Live test console with execution metrics (ms) and error diagnostics.

4. **🏆 Interactive Esports HUD & Polish**
   - Web Audio API synthesized sound effects (countdown beeps, answer chimes, error buzzes, victory fanfares).
   - In-game match chat and floating live emoji reactions.
   - Dynamic top 3 podium screen with celebratory confetti bursts.

---

## 🛠️ Project Structure

```
BitBattle/
├── package.json               # Root workspace scripts (npm run dev)
├── server/                    # Backend Node.js + Express + Socket.IO server
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts           # Server entry point & REST endpoints
│       ├── types/             # Shared TypeScript models & contracts
│       ├── services/
│       │   ├── roomManager.ts # Lobby & room lifecycle management
│       │   ├── gameEngine.ts  # Authoritative game loops & scoring
│       │   └── codeJudge.ts   # Safe JS (VM) & Python test runner
│       ├── socket/            # Socket.io event router
│       └── data/
│           ├── questions.ts   # Quiz trivia question bank
│           └── challenges.ts  # Coding problems & test suites
│
└── client/                    # Frontend React 18 + Vite + TypeScript
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── App.tsx            # Main game state router
        ├── main.tsx
        ├── index.css          # Design system & CSS tokens
        ├── context/
        │   └── SocketContext.tsx # Global WebSocket provider
        ├── utils/
        │   └── sound.ts       # Synthesized Web Audio engine
        └── components/
            ├── Header.tsx     # Navbar & player profile modal
            ├── LobbyView.tsx  # Room creator & public lobby browser
            ├── WaitingRoom.tsx# Match lobby & player roster
            ├── QuizGameView.tsx # Timed MCQ trivia board
            ├── CodeBattleView.tsx # Monaco editor & test runner IDE
            ├── PodiumView.tsx # Final rankings & rematch screen
            └── ChatPanel.tsx  # In-game chat & floating reactions
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python 3](https://www.python.org/) (optional, if running Python code solutions)

### 1. Install All Dependencies
From the root directory:
```bash
npm run install:all
```

### 2. Start Development Servers
Run both the backend (port 5000) and frontend (port 5173) concurrently:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🎮 How to Test Multiplayer Locally
1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. Click **Create Arena** to create a room. Choose **Quiz Trivia** or **Code Clash**.
3. Copy the 6-letter Room Code.
4. Open an Incognito window (or a second browser tab) and navigate to [http://localhost:5173](http://localhost:5173).
5. Enter the Room Code in **Join by Code**.
6. Toggle **Ready** in both windows, and click **Launch Battle** from the Host window!

---

## 🔧 Adding New Questions & Challenges
- **Add Quiz Questions**: Edit [`server/src/data/questions.ts`](file:///c:/Srujan/Acads/Sem%207/CS455/BitBattle/server/src/data/questions.ts)
- **Add Coding Challenges**: Edit [`server/src/data/challenges.ts`](file:///c:/Srujan/Acads/Sem%207/CS455/BitBattle/server/src/data/challenges.ts)
