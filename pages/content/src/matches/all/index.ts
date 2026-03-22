const CHAR_LIMIT = 600;

document.addEventListener('mouseup', () => {
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
    domain: window.location.hostname,
  });
});
