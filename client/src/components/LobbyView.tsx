import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { GameMode, Difficulty } from '../types';
import { ContributionSpotlight } from './ContributionSpotlight';
import { Play, Plus, KeyRound, Globe, Users, Trophy, Flame, Code, HelpCircle, Sparkles, RefreshCw } from 'lucide-react';

export const LobbyView: React.FC = () => {
  const { createRoom, joinRoom, publicRooms, isConnected } = useSocket();
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [joinCode, setJoinCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Create room state
  const [roomName, setRoomName] = useState('');
  const [mode, setMode] = useState<GameMode>('QUIZ');
  const [difficulty, setDifficulty] = useState<Difficulty | 'mixed'>('mixed');
  const [roundTimeSeconds, setRoundTimeSeconds] = useState(25);
  const [questionCount, setQuestionCount] = useState(5);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true);
    setErrorMessage('');
    const res = await joinRoom(joinCode.trim().toUpperCase());
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to join room.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    const res = await createRoom(roomName || 'Contest Arena', {
      mode,
      difficulty,
      roundTimeSeconds: mode === 'CODE_CLASH' ? 300 : roundTimeSeconds,
      questionCount,
      maxPlayers,
      isPrivate
    });
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to create room.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 20, 31, 0.95), rgba(24, 34, 50, 0.8))',
          borderColor: 'rgba(56, 189, 248, 0.25)',
          padding: '2.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-cyan">
              <Sparkles size={12} /> Live Real-Time Arena
            </span>
            <span className="badge badge-easy">CS455 Course Project</span>
          </div>
          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              marginBottom: '0.75rem'
            }}
          >
            Multiplayer Coding & Trivia Showdown
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
            Compete against classmates in lightning-fast <strong>CS Quiz Showdowns</strong> or head-to-head <strong>Code Clash Battles</strong> with real-time test execution and live synchronized leaderboards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.5rem',
              textAlign: 'center'
            }}
          >
            <div style={{ color: 'var(--accent-cyan)', fontSize: '1.75rem', fontWeight: 800 }}>10+</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>CS TOPICS</div>
          </div>
          <div
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.5rem',
              textAlign: 'center'
            }}
          >
            <div style={{ color: 'var(--accent-emerald)', fontSize: '1.75rem', fontWeight: 800 }}>0ms</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>WS SYNC</div>
          </div>
        </div>
      </div>

      <ContributionSpotlight />

      {/* Main Mode Switcher / Action Tabs */}
      <div className="grid-2">
        {/* Left Column: Join / Create Hub */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-input)',
              padding: '0.3rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}
          >
            <button
              className="btn"
              style={{
                flex: 1,
                background: activeTab === 'join' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'join' ? '#000' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('join')}
            >
              <KeyRound size={16} /> Join by Code
            </button>
            <button
              className="btn"
              style={{
                flex: 1,
                background: activeTab === 'create' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'create' ? '#000' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('create')}
            >
              <Plus size={16} /> Create Arena
            </button>
          </div>

          {errorMessage && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid var(--accent-rose)',
                color: 'var(--accent-rose)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}
            >
              {errorMessage}
            </div>
          )}

          {activeTab === 'join' ? (
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label">Enter 6-Letter Room Code</label>
                <input
                  type="text"
                  className="input-control"
                  style={{
                    fontSize: '1.4rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)'
                  }}
                  placeholder="e.g. 7K9X2B"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading || !joinCode.trim()}
              >
                <Play size={18} /> {loading ? 'Entering Room...' : 'Enter Match'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Arena Name</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Algorithms Finals Prep"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  maxLength={30}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Select Battle Mode</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div
                    onClick={() => setMode('QUIZ')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: mode === 'QUIZ' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                      border: `2px solid ${mode === 'QUIZ' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                      <HelpCircle size={16} color="var(--accent-cyan)" /> Quiz Trivia
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Timed MCQs with streak multipliers
                    </span>
                  </div>

                  <div
                    onClick={() => setMode('CODE_CLASH')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: mode === 'CODE_CLASH' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
                      border: `2px solid ${mode === 'CODE_CLASH' ? 'var(--accent-emerald)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                      <Code size={16} color="var(--accent-emerald)" /> Code Clash
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Live algorithmic coding battle
                    </span>
                  </div>
                </div>
              </div>

              {mode === 'QUIZ' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">Questions</label>
                    <select
                      className="input-control"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                    >
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Seconds / Q</label>
                    <select
                      className="input-control"
                      value={roundTimeSeconds}
                      onChange={(e) => setRoundTimeSeconds(Number(e.target.value))}
                    >
                      <option value={15}>15 Seconds</option>
                      <option value={25}>25 Seconds</option>
                      <option value={40}>40 Seconds</option>
                    </select>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="input-group">
                  <label className="input-label">Difficulty</label>
                  <select
                    className="input-control"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                  >
                    <option value="mixed">Mixed (All)</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Max Players</label>
                  <select
                    className="input-control"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  >
                    <option value={2}>2 Players (1v1)</option>
                    <option value={4}>4 Players</option>
                    <option value={8}>8 Players</option>
                    <option value={16}>16 Players</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success btn-lg"
                style={{ marginTop: '0.5rem' }}
                disabled={loading}
              >
                <Plus size={18} /> {loading ? 'Creating...' : 'Create & Host Arena'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Live Public Rooms Directory */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Public Lobbies</h2>
            </div>
            <span className="badge badge-cyan">{publicRooms.length} Online</span>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              overflowY: 'auto',
              maxHeight: '380px'
            }}
          >
            {publicRooms.length === 0 ? (
              <div
                style={{
                  margin: 'auto',
                  textAlign: 'center',
                  padding: '2.5rem 1rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <Users size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: 600 }}>No open public matches right now.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Create one on the left and invite your friends!
                </p>
              </div>
            ) : (
              publicRooms.map((r) => (
                <div
                  key={r.code}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                      {r.name}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem' }}>
                      <span className={r.mode === 'QUIZ' ? 'badge badge-cyan' : 'badge badge-easy'}>
                        {r.mode === 'QUIZ' ? 'Quiz Trivia' : 'Code Clash'}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>Host: {r.hostName}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Users size={14} />
                      <span>{r.playerCount}/{r.maxPlayers}</span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => joinRoom(r.code)}
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
