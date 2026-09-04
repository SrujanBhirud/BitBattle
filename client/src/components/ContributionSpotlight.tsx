import React from 'react';
import { GitBranch, Sparkles, Trophy } from 'lucide-react';

const highlights = [
  {
    label: 'Practice Sprint',
    value: '5 min',
    detail: 'Warm up with a quick algorithm drill.'
  },
  {
    label: 'Challenge Streak',
    value: '3 days',
    detail: 'Keep your puzzle rhythm going.'
  },
  {
    label: 'Team Boost',
    value: '2x',
    detail: 'Invite friends for a co-op match.'
  }
];

export const ContributionSpotlight: React.FC = () => {
  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, rgba(11, 18, 30, 0.95), rgba(27, 39, 56, 0.9))',
        borderColor: 'rgba(16, 185, 129, 0.25)',
        padding: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(16, 185, 129, 0.14)',
            color: 'var(--accent-emerald)'
          }}
        >
          <Sparkles size={18} />
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Community Boost
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Contribution Corner</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
        {highlights.map((item) => (
          <div
            key={item.label}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              minHeight: '120px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              {item.label === 'Practice Sprint' ? <GitBranch size={14} /> : item.label === 'Challenge Streak' ? <Trophy size={14} /> : <Sparkles size={14} />}
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{item.label}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
              {item.value}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.detail}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '1rem',
          padding: '0.9rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          color: 'var(--text-secondary)',
          fontSize: '0.82rem',
          lineHeight: 1.6
        }}
      >
        Fresh suggestion: add a daily challenge tracker, a remixable quiz pack, or a local leaderboard for future contributors.
      </div>
    </div>
  );
};
