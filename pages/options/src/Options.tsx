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
        <h1 style={styles.title}>Neutralize</h1>
        <p style={styles.subtitle}>Settings</p>

        <label style={styles.label} htmlFor="apiKey">
          Anthropic API Key
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
          Save
        </button>

        {saved && <p style={styles.confirmation}>API key saved</p>}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#e8dfe0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Instrument Sans', sans-serif",
  },
  card: {
    backgroundColor: '#f5efef',
    borderRadius: '12px',
    padding: '40px 48px',
    width: '400px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '22px',
    fontWeight: 600,
    color: '#3b2a2a',
  },
  subtitle: {
    margin: '0 0 28px',
    fontSize: '14px',
    color: '#7a5c5c',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#3b2a2a',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #c9b8b8',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#3b2a2a',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Instrument Sans', sans-serif",
  },
  hint: {
    fontSize: '12px',
    color: '#7a5c5c',
    margin: '8px 0 20px',
  },
  link: {
    color: '#8f5b34',
  },
  button: {
    backgroundColor: '#8f5b34',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Instrument Sans', sans-serif",
  },
  confirmation: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#5a7a4a',
  },
};

export default Options;
