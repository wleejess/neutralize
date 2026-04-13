import { WordTooltip } from './WordTooltip';
import { createRef, useRef, useState } from 'react';
import type { Annotation } from '@extension/shared';
import type React from 'react';

interface AnnotatedTextProps {
  text: string;
  annotations: Annotation[];
}

// NTZ v2 Warm Mauve — rhetoric tokens (ntz-v2-tokens.json v2.5.0, dark theme)
const LAYER_TOKENS: Record<string, { bg: string; text: string; cue: string; label: string }> = {
  amplification: { bg: '#3A2808', text: '#E8B86D', cue: 'underline 2px solid #E8B86D', label: 'AMPLIFICATION' },
  emotion: { bg: '#1C2A38', text: '#7BAFD4', cue: 'none', label: 'EMOTION' },
  loaded_language: { bg: '#301828', text: '#C48BB8', cue: 'underline 2px dotted #C48BB8', label: 'LOADED LANGUAGE' },
  hedging: { bg: '#1C2418', text: '#90B878', cue: 'underline 2px dashed #90B878', label: 'HEDGING' },
  presupposition: { bg: '#281630', text: '#A88CC8', cue: 'underline 2px solid #A88CC8', label: 'PRESUPPOSITION' },
  call_to_action: { bg: '#301E14', text: '#E8906A', cue: 'underline 3px double #E8906A', label: 'CALL TO ACTION' },
};

const buildCharAnnotationMap = (text: string, annotations: Annotation[]): Map<number, number[]> => {
  const map = new Map<number, number[]>();
  annotations.forEach((annotation, annotationIndex) => {
    let searchFrom = 0;
    while (true) {
      const idx = text.indexOf(annotation.text, searchFrom);
      if (idx === -1) break;
      for (let i = idx; i < idx + annotation.text.length; i++) {
        const existing = map.get(i) ?? [];
        if (!existing.includes(annotationIndex)) {
          existing.push(annotationIndex);
          map.set(i, existing);
        }
      }
      searchFrom = idx + 1;
    }
  });
  return map;
};

interface Segment {
  text: string;
  annotationIndices: number[];
}

const buildSegments = (text: string, charMap: Map<number, number[]>): Segment[] => {
  const segments: Segment[] = [];
  let i = 0;
  while (i < text.length) {
    const current = charMap.get(i) ?? [];
    let j = i + 1;
    while (j < text.length) {
      const next = charMap.get(j) ?? [];
      if (current.length === next.length && current.every((v, idx) => v === next[idx])) j++;
      else break;
    }
    segments.push({ text: text.slice(i, j), annotationIndices: current });
    i = j;
  }
  return segments;
};

const AnnotatedText: React.FC<AnnotatedTextProps> = ({ text, annotations }) => {
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);
  const spanRefs = useRef<Map<number, React.RefObject<HTMLSpanElement | null>>>(new Map());

  annotations.forEach((ann, i) => {
    if (!text.includes(ann.text)) {
      console.warn(`[AnnotatedText] Annotation ${i} not found: "${ann.text}"`);
    }
  });

  const charMap = buildCharAnnotationMap(text, annotations);
  const segments = buildSegments(text, charMap);

  const getOrCreateRef = (idx: number): React.RefObject<HTMLSpanElement | null> => {
    if (!spanRefs.current.has(idx)) spanRefs.current.set(idx, createRef<HTMLSpanElement>());
    return spanRefs.current.get(idx)!;
  };

  const getSpanStyle = (annotationIndices: number[]): React.CSSProperties => {
    if (annotationIndices.length === 0) return {};
    const activeLayers = new Set<string>();
    annotationIndices.forEach(i => {
      Object.entries(annotations[i].layers).forEach(([key, val]) => {
        if (val !== null) activeLayers.add(key);
      });
    });
    const layerList = Array.from(activeLayers);
    if (layerList.length === 0) return {};
    const primary = LAYER_TOKENS[layerList[0]];
    if (layerList.length === 1) {
      return {
        backgroundColor: primary.bg,
        color: primary.text,
        textDecoration: primary.cue,
        cursor: 'pointer',
        padding: '1px 3px',
        borderRadius: '2px',
      };
    }
    const gradColors = layerList.map(l => LAYER_TOKENS[l]?.bg ?? '#333').join(', ');
    return {
      background: `linear-gradient(135deg, ${gradColors})`,
      color: primary.text,
      textDecoration: primary.cue,
      cursor: 'pointer',
      padding: '1px 3px',
      borderRadius: '2px',
    };
  };

  const presentLayers = new Set<string>();
  annotations.forEach(ann => {
    Object.entries(ann.layers).forEach(([key, val]) => {
      if (val !== null) presentLayers.add(key);
    });
  });

  return (
    <div style={containerStyle}>
      <div style={textStyle}>
        {segments.map((seg, segIdx) => {
          if (seg.annotationIndices.length === 0) {
            return (
              <span key={segIdx} style={{ color: '#C8B8D8' }}>
                {seg.text}
              </span>
            );
          }
          const primaryIndex = seg.annotationIndices[0];
          const spanRef = getOrCreateRef(primaryIndex);
          return (
            <span
              key={segIdx}
              ref={spanRef}
              role="button"
              tabIndex={0}
              style={getSpanStyle(seg.annotationIndices)}
              onClick={() => setActiveTooltipIndex(prev => (prev === primaryIndex ? null : primaryIndex))}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ')
                  setActiveTooltipIndex(prev => (prev === primaryIndex ? null : primaryIndex));
              }}>
              {seg.text}
              {activeTooltipIndex === primaryIndex && (
                <WordTooltip
                  annotation={annotations[primaryIndex]}
                  anchorRef={spanRef}
                  onDismiss={() => setActiveTooltipIndex(null)}
                />
              )}
            </span>
          );
        })}
      </div>

      {presentLayers.size > 0 && (
        <div style={legendStyle}>
          {Object.entries(LAYER_TOKENS)
            .filter(([key]) => presentLayers.has(key))
            .map(([key, token]) => (
              <div key={key} style={legendItemStyle}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    backgroundColor: token.text,
                    marginRight: '7px',
                    flexShrink: 0,
                    borderRadius: '2px',
                  }}
                />
                <span style={{ fontSize: '9px', color: '#A090B0', letterSpacing: '1.5px', fontFamily: 'monospace' }}>
                  {token.label}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

const containerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px' };
const textStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.8',
  color: '#C8B8D8',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};
const legendStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  padding: '10px 12px',
  backgroundColor: '#3A2A40',
  border: '1px solid #6A5478',
};
const legendItemStyle: React.CSSProperties = { display: 'flex', alignItems: 'center' };

export { AnnotatedText };
