import { useEffect, useState } from 'react';
import type React from 'react';

const MESSAGES = ['ANALYZING...', 'DETECTING BIAS...', 'MAPPING RHETORIC...', 'RESOLVING...', 'NEUTRALIZING...'];

const LoadingState: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setMessageIndex(i => (i + 1) % MESSAGES.length), 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.barTrack}>
        <div style={styles.barFill} />
      </div>
      <p style={styles.message}>{MESSAGES[messageIndex]}</p>
      <style>{`@keyframes ntz-slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }`}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: '#2A1F2E',
    fontFamily: 'monospace',
    gap: '14px',
    padding: '24px',
  },
  barTrack: { width: '180px', height: '3px', backgroundColor: '#3A2A40', overflow: 'hidden', borderRadius: '2px' },
  barFill: {
    width: '50%',
    height: '100%',
    backgroundColor: '#C8885A',
    animation: 'ntz-slide 1.2s ease-in-out infinite',
    borderRadius: '2px',
  },
  message: { fontSize: '9px', color: '#A090B0', margin: '0', letterSpacing: '2px' },
};

export { LoadingState };
