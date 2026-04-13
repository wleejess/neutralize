<img width="1500" height="500" alt="image" src="https://github.com/user-attachments/assets/10128d16-8d02-46b4-b36c-bb9d6468e7ed" />

**See through the language. Understand what you're really reading.**

Neutralize is a browser extension for Chrome and Firefox that analyzes selected text for rhetorical devices — appeals, structural techniques, and loaded language — and offers a neutral rewrite alongside synonym alternatives. 

Anything and everything we read is shaped by language. Diction and syntax play a key role in how we interpret things, influencing hte way we evaluate a situation. I'm not saying it's *wrong* for authors to persuade you by some means, or encourage you to *feel* a certain way about a topic, but it is worth considering. Awareness is key.

For example, I *do think* war should be described as devastating, as a means to discourage it. 

It's what makes some speeches inspiring, but it's also what makes misleading coverage dangerous.

**Neutralize isn't a judgment on authors; it's a tool for readers who want to see clearly and decide for themselves.**

Built with React, TypeScript, and the Claude API.

---

## What it does

Highlight 3–5 sentences on any article, webpage, or browser-rendered PDF. Neutralize will:

- Color-code rhetorical techniques in the selected text (appeals, structural devices, loaded connotations)
- Show synonym alternatives with nuance explanations on hover
- Produce a neutral rewrite of the passage and explain what changed and why
- Flag pure opinions that can't be neutralized, and identify plain factual statements



https://github.com/user-attachments/assets/770d8ecb-c82e-44b7-88b3-e4165e9d40fe


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

## Style Guide
<img width="900" height="520" alt="image" src="https://github.com/user-attachments/assets/4999d7a1-6713-4f0b-8e7b-c3699b56bed4" />
<img width="960" height="580" alt="image" src="https://github.com/user-attachments/assets/a6736ef6-4546-41fe-bc09-6af7608a618c" />


