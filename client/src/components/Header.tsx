import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { sound } from '../utils/sound';
import { Volume2, VolumeX, Swords, Wifi, WifiOff, Edit3, Check } from 'lucide-react';

export const Header: React.FC = () => {
  const { isConnected, currentUser, setUsername, setAvatar, room, leaveRoom } = useSocket();
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempName, setTempName] = useState(currentUser.username);
  const [tempAvatar, setTempAvatar] = useState(currentUser.avatar);

  const AVATARS = ['⚡', '👾', '🚀', '🔥', '💻', '🦊', '🧠', '🛡️', '⚔️', '🎯'];

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUsername(tempName.trim());
      setAvatar(tempAvatar);
      setIsEditingUser(false);
    }
  };

  return (
    <header className="navbar">
      <div className="brand" onClick={() => room && leaveRoom()}>
        <div className="brand-icon">
          <Swords size={20} />
        </div>
        <div>
          BIT<span>BATTLE</span>
        </div>
      </div>

      <div className="nav-actions">
        {/* Connection status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            color: isConnected ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            fontWeight: 600
          }}
        >
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          className="btn-icon"
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* User profile toggle */}
        <div className="user-badge" onClick={() => setIsEditingUser(true)}>
          <span className="user-avatar">{currentUser.avatar}</span>
          <span style={{ fontWeight: 600 }}>{currentUser.username}</span>
          <Edit3 size={12} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* User profile modal */}
      {isEditingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
          onClick={() => setIsEditingUser(false)}
        >
          <div
            className="card"
            style={{ width: '360px', maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 700 }}>
              Edit Player Profile
            </h3>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Avatar</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {AVATARS.map((av) => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setTempAvatar(av)}
                      style={{
                        fontSize: '1.4rem',
                        background: tempAvatar === av ? 'var(--border-accent)' : 'var(--bg-input)',
                        border: `1px solid ${tempAvatar === av ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        width: '42px',
                        height: '42px',
                        cursor: 'pointer'
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Username</label>
                <input
                  type="text"
                  className="input-control"
                  value={tempName}
                  maxLength={16}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter username"
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setIsEditingUser(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Check size={16} /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
