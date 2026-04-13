import type React from 'react';

interface EmptyStateProps {
  onGearClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onGearClick }) => (
  <div style={styles.container}>
    <div style={styles.content}>
      <div style={styles.wordmark}>NEUTRALIZE</div>
      <div style={styles.tagline}>Rewrite. Resolve. Neutralize.</div>
      <div style={styles.card}>
        <div style={styles.cardLabel}>// HOW TO USE</div>
        <ol style={styles.list}>
          <li style={styles.listItem}>Click the toolbar icon to open this panel</li>
          <li style={styles.listItem}>Highlight 3–5 sentences on any article</li>
          <li style={styles.listItem}>See the rhetorical breakdown + neutral rewrite</li>
        </ol>
        <div style={styles.note}>For best results, highlight 3–5 sentences at a time</div>
      </div>
    </div>
    <button style={styles.gearButton} onClick={onGearClick} title="Open settings">
      ⚙
    </button>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '24px',
    backgroundColor: '#2A1F2E',
    fontFamily: 'monospace',
    position: 'relative',
  },
  content: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  wordmark: { fontSize: '22px', fontWeight: '700', color: '#E8DDF0', letterSpacing: '4px', margin: '0 0 4px 0' },
  tagline: {
    fontSize: '9px',
    color: '#C8885A',
    letterSpacing: '2px',
    borderLeft: '2px solid #C8885A',
    paddingLeft: '10px',
    margin: '0 0 28px 0',
  },
  card: { backgroundColor: '#3A2A40', border: '1px solid #6A5478', borderRadius: '4px', padding: '16px' },
  cardLabel: { fontSize: '9px', fontWeight: '700', color: '#6A5478', letterSpacing: '2px', margin: '0 0 12px 0' },
  list: { margin: '0 0 12px 0', paddingLeft: '18px' },
  listItem: { fontSize: '12px', color: '#C8B8D8', marginBottom: '6px', lineHeight: '1.5', letterSpacing: '0.3px' },
  note: { fontSize: '10px', color: '#A090B0', letterSpacing: '0.5px', fontStyle: 'italic' },
  gearButton: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#6A5478',
    padding: '4px',
    lineHeight: '1',
    fontFamily: 'monospace',
  },
};

export { EmptyState };
