import React, { useEffect, useState } from 'react';

const MESSAGES = [
  'Tinkering...',
  'Analyzing...',
  'Noodling...',
  'Reading between the lines...',
  'Unpacking the language...',
];

export const LoadingState: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(i => (i + 1) % MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.barTrack}>
        <div style={styles.barFill} />
      </div>
      <p style={styles.message}>{MESSAGES[messageIndex]}</p>
      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
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
    backgroundColor: '#e8dfe0',
    fontFamily: "'Instrument Sans', sans-serif",
    gap: '16px',
    padding: '24px',
  },
  barTrack: {
    width: '200px',
    height: '4px',
    backgroundColor: 'rgba(143, 91, 52, 0.2)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  barFill: {
    width: '50%',
    height: '100%',
    backgroundColor: '#8f5b34',
    borderRadius: '2px',
    animation: 'slide 1.2s ease-in-out infinite',
  },
  message: {
    fontSize: '14px',
    color: '#6b4c3b',
    margin: '0',
    fontStyle: 'italic',
  },
};
