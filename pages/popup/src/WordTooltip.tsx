import { useEffect, useRef, useState } from 'react';
import type { Annotation } from '@extension/shared';
import type React from 'react';

interface WordTooltipProps {
  annotation: Annotation;
  anchorRef: React.RefObject<HTMLSpanElement | null>;
  onDismiss: () => void;
}

const LAYER_LABELS: Record<string, string> = {
  amplification: 'AMPLIFICATION',
  emotion: 'EMOTION',
  loaded_language: 'LOADED LANGUAGE',
  hedging: 'HEDGING',
  presupposition: 'PRESUPPOSITION',
  call_to_action: 'CALL TO ACTION',
};

const LAYER_TEXT_COLORS: Record<string, string> = {
  amplification: '#E8B86D',
  emotion: '#7BAFD4',
  loaded_language: '#C48BB8',
  hedging: '#90B878',
  presupposition: '#A88CC8',
  call_to_action: '#E8906A',
};

const WordTooltip: React.FC<WordTooltipProps> = ({ annotation, anchorRef, onDismiss }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [positionAbove, setPositionAbove] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      )
        onDismiss();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onDismiss, anchorRef]);

  useEffect(() => {
    if (!anchorRef.current || !tooltipRef.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const tooltipHeight = tooltipRef.current.offsetHeight || 200;
    setPositionAbove(window.innerHeight - anchorRect.bottom < tooltipHeight + 8);
  }, [anchorRef]);

  const activeLayers = Object.entries(annotation.layers).filter(([, v]) => v !== null) as [string, string][];

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    backgroundColor: '#3A2A40',
    border: '1px solid #6A5478',
    borderRadius: '4px',
    padding: '12px',
    maxWidth: '260px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#C8B8D8',
  };

  return (
    <TooltipPortal
      anchorRef={anchorRef}
      positionAbove={positionAbove}
      tooltipRef={tooltipRef}
      tooltipStyle={tooltipStyle}>
      {activeLayers.length > 0 && (
        <div style={{ marginBottom: annotation.synonyms.length > 0 ? '10px' : 0 }}>
          {activeLayers.map(([layer, description]) => (
            <div key={layer} style={{ marginBottom: '6px' }}>
              <div
                style={{
                  fontWeight: '700',
                  color: LAYER_TEXT_COLORS[layer] ?? '#E8DDF0',
                  fontSize: '9px',
                  letterSpacing: '1.5px',
                  marginBottom: '2px',
                }}>
                {LAYER_LABELS[layer] ?? layer.toUpperCase()}
              </div>
              <div style={{ color: '#C8B8D8', lineHeight: '1.5', fontSize: '11px' }}>{description}</div>
            </div>
          ))}
        </div>
      )}
      {annotation.synonyms.length > 0 && (
        <div>
          <div
            style={{
              fontWeight: '700',
              color: '#A090B0',
              marginBottom: '6px',
              fontSize: '9px',
              letterSpacing: '1.5px',
              borderTop: activeLayers.length > 0 ? '1px solid #6A5478' : 'none',
              paddingTop: activeLayers.length > 0 ? '8px' : 0,
            }}>
            ALTERNATIVES
          </div>
          {annotation.synonyms.map((syn, i) => (
            <div key={i} style={{ marginBottom: '5px', fontSize: '11px' }}>
              <span style={{ fontWeight: '700', color: '#E8DDF0' }}>{syn.word}</span>
              {syn.nuance && <span style={{ color: '#A090B0' }}> — {syn.nuance}</span>}
            </div>
          ))}
        </div>
      )}
    </TooltipPortal>
  );
};

interface PortalProps {
  anchorRef: React.RefObject<HTMLSpanElement | null>;
  positionAbove: boolean;
  tooltipRef: React.RefObject<HTMLDivElement>;
  tooltipStyle: React.CSSProperties;
  children: React.ReactNode;
}

const TooltipPortal: React.FC<PortalProps> = ({ anchorRef, positionAbove, tooltipRef, tooltipStyle, children }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const tooltipWidth = 260;
    let left = rect.left;
    if (left + tooltipWidth > window.innerWidth - 8) left = window.innerWidth - tooltipWidth - 8;
    const top = positionAbove ? rect.top - (tooltipRef.current?.offsetHeight ?? 200) - 8 : rect.bottom + 8;
    setCoords({ top, left });
  }, [anchorRef, positionAbove, tooltipRef]);

  return (
    <div ref={tooltipRef} style={{ ...tooltipStyle, top: coords.top, left: coords.left }}>
      {children}
    </div>
  );
};

export { WordTooltip };
