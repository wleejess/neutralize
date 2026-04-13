import * as pdfjs from 'pdfjs-dist';
import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import type React from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf-viewer/pdf.worker.min.mjs');

const CHAR_LIMIT = 600;
const SCALE = 1.5;
const THUMB_SCALE = 0.2;

type ViewerStatus =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'ready'; doc: PDFDocumentProxy; numPages: number };

const PdfViewer: React.FC = () => {
  const pdfUrl = new URL(location.href).searchParams.get('url') ?? '';
  const [status, setStatus] = useState<ViewerStatus>({ type: 'idle' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const thumbsStartedRef = useRef(false);
  const thumbDataRef = useRef<string[]>([]);

  // Load the PDF document
  useEffect(() => {
    if (!pdfUrl) {
      setStatus({ type: 'error', message: 'No PDF URL provided.' });
      return;
    }
    setStatus({ type: 'loading' });

    const loadingTask = pdfjs.getDocument({ url: pdfUrl });

    loadingTask.promise
      .then(doc => {
        docRef.current = doc;
        setStatus({ type: 'ready', doc, numPages: doc.numPages });
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load PDF';
        setStatus({ type: 'error', message: msg });
      });

    return () => {
      loadingTask.destroy();
    };
  }, [pdfUrl]);

  // Kick off thumbnail rendering once doc is ready
  useEffect(() => {
    if (status.type !== 'ready' || thumbsStartedRef.current) return;
    thumbsStartedRef.current = true;
    thumbDataRef.current = new Array(status.numPages).fill('');
    setThumbnails([...thumbDataRef.current]);
    renderThumbnails(status.doc, status.numPages);
  }, [status]);

  // Keep page input in sync with currentPage state
  useEffect(() => {
    setPageInput(String(currentPage));
    // Scroll the active thumbnail into view
    const sidebar = sidebarRef.current;
    if (sidebar) {
      const active = sidebar.querySelector<HTMLElement>('[data-active="true"]');
      active?.scrollIntoView({ block: 'nearest' });
    }
  }, [currentPage]);

  // Render main page whenever doc or currentPage changes
  useEffect(() => {
    if (status.type !== 'ready') return;
    const container = containerRef.current;
    if (!container) return;
    renderPage(status.doc, currentPage, container);
  }, [status, currentPage]);

  // Wire up mouseup → TEXT_SELECTED message
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection) return;
      const text = selection.toString().trim();
      if (!text) return;

      if (text.length > CHAR_LIMIT) {
        chrome.runtime.sendMessage({ type: 'SELECTION_TOO_LONG' });
        return;
      }

      chrome.runtime.sendMessage({
        type: 'TEXT_SELECTED',
        text,
        pageTitle: document.title,
        domain: pdfUrl ? new URL(pdfUrl).hostname : location.hostname,
      });
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [pdfUrl]);

  const renderThumbnails = async (doc: PDFDocumentProxy, numPages: number) => {
    for (let i = 1; i <= numPages; i++) {
      const page: PDFPageProxy = await doc.getPage(i);
      const viewport = page.getViewport({ scale: THUMB_SCALE });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport }).promise;
      thumbDataRef.current[i - 1] = canvas.toDataURL('image/jpeg', 0.75);
      setThumbnails([...thumbDataRef.current]);
    }
  };

  const renderPage = async (doc: PDFDocumentProxy, pageNum: number, container: HTMLDivElement) => {
    if (renderTaskRef.current) {
      try {
        await renderTaskRef.current.cancel();
      } catch {
        /* cancelled */
      }
      renderTaskRef.current = null;
    }

    container.innerHTML = '';

    const page: PDFPageProxy = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: SCALE });

    // Canvas layer
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.cssText = 'display:block;width:100%;';

    // Text layer — MUST have class "textLayer" for position:absolute CSS to apply to spans
    const textLayerDiv = document.createElement('div');
    textLayerDiv.className = 'textLayer';
    textLayerDiv.style.cssText = [
      `position:absolute`,
      `top:0`,
      `left:0`,
      `width:${viewport.width}px`,
      `height:${viewport.height}px`,
      `overflow:hidden`,
      `line-height:1`,
    ].join(';');

    const wrapper = document.createElement('div');
    wrapper.style.cssText = [
      `--scale-factor:${SCALE}`,
      `position:relative`,
      `margin:0 auto 24px`,
      `width:${viewport.width}px`,
      `box-shadow:0 2px 16px rgba(0,0,0,.5)`,
      `background:#fff`,
    ].join(';');
    wrapper.appendChild(canvas);
    wrapper.appendChild(textLayerDiv);
    container.appendChild(wrapper);

    // Render the canvas
    const renderTask = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = renderTask;
    await renderTask.promise;

    // Render the text layer
    const textContent = await page.getTextContent();
    const textLayer = new pdfjs.TextLayer({
      textContentSource: textContent,
      container: textLayerDiv,
      viewport,
    });
    await textLayer.render();

    // Make text spans transparent but selectable
    textLayerDiv.querySelectorAll<HTMLElement>('span').forEach(el => {
      el.style.color = 'transparent';
      el.style.cursor = 'text';
      (el.style as unknown as Record<string, string>).userSelect = 'text';
      (el.style as unknown as Record<string, string>).webkitUserSelect = 'text';
    });
  };

  const numPages = status.type === 'ready' ? status.numPages : 0;

  const goToPage = (n: number) => {
    const clamped = Math.max(1, Math.min(numPages, n));
    setCurrentPage(clamped);
  };

  const handlePageInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const n = parseInt(pageInput, 10);
      if (!isNaN(n)) goToPage(n);
      else setPageInput(String(currentPage));
    }
  };

  const handlePageInputBlur = () => {
    const n = parseInt(pageInput, 10);
    if (!isNaN(n)) goToPage(n);
    else setPageInput(String(currentPage));
  };

  return (
    <div style={styles.root}>
      <style>{textLayerCSS}</style>

      {/* Header — full width */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.wordmark}>NEUTRALIZE</span>
          <span style={styles.headerSep}>|</span>
          <span style={styles.headerLabel}>PDF VIEWER</span>
        </div>
        {numPages > 0 && (
          <div style={styles.headerRight}>
            <button
              style={{ ...styles.pageBtn, opacity: currentPage <= 1 ? 0.3 : 1 }}
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}>
              ‹
            </button>
            <input
              type="number"
              value={pageInput}
              min={1}
              max={numPages}
              onChange={e => setPageInput(e.target.value)}
              onKeyDown={handlePageInputKey}
              onBlur={handlePageInputBlur}
              style={styles.pageInput}
            />
            <span style={styles.pageSep}>/ {numPages}</span>
            <button
              style={{ ...styles.pageBtn, opacity: currentPage >= numPages ? 0.3 : 1 }}
              disabled={currentPage >= numPages}
              onClick={() => goToPage(currentPage + 1)}>
              ›
            </button>
          </div>
        )}
      </div>

      {/* Body: sidebar + main content */}
      <div style={styles.body}>
        {/* Thumbnail sidebar */}
        {status.type === 'ready' && (
          <div ref={sidebarRef} style={styles.sidebar}>
            {thumbnails.map((url, i) => {
              const isActive = currentPage === i + 1;
              return (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => goToPage(i + 1)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') goToPage(i + 1);
                  }}
                  style={{
                    ...styles.thumbItem,
                    ...(isActive ? styles.thumbItemActive : {}),
                  }}>
                  {url ? (
                    <img src={url} alt={`Page ${i + 1}`} style={styles.thumbImg} />
                  ) : (
                    <div style={styles.thumbPlaceholder} />
                  )}
                  <span
                    style={{
                      ...styles.thumbLabel,
                      ...(isActive ? styles.thumbLabelActive : {}),
                    }}>
                    {i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Main content */}
        <div style={styles.content}>
          {status.type === 'loading' && (
            <div style={styles.centered}>
              <div style={styles.barTrack}>
                <div style={styles.barFill} />
              </div>
              <style>{`@keyframes ntz-slide{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
              <span style={styles.statusLabel}>LOADING PDF...</span>
            </div>
          )}
          {status.type === 'error' && (
            <div style={styles.centered}>
              <span style={{ ...styles.statusLabel, color: '#C87878' }}>ERROR</span>
              <p style={styles.errorMsg}>{status.message}</p>
            </div>
          )}
          {status.type === 'ready' && (
            <div style={styles.hint}>Highlight 3–5 sentences, then open the Neutralize panel to analyze</div>
          )}
          <div ref={containerRef} style={styles.pages} />
        </div>
      </div>
    </div>
  );
};

// Text layer CSS — requires the container to have class "textLayer"
const textLayerCSS = `
  .textLayer {
    position: absolute;
    text-size-adjust: none;
    forced-color-adjust: none;
    transform-origin: 0 0;
  }
  .textLayer span {
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
    color: transparent;
    -webkit-user-select: text;
    user-select: text;
  }
  .textLayer br {
    display: none;
  }
  ::selection { background: rgba(200, 136, 90, 0.4); }
  ::-moz-selection { background: rgba(200, 136, 90, 0.4); }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }
`;

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#2A1F2E',
    fontFamily: 'monospace',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: '#1E1526',
    borderBottom: '1px solid #4A3854',
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  wordmark: { fontSize: '13px', fontWeight: '700', color: '#E8DDF0', letterSpacing: '3px' },
  headerSep: { color: '#4A3854', fontSize: '13px' },
  headerLabel: { fontSize: '9px', color: '#A090B0', letterSpacing: '2px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  pageBtn: {
    background: 'none',
    border: '1px solid #4A3854',
    color: '#C8B8D8',
    fontSize: '16px',
    padding: '2px 10px',
    cursor: 'pointer',
    borderRadius: '3px',
    fontFamily: 'monospace',
    lineHeight: '1.4',
  },
  pageInput: {
    width: '44px',
    textAlign: 'center',
    background: '#2A1F2E',
    border: '1px solid #4A3854',
    color: '#E8DDF0',
    fontSize: '11px',
    fontFamily: 'monospace',
    padding: '3px 4px',
    borderRadius: '3px',
    letterSpacing: '1px',
  },
  pageSep: { fontSize: '11px', color: '#A090B0', letterSpacing: '1px' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: {
    width: '140px',
    flexShrink: 0,
    overflowY: 'auto',
    backgroundColor: '#1A1220',
    borderRight: '1px solid #3A2A44',
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  thumbItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '3px',
    border: '1px solid transparent',
  },
  thumbItemActive: { border: '1px solid #C8885A', backgroundColor: '#2A1F2E' },
  thumbImg: { width: '108px', height: 'auto', display: 'block', borderRadius: '2px' },
  thumbPlaceholder: { width: '108px', height: '140px', backgroundColor: '#2A1F2E', borderRadius: '2px' },
  thumbLabel: { fontSize: '9px', color: '#6A5478', letterSpacing: '1px' },
  thumbLabelActive: { color: '#C8885A' },
  content: { flex: 1, overflow: 'auto', padding: '24px 24px 0' },
  hint: { fontSize: '10px', color: '#6A5478', letterSpacing: '1px', textAlign: 'center', marginBottom: '16px' },
  pages: { paddingBottom: '40px' },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    height: '300px',
  },
  statusLabel: { fontSize: '9px', fontWeight: '700', color: '#A090B0', letterSpacing: '2px' },
  barTrack: { width: '180px', height: '3px', backgroundColor: '#3A2A40', overflow: 'hidden', borderRadius: '2px' },
  barFill: {
    width: '50%',
    height: '100%',
    backgroundColor: '#C8885A',
    animation: 'ntz-slide 1.2s ease-in-out infinite',
    borderRadius: '2px',
  },
  errorMsg: { fontSize: '12px', color: '#C8B8D8', textAlign: 'center', maxWidth: '360px', lineHeight: '1.5' },
};

export default PdfViewer;
