import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Send, MessageSquare, Flame, Rocket, ThumbsUp, Zap, Skull, Smile } from 'lucide-react';

export const ChatPanel: React.FC = () => {
  const { room, sendChat, sendReaction, reactions } = useSocket();
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const EMOJI_REACTIONS = ['🔥', '🚀', '⚡', '🧠', '💀', '🎉', '💯', '👏'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages]);

  if (!room) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendChat(inputText.trim());
      setInputText('');
    }
  };

  return (
    <>
      {/* Reaction floating bubbles */}
      <div className="reaction-overlay">
        {reactions.map((r) => (
          <div key={r.id} className="reaction-bubble">
            <span>{r.emoji}</span>
            <span className="reaction-sender">{r.username}</span>
          </div>
        ))}
      </div>

      {/* Chat toggle button on mobile / overlay */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.75rem'
        }}
      >
        {/* Quick Reactions Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '0.35rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-elevated)'
          }}
        >
          {EMOJI_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '0.2rem',
                transition: 'transform 0.1s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Chat Drawer / Widget */}
        <div
          style={{
            width: isOpen ? '340px' : 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-elevated)',
            overflow: 'hidden',
            transition: 'all 0.25s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.65rem 1rem',
              background: 'var(--bg-card-subtle)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <MessageSquare size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span>Match Chat</span>
              {room.messages.length > 0 && (
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  {room.messages.length}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isOpen ? 'Minimize' : 'Open'}
            </span>
          </div>

          {/* Body */}
          {isOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '300px' }}>
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                {room.messages.length === 0 ? (
                  <div
                    style={{
                      margin: 'auto',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem'
                    }}
                  >
                    No messages yet. Send a message to fellow combatants!
                  </div>
                ) : (
                  room.messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: m.type === 'system' ? 'center' : 'flex-start',
                        background: m.type === 'system' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-input)',
                        padding: '0.4rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        border: m.type === 'system' ? '1px dashed var(--border-color)' : 'none'
                      }}
                    >
                      {m.type !== 'system' && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'var(--accent-cyan)',
                            marginBottom: '0.15rem'
                          }}
                        >
                          <span>{m.avatar}</span>
                          <span>{m.senderName}</span>
                        </div>
                      )}
                      <div
                        style={{
                          color: m.type === 'system' ? 'var(--text-secondary)' : 'var(--text-primary)',
                          fontStyle: m.type === 'system' ? 'italic' : 'normal',
                          wordBreak: 'break-word'
                        }}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                style={{
                  display: 'flex',
                  borderTop: '1px solid var(--border-color)',
                  background: 'var(--bg-card-subtle)',
                  padding: '0.4rem'
                }}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.5rem'
                  }}
                  maxLength={100}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  style={{
                    background: 'var(--accent-cyan)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: '#000',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputText.trim() ? 'pointer' : 'default',
                    opacity: inputText.trim() ? 1 : 0.4
                  }}
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
