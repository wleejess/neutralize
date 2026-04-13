import type { AnalysisResult } from '@extension/shared';
import type React from 'react';

interface AnalysisResultProps {
  data: AnalysisResult;
}

const AnalysisResultView: React.FC<AnalysisResultProps> = ({ data }) => {
  if (data.is_factual) {
    return (
      <div style={shellStyle}>
        <div style={labelStyle}>FACTUAL</div>
        <p style={bodyStyle}>No rhetorical devices detected. This appears to be a straightforward factual statement.</p>
      </div>
    );
  }

  if (!data.neutral_rewrite) {
    return (
      <div style={shellStyle}>
        <div style={labelStyle}>SUBJECTIVE / SPECULATIVE</div>
        <p style={bodyStyle}>{data.not_neutralizable_reason}</p>
        <p style={noteStyle}>This statement reflects opinion or speculation and cannot be made fully objective.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={resolvedShellStyle}>
        <div style={resolvedLabelStyle}>RESOLVED · NEUTRAL REWRITE</div>
        <p style={rewriteStyle}>{data.neutral_rewrite}</p>
      </div>
      {data.rewrite_explanation && (
        <div style={shellStyle}>
          <div style={labelStyle}>REWRITE EXPLANATION</div>
          <p style={bodyStyle}>{data.rewrite_explanation}</p>
        </div>
      )}
    </div>
  );
};

// v2 warm mauve surface/border
const shellStyle: React.CSSProperties = {
  backgroundColor: '#3A2A40',
  border: '1px solid #6A5478',
  borderRadius: '4px',
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

// resolved: v2 token bg #143028, text #6ABFAA
const resolvedShellStyle: React.CSSProperties = {
  backgroundColor: '#143028',
  border: '1px solid #6ABFAA',
  borderRadius: '4px',
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: '700',
  color: '#A090B0',
  letterSpacing: '1.5px',
  fontFamily: 'monospace',
};

const resolvedLabelStyle: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: '700',
  color: '#6ABFAA',
  letterSpacing: '1.5px',
  fontFamily: 'monospace',
};

const rewriteStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#E8DDF0',
  lineHeight: '1.65',
  margin: 0,
  fontStyle: 'italic',
};

const bodyStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#C8B8D8',
  lineHeight: '1.6',
  margin: 0,
};

const noteStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#A090B0',
  lineHeight: '1.4',
  margin: 0,
  fontStyle: 'italic',
};

export { AnalysisResultView };
