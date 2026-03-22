import React, { useEffect, useState } from 'react';
import type { AnalysisResult, ExtensionMessage } from '@extension/shared';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';

type PanelState =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'no_api_key' }
  | { status: 'too_long' }
  | { status: 'result'; data: AnalysisResult }
  | { status: 'error'; message: string };

const SidePanel: React.FC = () => {
  const [state, setState] = useState<PanelState>({ status: 'empty' });

  useEffect(() => {
    const listener = (message: ExtensionMessage) => {
      switch (message.type) {
        case 'TEXT_SELECTED':
          setState({ status: 'loading' });
          break;
        case 'NO_API_KEY':
          setState({ status: 'no_api_key' });
          break;
        case 'SELECTION_TOO_LONG':
          setState({ status: 'too_long' });
          break;
        case 'ANALYSIS_RESULT':
          setState({ status: 'result', data: message.payload });
          break;
        case 'ANALYSIS_ERROR':
          setState({ status: 'error', message: message.message });
          break;
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const openOptions = () => chrome.runtime.openOptionsPage();

  if (state.status === 'empty') {
    return <EmptyState onGearClick={openOptions} />;
  }

  if (state.status === 'loading') {
    return <LoadingState />;
  }

  // Placeholder renders for states built in later steps
  const containerStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: '#e8dfe0',
    fontFamily: "'Instrument Sans', sans-serif",
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#3a2218',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#4a3228',
    textAlign: 'center' as const,
    lineHeight: '1.5',
    maxWidth: '280px',
  };

  const buttonStyle: React.CSSProperties = {
    marginTop: '8px',
    padding: '8px 16px',
    backgroundColor: '#8f5b34',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Instrument Sans', sans-serif",
  };

  if (state.status === 'no_api_key') {
    return (
      <div style={containerStyle}>
        <p style={labelStyle}>API Key Required</p>
        <p style={textStyle}>Add your Claude API key to get started</p>
        <button style={buttonStyle} onClick={openOptions}>Open Settings</button>
      </div>
    );
  }

  if (state.status === 'too_long') {
    return (
      <div style={containerStyle}>
        <p style={labelStyle}>Selection Too Long</p>
        <p style={textStyle}>Try highlighting 3–5 sentences for the best results</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div style={containerStyle}>
        <p style={labelStyle}>Something went wrong</p>
        <p style={textStyle}>Something went wrong — try highlighting again.</p>
      </div>
    );
  }

  if (state.status === 'result') {
    return (
      <div style={containerStyle}>
        <p style={labelStyle}>Analysis ready</p>
        <p style={textStyle}>Result received — AnnotatedText + AnalysisResult components coming in step 6–7.</p>
      </div>
    );
  }

  return null;
};

export default SidePanel;
