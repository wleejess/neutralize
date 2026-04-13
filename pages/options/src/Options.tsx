import { useState, useEffect } from 'react';

const Options = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get('apiKey', result => {
      if (result.apiKey) {
        setApiKey(result.apiKey);
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({ apiKey }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.wordmark}>NEUTRALIZE</div>
        <div style={styles.subtitle}>// SETTINGS</div>

        <label style={styles.label} htmlFor="apiKey">
          ANTHROPIC API KEY
        </label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          style={styles.input}
        />

        <p style={styles.hint}>
          Get your key at{' '}
          <a
            href="https://console.anthropic.com/settings/api-keys"
            target="_blank"
            rel="noreferrer"
            style={styles.link}>
            console.anthropic.com
          </a>
        </p>

        <button onClick={handleSave} style={styles.button}>
          SAVE KEY
        </button>

        {saved && <p style={styles.confirmation}>✓ API key saved</p>}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#2A1F2E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'monospace',
  },
  card: {
    backgroundColor: '#3A2A40',
    border: '1px solid #6A5478',
    borderRadius: '4px',
    padding: '40px 48px',
    width: '420px',
  },
  wordmark: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#E8DDF0',
    letterSpacing: '4px',
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: '9px',
    color: '#C8885A',
    letterSpacing: '2px',
    borderLeft: '2px solid #C8885A',
    paddingLeft: '10px',
    margin: '0 0 32px',
  },
  label: {
    display: 'block',
    fontSize: '9px',
    fontWeight: '700',
    color: '#A090B0',
    letterSpacing: '1.5px',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '11px',
    border: '1px solid #6A5478',
    borderRadius: '4px',
    backgroundColor: '#2A1F2E',
    color: '#E8DDF0',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'monospace',
    letterSpacing: '1px',
  },
  hint: {
    fontSize: '11px',
    color: '#A090B0',
    margin: '8px 0 24px',
    letterSpacing: '0.5px',
  },
  link: {
    color: '#C8885A',
    textDecoration: 'none',
  },
  button: {
    backgroundColor: '#C8885A',
    color: '#2A1F2E',
    border: '1px solid #C8885A',
    borderRadius: '4px',
    padding: '9px 24px',
    fontSize: '11px',
    letterSpacing: '2px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  confirmation: {
    marginTop: '12px',
    fontSize: '10px',
    color: '#6ABFAA',
    letterSpacing: '1px',
  },
};

export default Options;
