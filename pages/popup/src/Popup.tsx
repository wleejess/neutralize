import { AnalysisResultView } from './AnalysisResult';
import { AnnotatedText } from './AnnotatedText';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { useEffect, useRef, useState } from 'react';
import type { AnalysisResult, BackgroundStateMessage, ExtensionMessage } from '@extension/shared';
import type React from 'react';

type PopupState =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'no_api_key' }
  | { status: 'too_long' }
  | { status: 'result'; data: AnalysisResult; originalText: string }
  | { status: 'error'; message: string };

const Popup: React.FC = () => {
  const [state, setState] = useState<PopupState>({ status: 'empty' });
  const lastSelectedText = useRef<string>('');

  const applyBackgroundState = (bg: BackgroundStateMessage) => {
    switch (bg.status) {
      case 'empty':
        setState({ status: 'empty' });
        break;
      case 'loading':
        setState({ status: 'loading' });
        break;
      case 'no_api_key':
        setState({ status: 'no_api_key' });
        break;
      case 'too_long':
        setState({ status: 'too_long' });
        break;
      case 'result':
        lastSelectedText.current = bg.originalText;
        setState({ status: 'result', data: bg.data, originalText: bg.originalText });
        break;
      case 'error':
        setState({ status: 'error', message: bg.message });
        break;
    }
  };

  useEffect(() => {
    chrome.storage.local.get('apiKey', result => {
      if (!result['apiKey']) {
        setState({ status: 'no_api_key' });
        return;
      }
      chrome.runtime.sendMessage({ type: 'GET_CURRENT_STATE' }, (response: BackgroundStateMessage) => {
        if (chrome.runtime.lastError || !response) return;
        applyBackgroundState(response);
      });
    });

    const listener = (message: ExtensionMessage) => {
      switch (message.type) {
        case 'TEXT_SELECTED':
          lastSelectedText.current = message.text;
          setState({ status: 'loading' });
          break;
        case 'NO_API_KEY':
          setState({ status: 'no_api_key' });
          break;
        case 'SELECTION_TOO_LONG':
          setState({ status: 'too_long' });
          break;
        case 'ANALYSIS_RESULT':
          setState({ status: 'result', data: message.payload, originalText: lastSelectedText.current });
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

  if (state.status === 'empty') return <EmptyState onGearClick={openOptions} />;
  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'no_api_key') return <NoApiKeyState onSetup={openOptions} />;

  if (state.status === 'too_long') {
    return (
      <div style={centeredStyle}>
        <div style={statusLabelStyle}>SELECTION TOO LONG</div>
        <p style={bodyStyle}>Try highlighting 3–5 sentences for best results</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div style={centeredStyle}>
        <div style={{ ...statusLabelStyle, color: '#C87878' }}>ERROR</div>
        <p style={bodyStyle}>Something went wrong — try highlighting again.</p>
      </div>
    );
  }

  if (state.status === 'result') {
    return (
      <div style={resultContainerStyle}>
        <AnnotatedText text={state.originalText} annotations={state.data.annotations} />
        <div style={dividerStyle} />
        <AnalysisResultView data={state.data} />
      </div>
    );
  }

  return null;
};

const NoApiKeyState: React.FC<{ onSetup: () => void }> = ({ onSetup }) => (
  <div style={noKeyContainerStyle}>
    <div style={noKeyInnerStyle}>
      <div style={noKeyWordmarkStyle}>NEUTRALIZE</div>
      <div style={noKeyTaglineStyle}>Rewrite. Resolve. Neutralize.</div>
      <div style={noKeyCardStyle}>
        <div style={noKeyStepStyle}>
          <span style={noKeyStepNumStyle}>01</span>
          <span style={noKeyStepTextStyle}>
            Get a free API key at <span style={noKeyHighlightStyle}>console.anthropic.com</span>
          </span>
        </div>
        <div style={noKeyDividerStyle} />
        <div style={noKeyStepStyle}>
          <span style={noKeyStepNumStyle}>02</span>
          <span style={noKeyStepTextStyle}>Paste it in Settings, then highlight any text to analyze</span>
        </div>
      </div>
      <button style={noKeyButtonStyle} onClick={onSetup}>
        OPEN SETTINGS →
      </button>
    </div>
  </div>
);

const resultContainerStyle: React.CSSProperties = {
  backgroundColor: '#2A1F2E',
  padding: '20px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};
const dividerStyle: React.CSSProperties = { borderTop: '1px solid #4A3854' };
const centeredStyle: React.CSSProperties = {
  backgroundColor: '#2A1F2E',
  fontFamily: 'monospace',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
  minHeight: '200px',
};
const statusLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#A090B0',
  letterSpacing: '2px',
  fontFamily: 'monospace',
};
const bodyStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#C8B8D8',
  textAlign: 'center',
  lineHeight: '1.5',
  maxWidth: '280px',
  margin: 0,
  fontFamily: 'monospace',
};

const noKeyContainerStyle: React.CSSProperties = {
  backgroundColor: '#2A1F2E',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px 24px',
  fontFamily: 'monospace',
  minHeight: '200px',
};
const noKeyInnerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' };
const noKeyWordmarkStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#E8DDF0',
  letterSpacing: '4px',
};
const noKeyTaglineStyle: React.CSSProperties = {
  fontSize: '9px',
  color: '#C8885A',
  letterSpacing: '2px',
  borderLeft: '2px solid #C8885A',
  paddingLeft: '10px',
  marginTop: '-12px',
};
const noKeyCardStyle: React.CSSProperties = {
  backgroundColor: '#3A2A40',
  border: '1px solid #6A5478',
  borderRadius: '4px',
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};
const noKeyStepStyle: React.CSSProperties = { display: 'flex', gap: '12px', alignItems: 'flex-start' };
const noKeyStepNumStyle: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: '700',
  color: '#C8885A',
  letterSpacing: '1px',
  flexShrink: 0,
  paddingTop: '1px',
};
const noKeyStepTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#C8B8D8',
  lineHeight: '1.5',
  letterSpacing: '0.3px',
};
const noKeyHighlightStyle: React.CSSProperties = { color: '#E8DDF0' };
const noKeyDividerStyle: React.CSSProperties = { borderTop: '1px solid #4A3854' };
const noKeyButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 18px',
  backgroundColor: '#C8885A',
  color: '#2A1F2E',
  border: '1px solid #C8885A',
  borderRadius: '4px',
  fontSize: '11px',
  letterSpacing: '2px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontWeight: '700',
};

export default Popup;
