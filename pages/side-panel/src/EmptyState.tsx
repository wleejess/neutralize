import React from 'react';

interface EmptyStateProps {
  onGearClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onGearClick }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Neutralize</h1>
        <p style={styles.tagline}>See through the language. Understand what you're really reading.</p>

        <div style={styles.steps}>
          <p style={styles.stepsTitle}>How to use:</p>
          <ol style={styles.list}>
            <li style={styles.listItem}>Click the toolbar icon to open this panel</li>
            <li style={styles.listItem}>Highlight 3–5 sentences on any article</li>
            <li style={styles.listItem}>See the rhetorical breakdown + neutral rewrite</li>
          </ol>
          <p style={styles.note}>For best results, highlight 3–5 sentences at a time</p>
        </div>
      </div>

      <button style={styles.gearButton} onClick={onGearClick} title="Open settings">
        ⚙
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '24px',
    backgroundColor: '#e8dfe0',
    fontFamily: "'Instrument Sans', sans-serif",
    position: 'relative',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#3a2218',
    margin: '0 0 8px 0',
  },
  tagline: {
    fontSize: '14px',
    color: '#6b4c3b',
    margin: '0 0 32px 0',
    lineHeight: '1.5',
  },
  steps: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: '8px',
    padding: '16px',
  },
  stepsTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#3a2218',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  list: {
    margin: '0 0 12px 0',
    paddingLeft: '20px',
  },
  listItem: {
    fontSize: '14px',
    color: '#4a3228',
    marginBottom: '6px',
    lineHeight: '1.4',
  },
  note: {
    fontSize: '12px',
    color: '#8f6b5a',
    margin: '0',
    fontStyle: 'italic',
  },
  gearButton: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#8f6b5a',
    padding: '4px',
    lineHeight: '1',
  },
};
