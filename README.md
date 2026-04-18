<img width="1500" height="500" alt="image" src="https://github.com/user-attachments/assets/10128d16-8d02-46b4-b36c-bb9d6468e7ed" />

---

**See through the language. Understand what you're really reading.**

Neutralize is a browser extension for Chrome and Firefox that analyzes selected text for rhetorical devices — appeals, structural techniques, and loaded language — and offers a neutral rewrite alongside synonym alternatives. 

Anything and everything we read is shaped by language. Diction and syntax play a key role in how we interpret things, influencing hte way we evaluate a situation. I'm not saying it's *wrong* for authors to persuade you by some means, or encourage you to *feel* a certain way about a topic, but it is worth considering. Awareness is key.

For example, I *do think* war should be described as devastating, as a means to discourage it. 

It's what makes some speeches inspiring, but it's also what makes misleading coverage dangerous.

**Neutralize isn't a judgment on authors; it's a tool for readers who want to see clearly and decide for themselves.**

Built with React, TypeScript, and the Claude API.

---

https://github.com/user-attachments/assets/770d8ecb-c82e-44b7-88b3-e4165e9d40fe

---

## What it detects

- **Appeals** — ethos, pathos, logos
- **Loaded language** — connotation-heavy word choices and emotionally charged phrasing
- **Structural techniques** — framing, repetition, false equivalence, and more
- **Pure opinions** — flagged as non-neutralizable
- **Plain factual statements** — identified and left unchanged

---

## Architecture

```
neutralize/
├── extension/          # Chrome MV3 + Firefox MV2 manifests and entry points
├── packages/
│   ├── ui/             # React 19 + TypeScript side panel and popup
│   └── shared/         # Prompt pipeline, API client, type definitions
├── pages/              # Options / settings pages
├── store/              # Extension state management
├── tests/e2e/          # End-to-end test suite
├── bash-scripts/       # Build and packaging helpers
└── turbo.json          # Turborepo pipeline config
```

**Key design decisions:**

- **Monorepo with Turborepo + pnpm workspaces** — separates browser-specific code (extension manifests, background scripts) from shared UI and logic, enabling a single build pipeline that outputs both `dist-chrome/` and `dist-firefox/` targets without duplicating source.
- **Structured JSON output from Claude API** — the prompt pipeline returns a typed schema: `{ devices: [{ type, span, confidence, explanation }], neutral_rewrite, unchanged_spans }`. Keeping the model output structured (not free-form prose) makes the UI deterministic and testable regardless of which passage is analyzed.
- **Husky + lint-staged on commit** — enforces consistent code quality across a project designed to be contributed to; GitGuardian integration prevents accidental API key exposure.
- **Model choice (claude-haiku-4-5)** — latency matters in a side panel context. Haiku keeps response time under 1.5s for typical passages while still returning accurate rhetorical classifications.

---

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite + Turborepo |
| Extension targets | Chrome MV3, Firefox MV2 |
| AI | Anthropic Claude API (`claude-haiku-4-5`) |
| Monorepo | pnpm workspaces |
| Linting / formatting | ESLint + Prettier |

---

## Getting Started

### Prerequisites

- Node 18+
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- An [Anthropic API key](https://console.anthropic.com/settings/api-keys) (Tier 1 — $5 minimum deposit)

### Install and build

```bash
git clone https://github.com/wleejess/neutralize.git
cd neutralize
cp .example.env .env          # add your Anthropic API key here
pnpm install
pnpm build
```

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select `dist-chrome/`

### Load in Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on** → select any file in `dist-firefox/`

### Add your API key

After loading: right-click the toolbar icon → **Options** (Chrome) or open the popup → **Settings** (Firefox). Paste your key and save. The side panel updates without a reload.

---

## Usage

1. Open any article or webpage
2. Click the Neutralize toolbar icon to open the side panel
3. Highlight 3–5 sentences
4. Read the breakdown in the panel — hover word highlights for synonym alternatives

---

## License

MIT

