# Neutralize

**See through the language. Understand what you're really reading.**

Neutralize is a browser extension for Chrome and Firefox that analyzes selected text for rhetorical devices — appeals, structural techniques, and loaded language — and offers a neutral rewrite alongside synonym alternatives. Built with React, TypeScript, and the Claude API.

---

## What it does

Highlight 3–5 sentences on any article, webpage, or browser-rendered PDF. Neutralize will:

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

Then load the extension:

**Chrome:**
1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist-chrome/` folder inside the repo

**Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select any file inside the `dist-firefox/` folder

### Add your API key

After loading the extension:

1. Right-click the Neutralize icon in the toolbar → **Options** (Chrome) or open the popup → **Settings** (Firefox)
2. Paste your Anthropic API key and click **Save**

The side panel will update automatically — no reload needed.

---

## Usage

1. Open any article or webpage
2. Click the Neutralize toolbar icon to open the side panel
3. Highlight 3–5 sentences
4. Read the breakdown in the panel

---

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite + Turborepo |
| Extension | Chrome MV3 + Firefox MV2, chrome-extension-boilerplate-react-vite |
| AI | Anthropic Claude API (`claude-haiku-4-5`) |
| Font | Instrument Sans (Google Fonts) |
