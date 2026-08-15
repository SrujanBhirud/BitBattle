import React from 'react';
import { useSocket } from './context/SocketContext';
import { Header } from './components/Header';
import { LobbyView } from './components/LobbyView';
import { WaitingRoom } from './components/WaitingRoom';
import { QuizGameView } from './components/QuizGameView';
import { CodeBattleView } from './components/CodeBattleView';
import { PodiumView } from './components/PodiumView';
import { ChatPanel } from './components/ChatPanel';

export const App: React.FC = () => {
  const { room } = useSocket();

  // Determine current active view based on room lifecycle
  const renderContent = () => {
    if (!room) {
      return <LobbyView />;
    }

    if (room.status === 'LOBBY' || room.status === 'STARTING') {
      return <WaitingRoom />;
    }

    if (room.status === 'IN_PROGRESS' || room.status === 'ROUND_REVIEW') {
      if (room.settings.mode === 'QUIZ') {
        return <QuizGameView />;
      } else {
        return <CodeBattleView />;
      }
    }

    if (room.status === 'FINISHED') {
      return <PodiumView />;
    }

    return <LobbyView />;
  };

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">{renderContent()}</main>
      <ChatPanel />
    </div>
  );
};
