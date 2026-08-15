import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Clock, Flame, Zap, CheckCircle2, XCircle, Award } from 'lucide-react';

export const QuizGameView: React.FC = () => {
  const { room, submitQuizAnswer, socket } = useSocket();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [hasAnswered, setHasAnswered] = useState(false);

  const question = room?.currentQuestion;
  const isReview = room?.status === 'ROUND_REVIEW';
  const myPlayer = room?.players.find((p) => p.id === socket?.id);

  // Sync remaining seconds
  useEffect(() => {
    if (!room?.roundEndTime) return;

    const interval = setInterval(() => {
      const remainingMs = Math.max(0, (room.roundEndTime || 0) - Date.now());
      const secs = Math.ceil(remainingMs / 1000);
      setTimeRemaining(secs);
    }, 200);

    return () => clearInterval(interval);
  }, [room?.roundEndTime]);

  // Reset local state when round changes
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
  }, [room?.currentRound]);

  if (!room || !question) return null;

  const handleSelect = async (index: number) => {
    if (hasAnswered || isReview) return;
    setSelectedOption(index);
    setHasAnswered(true);
    await submitQuizAnswer(index);
  };

  // Sort players by score descending
  const rankedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Main Question & Option Board */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header HUD */}
        <div
          className="card"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-cyan">
              Question {room.currentRound} / {room.totalRounds}
            </span>
            <span className="badge badge-easy">{question.category}</span>
            <span className={`badge badge-${question.difficulty}`}>{question.difficulty}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: timeRemaining <= 5 ? 'var(--accent-rose)' : 'var(--accent-cyan)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <Clock size={20} />
            <span>{isReview ? 'Review' : `${timeRemaining}s`}</span>
          </div>
        </div>

        {/* Question Prompt Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.4 }}>
            {question.question}
          </h2>

          {question.codeSnippet && (
            <pre
              style={{
                background: '#06090e',
                border: '1px solid var(--border-color)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                color: '#38bdf8',
                overflowX: 'auto',
                lineHeight: 1.5
              }}
            >
              <code>{question.codeSnippet}</code>
            </pre>
          )}

          {/* Answer Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = isReview && idx === question.correctIndex;
              const isWrong = isReview && isSelected && !isCorrect;

              let bg = 'var(--bg-input)';
              let border = 'var(--border-color)';
              let textColor = 'var(--text-primary)';

              if (isCorrect) {
                bg = 'rgba(16, 185, 129, 0.2)';
                border = 'var(--accent-emerald)';
                textColor = 'var(--accent-emerald)';
              } else if (isWrong) {
                bg = 'rgba(244, 63, 94, 0.2)';
                border = 'var(--accent-rose)';
                textColor = 'var(--accent-rose)';
              } else if (isSelected) {
                bg = 'rgba(6, 182, 212, 0.2)';
                border = 'var(--accent-cyan)';
                textColor = 'var(--accent-cyan)';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={hasAnswered || isReview}
                  style={{
                    background: bg,
                    border: `2px solid ${border}`,
                    color: textColor,
                    padding: '1.25rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: hasAnswered || isReview ? 'default' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isCorrect && <CheckCircle2 size={20} color="var(--accent-emerald)" />}
                  {isWrong && <XCircle size={20} color="var(--accent-rose)" />}
                </button>
              );
            })}
          </div>

          {/* Explanation during Review */}
          {isReview && (
            <div
              style={{
                marginTop: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                💡 EXPLANATION
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Live Leaderboard */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
          <Award size={18} color="var(--accent-amber)" />
          <span>Live Standings</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {rankedPlayers.map((p, idx) => {
            const isMe = p.id === socket?.id;
            return (
              <div
                key={p.id}
                style={{
                  background: isMe ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-input)',
                  border: `1px solid ${isMe ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', width: '16px' }}>
                    #{idx + 1}
                  </span>
                  <span>{p.avatar}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {p.username} {isMe && '(You)'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {p.streak > 1 && (
                    <span style={{ color: 'var(--accent-amber)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                      <Flame size={12} /> {p.streak}x
                    </span>
                  )}
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {p.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
