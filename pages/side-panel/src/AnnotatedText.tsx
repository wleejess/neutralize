import React, { useRef, useState } from 'react';
import type { Annotation } from '@extension/shared';
import { WordTooltip } from './WordTooltip';

interface AnnotatedTextProps {
  text: string;
  annotations: Annotation[];
}

const LAYER_COLORS: Record<string, string> = {
  appeals: '#dab692',
  structural: '#8a9ea7',
  meaning: '#8d9b6a',
};

const LAYER_LABELS: Record<string, string> = {
  appeals: 'Rhetorical Appeals',
  structural: 'Structural Devices',
  meaning: 'Meaning / Connotation',
};

// Build a character-level map: index → set of active annotation indices
function buildCharAnnotationMap(text: string, annotations: Annotation[]): Map<number, number[]> {
  const map = new Map<number, number[]>();

  annotations.forEach((annotation, annotationIndex) => {
    const { text: annotText } = annotation;
    let searchFrom = 0;
    // Find all occurrences of annotText in text
    while (true) {
      const idx = text.indexOf(annotText, searchFrom);
      if (idx === -1) break;
      for (let i = idx; i < idx + annotText.length; i++) {
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
}

// Merge consecutive characters with the same annotation set into spans
interface Segment {
  text: string;
  annotationIndices: number[];
}

function buildSegments(text: string, charMap: Map<number, number[]>): Segment[] {
  const segments: Segment[] = [];
  let i = 0;

  while (i < text.length) {
    const current = charMap.get(i) ?? [];
    let j = i + 1;
    while (j < text.length) {
      const next = charMap.get(j) ?? [];
      if (
        current.length === next.length &&
        current.every((v, idx) => v === next[idx])
      ) {
        j++;
      } else {
        break;
      }
    }
    segments.push({ text: text.slice(i, j), annotationIndices: current });
    i = j;
  }

  return segments;
}

export const AnnotatedText: React.FC<AnnotatedTextProps> = ({ text, annotations }) => {
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);
  const spanRefs = useRef<Map<number, React.RefObject<HTMLSpanElement | null>>>(new Map());

  // Validate annotations — warn if any can't be found in original text
  annotations.forEach((ann, i) => {
    if (!text.includes(ann.text)) {
      console.warn(`[AnnotatedText] Annotation ${i} text not found in original: "${ann.text}"`);
    }
  });

  const charMap = buildCharAnnotationMap(text, annotations);
  const segments = buildSegments(text, charMap);

  const getOrCreateRef = (annotationIndex: number): React.RefObject<HTMLSpanElement | null> => {
    if (!spanRefs.current.has(annotationIndex)) {
      spanRefs.current.set(annotationIndex, React.createRef<HTMLSpanElement>());
    }
    return spanRefs.current.get(annotationIndex)!;
  };

  const handleSpanClick = (annotationIndex: number) => {
    setActiveTooltipIndex(prev => (prev === annotationIndex ? null : annotationIndex));
  };

  // Build inline styles for a segment based on its active annotation layers
  const getSpanStyle = (annotationIndices: number[]): React.CSSProperties => {
    if (annotationIndices.length === 0) return {};

    // Collect active layers across all annotations for this segment
    const activeLayers = new Set<string>();
    annotationIndices.forEach(i => {
      const ann = annotations[i];
      if (ann.layers.appeals) activeLayers.add('appeals');
      if (ann.layers.structural) activeLayers.add('structural');
      if (ann.layers.meaning) activeLayers.add('meaning');
    });

    const layerList = Array.from(activeLayers);

    if (layerList.length === 1) {
      return {
        backgroundColor: LAYER_COLORS[layerList[0]] + '55',
        borderBottom: `2px solid ${LAYER_COLORS[layerList[0]]}`,
        cursor: 'pointer',
        borderRadius: '2px',
        padding: '0 1px',
      };
    }

    // Multiple layers: use gradient background and stacked underlines
    const gradientColors = layerList.map(l => LAYER_COLORS[l] + '55').join(', ');
    return {
      background: `linear-gradient(135deg, ${gradientColors})`,
      borderBottom: `3px solid transparent`,
      borderImage: `linear-gradient(90deg, ${layerList.map(l => LAYER_COLORS[l]).join(', ')}) 1`,
      cursor: 'pointer',
      borderRadius: '2px',
      padding: '0 1px',
    };
  };

  // For the tooltip, use the first annotation index in the segment
  return (
    <div style={containerStyle}>
      <div style={textStyle}>
        {segments.map((seg, segIdx) => {
          if (seg.annotationIndices.length === 0) {
            return <span key={segIdx}>{seg.text}</span>;
          }

          // Use first annotation index as the "primary" one for the tooltip ref + handler
          const primaryIndex = seg.annotationIndices[0];
          const spanRef = getOrCreateRef(primaryIndex);

          return (
            <span
              key={segIdx}
              ref={spanRef}
              style={getSpanStyle(seg.annotationIndices)}
              onClick={() => handleSpanClick(primaryIndex)}
            >
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

      <div style={legendStyle}>
        {Object.entries(LAYER_LABELS).map(([key, label]) => (
          <div key={key} style={legendItemStyle}>
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                backgroundColor: LAYER_COLORS[key],
                marginRight: '5px',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '12px', color: '#4a3228' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const textStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.7',
  color: '#3a2218',
  fontFamily: "'Instrument Sans', sans-serif",
};

const legendStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '10px',
  backgroundColor: 'rgba(255,255,255,0.5)',
  borderRadius: '6px',
};

const legendItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};
