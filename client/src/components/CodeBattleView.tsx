import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useSocket } from '../context/SocketContext';
import { ExecutionResponse } from '../types';
import { Play, Send, RotateCcw, Clock, CheckCircle, XCircle, Terminal, AlertTriangle, Users, Award, Code2 } from 'lucide-react';

export const CodeBattleView: React.FC = () => {
  const { room, runCode, submitCode, sendTypingStatus, socket } = useSocket();
  const challenge = room?.currentChallenge;

  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<ExecutionResponse | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'description' | 'tests'>('description');

  // Load starter code on challenge/language change
  useEffect(() => {
    if (challenge?.starterCode) {
      setCode(challenge.starterCode[language]);
      setTestResult(null);
    }
  }, [challenge?.id, language]);

  // Sync timer
  useEffect(() => {
    if (!room?.roundEndTime) return;

    const interval = setInterval(() => {
      const remainingMs = Math.max(0, (room.roundEndTime || 0) - Date.now());
      const secs = Math.ceil(remainingMs / 1000);
      setTimeRemaining(secs);
    }, 250);

    return () => clearInterval(interval);
  }, [room?.roundEndTime]);

  if (!room || !challenge) return null;

  const handleEditorChange = (value: string | undefined) => {
    const val = value || '';
    setCode(val);
    const lines = val.split('\n').length;
    sendTypingStatus(lines, val.length);
  };

  const handleReset = () => {
    if (challenge.starterCode[language]) {
      setCode(challenge.starterCode[language]);
    }
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    const res = await runCode(language, code);
    setTestResult(res);
    setIsRunning(false);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const res = await submitCode(language, code);
    setTestResult(res);
    setIsSubmitting(false);
  };

  const myPlayer = room.players.find((p) => p.id === socket?.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', height: 'calc(100vh - 120px)' }}>
      {/* Top HUD: Opponent Progress & Timers */}
      <div
        className="card"
        style={{
          padding: '0.75rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-easy" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Code2 size={13} /> {challenge.title}
          </span>
          <span className={`badge badge-${challenge.difficulty}`}>{challenge.difficulty}</span>
        </div>

        {/* Live Opponents Progress Trackers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, justifyContent: 'center' }}>
          {room.players.map((p) => {
            const isMe = p.id === socket?.id;
            const progress = p.codeProgress || 0;
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  minWidth: '140px'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{p.avatar}</span>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span style={{ color: isMe ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
                      {p.username} {isMe && '(You)'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{progress}%</span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      marginTop: '2px'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: progress === 100 ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Countdown */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: timeRemaining <= 30 ? 'var(--accent-rose)' : 'var(--accent-cyan)',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <Clock size={18} />
          <span>
            {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: '1rem', flex: 1, minHeight: 0 }}>
        {/* Left Pane: Challenge Statement & Test Cases */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 0
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-card-subtle)',
              borderBottom: '1px solid var(--border-color)',
              padding: '0.25rem 0.5rem'
            }}
          >
            <button
              className="btn btn-sm"
              style={{
                background: activeTab === 'description' ? 'var(--bg-input)' : 'transparent',
                color: activeTab === 'description' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: activeTab === 'tests' ? 'var(--bg-input)' : 'transparent',
                color: activeTab === 'tests' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('tests')}
            >
              Test Cases ({challenge.testCases.filter((tc) => !tc.isHidden).length})
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
            {activeTab === 'description' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    {challenge.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                    {challenge.description}
                  </p>
                </div>

                {/* Examples */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Examples
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {challenge.examples.map((ex, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ marginBottom: '0.25rem' }}>
                          <strong style={{ color: 'var(--accent-cyan)' }}>Input:</strong>{' '}
                          <code style={{ fontFamily: 'var(--font-mono)' }}>{ex.input}</code>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--accent-emerald)' }}>Output:</strong>{' '}
                          <code style={{ fontFamily: 'var(--font-mono)' }}>{ex.output}</code>
                        </div>
                        {ex.explanation && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Constraints
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {challenge.constraints.map((c, i) => (
                      <li key={i}>
                        <code style={{ fontFamily: 'var(--font-mono)' }}>{c}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {challenge.testCases
                  .filter((tc) => !tc.isHidden)
                  .map((tc, idx) => (
                    <div
                      key={tc.id}
                      style={{
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--accent-cyan)' }}>
                        Case {idx + 1} {tc.description && `(${tc.description})`}
                      </div>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Input: </span>
                        <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{tc.input}</code>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Expected: </span>
                        <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>{tc.expectedOutput}</code>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Monaco Code Editor & Test Runner Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: 0 }}>
          {/* Editor Header Bar */}
          <div
            className="card"
            style={{
              padding: '0.5rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select
                className="input-control"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
              </select>

              <button
                className="btn btn-secondary btn-sm"
                onClick={handleReset}
                title="Reset to starter template"
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleRunTests}
                disabled={isRunning || isSubmitting}
              >
                <Play size={14} /> {isRunning ? 'Running...' : 'Run Tests'}
              </button>

              <button
                className="btn btn-success btn-sm"
                onClick={handleFinalSubmit}
                disabled={isRunning || isSubmitting}
              >
                <Send size={14} /> {isSubmitting ? 'Submitting...' : 'Submit Solution'}
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div
            style={{
              flex: 1,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              background: '#1e1e1e',
              minHeight: '280px'
            }}
          >
            <Editor
              height="100%"
              language={language === 'javascript' ? 'javascript' : 'python'}
              value={code}
              theme="vs-dark"
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          </div>

          {/* Bottom Test Case Execution Output Console */}
          {testResult && (
            <div
              className="card"
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '0.75rem 1rem',
                borderLeft: `4px solid ${testResult.allPassed ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Terminal size={14} color="var(--accent-cyan)" />
                  <span>
                    Test Results: {testResult.passedTests} / {testResult.totalTests} Passed
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {testResult.executionTimeMs}ms
                </span>
              </div>

              {testResult.compilerError ? (
                <div
                  style={{
                    color: 'var(--accent-rose)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    background: 'rgba(244, 63, 94, 0.1)',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {testResult.compilerError}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {testResult.results.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.35rem 0.5rem',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {r.passed ? (
                          <CheckCircle size={14} color="var(--accent-emerald)" />
                        ) : (
                          <XCircle size={14} color="var(--accent-rose)" />
                        )}
                        <span>
                          Case {i + 1} {r.isHidden && '(Hidden)'}
                        </span>
                      </div>

                      {!r.isHidden && !r.passed && (
                        <div style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>
                          Expected: {r.expectedOutput} | Got: {r.actualOutput}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
