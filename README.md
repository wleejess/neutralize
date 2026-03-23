# Neutralize

**See through the language. Understand what you're really reading.**

Neutralize is a Chrome extension that analyzes selected text for rhetorical devices — appeals, structural techniques, and loaded language — and offers a neutral rewrite alongside synonym alternatives. Built with React, TypeScript, and the Claude API.

---

## What it does

Highlight 3–5 sentences on any article or webpage. Neutralize will:

- Color-code rhetorical techniques in the selected text (appeals, structural devices, loaded connotations)
- Show synonym alternatives with nuance explanations on hover
- Produce a neutral rewrite of the passage and explain what changed and why
- Flag pure opinions that can't be neutralized, and identify plain factual statements

---

## How to install

### Prerequisites

- Node 18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- An [Anthropic API key](https://console.anthropic.com/settings/api-keys) (requires a Tier 1 account — $5 minimum credit deposit)

### Steps

```bash
git clone https://github.com/your-username/neutralize.git
cd neutralize
pnpm install
pnpm build
```

Then load the extension in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder inside the repo

### Add your API key

After loading the extension:

1. Right-click the Neutralize icon in the toolbar → **Options**
2. Paste your Anthropic API key and click **Save**

---

## Usage

1. Open any article or webpage in Chrome
2. Click the Neutralize toolbar icon to open the side panel
3. Highlight 3–5 sentences
4. Read the breakdown in the panel

---

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 18 + TypeScript |
| Build | Vite + Turborepo |
| Extension | Chrome MV3, chrome-extension-boilerplate-react-vite |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Font | Instrument Sans (Google Fonts) |
