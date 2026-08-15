import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useSocket } from '../context/SocketContext';
import { Trophy, Medal, RotateCcw, Award, Flame, CheckCircle, Clock } from 'lucide-react';

export const PodiumView: React.FC = () => {
  const { room, returnToLobby, socket } = useSocket();

  useEffect(() => {
    // Launch celebratory confetti burst
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#38bdf8', '#10b981', '#f59e0b', '#ec4899'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  if (!room) return null;

  // Sort players by score
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isHost = room.players.find((p) => p.id === socket?.id)?.isHost;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
      {/* Victory Header */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.15), rgba(18, 24, 36, 0.9))',
          borderColor: 'rgba(56, 189, 248, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)'
          }}
        >
          <Trophy size={36} color="#ffffff" />
        </div>

        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {winner?.username} Victorious!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Match Concluded: {room.name} ({room.settings.mode === 'QUIZ' ? 'Quiz Trivia' : 'Code Clash'})
          </p>
        </div>
      </div>

      {/* Top 3 Podium Visual (if 2 or more players) */}
      {sortedPlayers.length >= 2 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '1.25rem',
            padding: '1rem 0'
          }}
        >
          {/* 2nd Place */}
          {sortedPlayers[1] && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '140px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{sortedPlayers[1].avatar}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', textAlign: 'center' }}>
                {sortedPlayers[1].username}
              </div>
              <div
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  width: '100%',
                  height: '110px',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Medal size={24} color="#94a3b8" />
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#94a3b8' }}>2nd</span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{sortedPlayers[1].score} pts</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '160px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{winner?.avatar}</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--accent-amber)', textAlign: 'center' }}>
              {winner?.username}
            </div>
            <div
              style={{
                background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.2), var(--bg-input))',
                border: '2px solid var(--accent-amber)',
                width: '100%',
                height: '150px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Trophy size={28} color="var(--accent-amber)" />
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent-amber)' }}>1st</span>
              <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{winner?.score} pts</span>
            </div>
          </div>

          {/* 3rd Place */}
          {sortedPlayers[2] && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '140px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{sortedPlayers[2].avatar}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', textAlign: 'center' }}>
                {sortedPlayers[2].username}
              </div>
              <div
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  width: '100%',
                  height: '80px',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Medal size={22} color="#d97706" />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#d97706' }}>3rd</span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{sortedPlayers[2].score} pts</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Final Scoreboard</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {sortedPlayers.map((p, idx) => {
            const isMe = p.id === socket?.id;
            return (
              <div
                key={p.id}
                style={{
                  background: isMe ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-input)',
                  border: `1px solid ${isMe ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 800, width: '20px', color: 'var(--text-muted)' }}>#{idx + 1}</span>
                  <span style={{ fontSize: '1.4rem' }}>{p.avatar}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {p.username} {isMe && <span style={{ color: 'var(--accent-cyan)' }}>(You)</span>}
                    </div>
                    {room.settings.mode === 'CODE_CLASH' && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Passed {p.testCasesPassed || 0} / {p.totalTestCases || 0} tests ({p.codeProgress || 0}%)
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {p.score} PTS
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rematch Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          {isHost ? (
            <button className="btn btn-primary btn-lg" onClick={returnToLobby}>
              <RotateCcw size={18} /> Play Again / Return to Lobby
            </button>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Waiting for Host to initiate rematch...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
