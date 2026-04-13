import type { AnalysisResult, BackgroundStateMessage, ExtensionMessage } from '@extension/shared';

// Track the last panel state so the Firefox popup can hydrate on open
let currentState: BackgroundStateMessage = { status: 'empty' };

chrome.runtime.onInstalled.addListener(() => {
  // chrome.sidePanel is Chrome-only; guard for Firefox compatibility
  if (chrome.sidePanel) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  }
});

// Intercept navigations to .pdf URLs and redirect to the in-extension PDF viewer.
// Guards for Firefox where webNavigation may behave differently.
if (chrome.webNavigation) {
  chrome.webNavigation.onBeforeNavigate.addListener(
    details => {
      if (details.frameId !== 0) return; // main frame only
      const viewerUrl = chrome.runtime.getURL('pdf-viewer/index.html') + '?url=' + encodeURIComponent(details.url);
      chrome.tabs.update(details.tabId, { url: viewerUrl });
    },
    { url: [{ urlSuffix: '.pdf' }, { urlSuffix: '.PDF' }] },
  );
}

const SYSTEM_PROMPT = `You are a rhetorical analysis assistant for high school students. Your job is to analyze highlighted text for rhetorical techniques and return structured JSON.

Annotation categories (non-exclusive — a span can belong to multiple):
- amplification: intensifiers and superlatives (absolutely, completely, devastating, massive, unprecedented)
- emotion: appeals to feeling over reason (heartbreaking, outrageous, inspiring, tragic)
- loaded_language: words with strong connotative bias (regime, radical, elite, extremist, invasion)
- hedging: vague attribution avoiding accountability (some say, many believe, experts claim, it seems)
- presupposition: phrases assuming agreement without establishing it (obviously, clearly, as everyone knows, of course)
- call_to_action: urgency language compelling immediate response (must, need to, demand, act now, cannot wait)

Return ONLY valid JSON matching this schema — no markdown, no explanation outside the JSON:

{
  "is_factual": boolean,
  "annotations": [
    {
      "text": "exact word or phrase from the input",
      "layers": {
        "amplification": "description or null",
        "emotion": "description or null",
        "loaded_language": "description or null",
        "hedging": "description or null",
        "presupposition": "description or null",
        "call_to_action": "description or null"
      },
      "synonyms": [
        { "word": "alternative", "nuance": "how this word differs in connotation" }
      ]
    }
  ],
  "neutral_rewrite": "rewritten objective version or null",
  "rewrite_explanation": "what changed and what the author likely intended, or null",
  "not_neutralizable_reason": "why it cannot be rewritten objectively, or null"
}

Rules:
- If the text is a plain factual statement, set is_factual: true and return empty annotations array, null for all rewrite fields
- Always attempt a neutral rewrite. Set neutral_rewrite to null ONLY when the text is purely personal/unfalsifiable opinion with no argumentative claims (e.g. "I love pizza"). Rhetorical, political, or evaluative statements almost always have a neutralizable form — rewrite them even if imperfect
- When rewriting: attribute claims to their source ("critics argue", "the government states"), replace loaded/emotional words with neutral equivalents, and remove presuppositions and urgency framing
- Only annotate spans where at least one layer is non-null
- synonyms array should have 2–3 items per annotation
- Keep all explanations at a high school reading level`;

const callClaude = async (apiKey: string, text: string, pageTitle: string, domain: string): Promise<AnalysisResult> => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Page: ${domain} — ${pageTitle}\n\nHighlighted text:\n${text}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error('Anthropic error body:', body);
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.content[0].text
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
  console.log('Raw Claude response:', raw);
  return JSON.parse(raw) as AnalysisResult;
};

const broadcastToPanel = (message: ExtensionMessage) => {
  chrome.runtime.sendMessage(message).catch(() => {
    // Panel may not be open — ignore
  });
};

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  console.log('Background received message:', message.type);

  if (message.type === 'GET_CURRENT_STATE') {
    sendResponse(currentState);
    return;
  }

  if (message.type === 'SELECTION_TOO_LONG') {
    currentState = { status: 'too_long' };
    broadcastToPanel({ type: 'SELECTION_TOO_LONG' });
    return;
  }

  if (message.type === 'TEXT_SELECTED') {
    const { text, pageTitle, domain } = message;
    currentState = { status: 'loading' };

    chrome.storage.local.get('apiKey', async result => {
      const apiKey = result['apiKey'];

      if (!apiKey) {
        console.log('No API key found — sending NO_API_KEY');
        currentState = { status: 'no_api_key' };
        broadcastToPanel({ type: 'NO_API_KEY' });
        return;
      }

      try {
        console.log('Calling Claude with key ending in:', apiKey.slice(-4));
        const analysisResult = await callClaude(apiKey, text, pageTitle, domain);
        currentState = { status: 'result', data: analysisResult, originalText: text };
        broadcastToPanel({ type: 'ANALYSIS_RESULT', payload: analysisResult });
      } catch (err) {
        console.error('Claude call failed:', err);
        const msg = err instanceof Error ? err.message : 'Unknown error';
        currentState = { status: 'error', message: msg };
        broadcastToPanel({ type: 'ANALYSIS_ERROR', message: msg });
      }
    });
  }
});
