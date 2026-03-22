import React, { useEffect, useRef } from 'react';
import type { Annotation } from '@extension/shared';

interface WordTooltipProps {
  annotation: Annotation;
  anchorRef: React.RefObject<HTMLSpanElement | null>;
  onDismiss: () => void;
}

const LAYER_LABELS: Record<string, string> = {
  appeals: 'Rhetorical Appeal',
  structural: 'Structural Device',
  meaning: 'Meaning / Connotation',
};

export const WordTooltip: React.FC<WordTooltipProps> = ({ annotation, anchorRef, onDismiss }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onDismiss();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onDismiss, anchorRef]);

  // Determine position: above or below the anchor
  const [positionAbove, setPositionAbove] = React.useState(false);

  useEffect(() => {
    if (!anchorRef.current || !tooltipRef.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const tooltipHeight = tooltipRef.current.offsetHeight || 200;
    const panelHeight = window.innerHeight;
    const spaceBelow = panelHeight - anchorRect.bottom;
    setPositionAbove(spaceBelow < tooltipHeight + 8);
  }, [anchorRef]);

  const activeLayers = Object.entries(annotation.layers).filter(([, v]) => v !== null) as [string, string][];

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    backgroundColor: '#fff',
    border: '1px solid #d4c5b8',
    borderRadius: '8px',
    padding: '12px',
    maxWidth: '240px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    fontFamily: "'Instrument Sans', sans-serif",
    fontSize: '13px',
    color: '#3a2218',
  };

  // We use a portal-like approach by anchoring to the span's bounding box
  // The actual top/left is set via a layout effect on the container
  return (
    <TooltipPortal
      anchorRef={anchorRef}
      positionAbove={positionAbove}
      tooltipRef={tooltipRef}
      tooltipStyle={tooltipStyle}
    >
      {activeLayers.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          {activeLayers.map(([layer, description]) => (
            <div key={layer} style={{ marginBottom: '6px' }}>
              <span style={{ fontWeight: '600', color: '#8f5b34' }}>
                {LAYER_LABELS[layer] ?? layer}:{' '}
              </span>
              <span style={{ color: '#4a3228', lineHeight: '1.4' }}>{description}</span>
            </div>
          ))}
        </div>
      )}

      {annotation.synonyms.length > 0 && (
        <div>
          <div style={{ fontWeight: '600', color: '#3a2218', marginBottom: '6px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
            Alternatives
          </div>
          {annotation.synonyms.map((syn, i) => (
            <div key={i} style={{ marginBottom: '5px' }}>
              <span style={{ fontWeight: '600', color: '#8f5b34' }}>{syn.word}</span>
              {syn.nuance && (
                <span style={{ color: '#6b4c3b' }}> — {syn.nuance}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </TooltipPortal>
  );
};

// Inline portal that positions the tooltip relative to the anchor element
interface PortalProps {
  anchorRef: React.RefObject<HTMLSpanElement | null>;
  positionAbove: boolean;
  tooltipRef: React.RefObject<HTMLDivElement>;
  tooltipStyle: React.CSSProperties;
  children: React.ReactNode;
}

const TooltipPortal: React.FC<PortalProps> = ({ anchorRef, positionAbove, tooltipRef, tooltipStyle, children }) => {
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const tooltipWidth = 240;
    let left = rect.left;
    if (left + tooltipWidth > window.innerWidth - 8) {
      left = window.innerWidth - tooltipWidth - 8;
    }
    const top = positionAbove
      ? rect.top - (tooltipRef.current?.offsetHeight ?? 200) - 8
      : rect.bottom + 8;
    setCoords({ top, left });
  }, [anchorRef, positionAbove, tooltipRef]);

  return (
    <div
      ref={tooltipRef}
      style={{ ...tooltipStyle, top: coords.top, left: coords.left }}
    >
      {children}
    </div>
  );
};
