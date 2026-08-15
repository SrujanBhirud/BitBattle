import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Copy, Check, Play, Crown, LogOut, Settings, ShieldCheck, Clock, Layers, HelpCircle, Code } from 'lucide-react';

export const WaitingRoom: React.FC = () => {
  const { room, currentUser, toggleReady, startGame, leaveRoom, updateSettings, socket } = useSocket();
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!room) return null;

  const currentPlayer = room.players.find((p) => p.id === socket?.id);
  const isHost = currentPlayer?.isHost;
  const allReady = room.players.every((p) => p.isReady);
  const canStart = isHost && (room.players.length > 0) && allReady;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Top Banner: Arena Info & Room Code */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderLeft: '4px solid var(--accent-cyan)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className={room.settings.mode === 'QUIZ' ? 'badge badge-cyan' : 'badge badge-easy'}>
              {room.settings.mode === 'QUIZ' ? 'Quiz Trivia' : 'Code Clash'}
            </span>
            <span className={`badge badge-${room.settings.difficulty === 'mixed' ? 'cyan' : room.settings.difficulty}`}>
              {room.settings.difficulty}
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{room.name}</h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
            <span>
              <Clock size={13} style={{ display: 'inline', marginRight: '3px' }} />
              {room.settings.roundTimeSeconds}s per {room.settings.mode === 'QUIZ' ? 'question' : 'challenge'}
            </span>
            {room.settings.mode === 'QUIZ' && (
              <span>
                <Layers size={13} style={{ display: 'inline', marginRight: '3px' }} />
                {room.settings.questionCount} Questions
              </span>
            )}
          </div>
        </div>

        {/* Room Code Widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            onClick={handleCopyCode}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'border-color var(--transition-fast)'
            }}
            title="Click to copy Room Code"
          >
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Room Code
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', color: 'var(--accent-cyan)' }}>
                {room.code}
              </div>
            </div>
            {copied ? <Check size={20} color="var(--accent-emerald)" /> : <Copy size={20} color="var(--text-secondary)" />}
          </div>

          <button className="btn btn-outline-danger" onClick={leaveRoom} title="Leave Lobby">
            <LogOut size={16} /> Leave
          </button>
        </div>
      </div>

      {/* Starting countdown overlay banner if status is STARTING */}
      {room.status === 'STARTING' && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(37, 99, 235, 0.2))',
            borderColor: 'var(--accent-cyan)',
            textAlign: 'center',
            padding: '1.5rem'
          }}
        >
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            ⚡ Battle Starting in 3 Seconds! Get Ready!
          </h2>
        </div>
      )}

      {/* Main Waiting Area: Players Pods */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="var(--accent-emerald)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Combatants In Lobby ({room.players.length}/{room.settings.maxPlayers})</h2>
          </div>

          {isHost && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={14} /> {showSettings ? 'Hide Arena Settings' : 'Edit Arena Settings'}
            </button>
          )}
        </div>

        {/* Host Settings Editor */}
        {showSettings && isHost && (
          <div
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}
          >
            <div className="input-group">
              <label className="input-label">Game Mode</label>
              <select
                className="input-control"
                value={room.settings.mode}
                onChange={(e) => updateSettings({ mode: e.target.value as any })}
              >
                <option value="QUIZ">Quiz Trivia</option>
                <option value="CODE_CLASH">Code Clash</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Difficulty</label>
              <select
                className="input-control"
                value={room.settings.difficulty}
                onChange={(e) => updateSettings({ difficulty: e.target.value as any })}
              >
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Time Limit (Seconds)</label>
              <input
                type="number"
                className="input-control"
                value={room.settings.roundTimeSeconds}
                onChange={(e) => updateSettings({ roundTimeSeconds: Number(e.target.value) })}
                min={10}
                max={600}
              />
            </div>

            {room.settings.mode === 'QUIZ' && (
              <div className="input-group">
                <label className="input-label">Question Count</label>
                <input
                  type="number"
                  className="input-control"
                  value={room.settings.questionCount}
                  onChange={(e) => updateSettings({ questionCount: Number(e.target.value) })}
                  min={1}
                  max={20}
                />
              </div>
            )}
          </div>
        )}

        {/* Players Roster Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          {room.players.map((p) => {
            const isMe = p.id === socket?.id;
            return (
              <div
                key={p.id}
                style={{
                  background: isMe ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-input)',
                  border: `1px solid ${isMe ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  position: 'relative'
                }}
              >
                {p.isHost && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      color: 'var(--accent-amber)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}
                  >
                    <Crown size={14} /> HOST
                  </div>
                )}

                <div
                  style={{
                    fontSize: '2.5rem',
                    background: 'var(--bg-card)',
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {p.avatar}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {p.username} {isMe && <span style={{ color: 'var(--accent-cyan)' }}>(You)</span>}
                  </div>
                </div>

                <div>
                  {p.isReady ? (
                    <span className="badge badge-easy" style={{ gap: '4px' }}>
                      <Check size={12} /> READY
                    </span>
                  ) : (
                    <span className="badge badge-medium">WAITING</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action controls footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem'
          }}
        >
          <div>
            {!currentPlayer?.isHost && (
              <button
                className={`btn ${currentPlayer?.isReady ? 'btn-secondary' : 'btn-success'} btn-lg`}
                onClick={toggleReady}
              >
                <Check size={18} /> {currentPlayer?.isReady ? 'Cancel Ready' : "I'm Ready!"}
              </button>
            )}
          </div>

          <div>
            {isHost && (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => startGame()}
                disabled={!canStart || room.status === 'STARTING'}
              >
                <Play size={18} /> {!allReady ? 'Waiting for all to be Ready...' : 'Launch Battle!'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
