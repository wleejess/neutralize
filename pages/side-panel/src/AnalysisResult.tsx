import React from 'react';
import type { AnalysisResult } from '@extension/shared';

interface AnalysisResultProps {
  data: AnalysisResult;
}

export const AnalysisResultView: React.FC<AnalysisResultProps> = ({ data }) => {
  if (data.is_factual) {
    return (
      <div style={shellStyle}>
        <div style={labelStyle}>Factual statement</div>
        <p style={bodyStyle}>
          This appears to be a straightforward factual statement. No rhetorical devices detected.
        </p>
      </div>
    );
  }

  if (!data.neutral_rewrite) {
    return (
      <div style={shellStyle}>
        <div style={labelStyle}>Subjective / Speculative</div>
        <p style={bodyStyle}>{data.not_neutralizable_reason}</p>
        <p style={noteStyle}>
          This statement reflects the author's opinion or speculation and cannot be made objective.
        </p>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <div style={labelStyle}>Neutral rewrite</div>
      <p style={rewriteStyle}>{data.neutral_rewrite}</p>
      {data.rewrite_explanation && (
        <p style={bodyStyle}>{data.rewrite_explanation}</p>
      )}
    </div>
  );
};

const shellStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.6)',
  borderRadius: '8px',
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#8f5b34',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};

const rewriteStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#3a2218',
  lineHeight: '1.6',
  margin: 0,
  fontStyle: 'italic',
};

const bodyStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#4a3228',
  lineHeight: '1.5',
  margin: 0,
};

const noteStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8f6b5a',
  lineHeight: '1.4',
  margin: 0,
  fontStyle: 'italic',
};
