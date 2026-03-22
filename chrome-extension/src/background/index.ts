import type { AnalysisResult, ExtensionMessage } from '@extension/shared';

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

const SYSTEM_PROMPT = `You are a rhetorical analysis assistant for high school students. Your job is to analyze highlighted text for rhetorical techniques and return structured JSON.

Annotation categories (non-exclusive — a word can belong to multiple):
- appeals: emotional or logical appeals (pathos, logos, ethos)
- structural: repetition, comparison, sound devices (alliteration, assonance)
- meaning: connotation, loaded language, word choice, syntax effects

Return ONLY valid JSON matching this schema — no markdown, no explanation outside the JSON:

{
  "is_factual": boolean,
  "annotations": [
    {
      "text": "exact word or phrase from the input",
      "layers": {
        "appeals": "description or null",
        "structural": "description or null",
        "meaning": "description or null"
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
- If the text expresses an opinion or speculation that cannot be made objective, set neutral_rewrite: null and explain in not_neutralizable_reason
- synonyms array should have 2–3 items per annotation
- Keep all explanations at a high school reading level`;

async function callClaude(
  apiKey: string,
  text: string,
  pageTitle: string,
  domain: string,
): Promise<AnalysisResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
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
  const raw = data.content[0].text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  console.log('Raw Claude response:', raw);
  return JSON.parse(raw) as AnalysisResult;
}

function sendToSidePanel(message: ExtensionMessage) {
  chrome.runtime.sendMessage(message).catch(() => {
    // Side panel may not be open — ignore
  });
}

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  console.log('Background received message:', message.type);

  if (message.type === 'SELECTION_TOO_LONG') {
    sendToSidePanel({ type: 'SELECTION_TOO_LONG' });
    return;
  }

  if (message.type === 'TEXT_SELECTED') {
    const { text, pageTitle, domain } = message;

    chrome.storage.local.get('apiKey', async result => {
      const apiKey = result['apiKey'];

      if (!apiKey) {
        console.log('No API key found — sending NO_API_KEY');
        sendToSidePanel({ type: 'NO_API_KEY' });
        return;
      }

      try {
        console.log('Calling Claude with key ending in:', apiKey.slice(-4));
        const analysisResult = await callClaude(apiKey, text, pageTitle, domain);
        sendToSidePanel({ type: 'ANALYSIS_RESULT', payload: analysisResult });
      } catch (err) {
        console.error('Claude call failed:', err);
        const msg = err instanceof Error ? err.message : 'Unknown error';
        sendToSidePanel({ type: 'ANALYSIS_ERROR', message: msg });
      }
    });
  }
});
