# Firefox Add-ons (AMO) Listing Copy

## Add-on name
Neutralize

## Summary (250 chars max — 192 used)
Highlight text on any webpage to reveal rhetorical techniques — emotional appeals, loaded language, structural devices — and get a neutral rewrite. Color-coded annotations powered by Claude AI.

## Description

Neutralize analyzes the language of anything you read online — news articles, opinion pieces, political speeches, social media posts — and tells you exactly what rhetorical moves are being made.

**How it works**

Highlight 3–5 sentences on any webpage, then click the Neutralize icon. A popup shows your text color-coded by rhetorical technique:

- **Rhetorical appeals** — pathos, logos, ethos
- **Structural devices** — repetition, alliteration, comparison
- **Meaning & connotation** — loaded language, word choice, framing

Click any highlighted phrase to see a tooltip explaining its rhetorical role and suggesting neutral alternatives. Below the annotated text you'll find a complete neutral rewrite of the passage, plus an explanation of what the author was likely trying to achieve.

**Why Neutralize?**

Most of us consume news and opinion writing without noticing how language shapes our reactions. Being unaware of rhetorical techniques makes you more susceptible to them. Neutralize makes the invisible visible.

**Privacy**

Neutralize collects zero personal data. Your API key is stored locally using your browser's built-in storage and is never sent anywhere except Anthropic's API endpoint — directly from your browser, not through any intermediate server. No accounts, no analytics, no tracking. Full privacy policy: https://wleejess.github.io/neutralize/privacy/

**Requirements**

Neutralize requires an Anthropic API key (free to obtain at console.anthropic.com). Analysis calls use the Claude claude-sonnet-4-6 model and are billed to your Anthropic account.

**Open source**

Source code: https://github.com/wleejess/neutralize

---

## Categories
- Appearance (or Productivity)

## License
MIT

## Privacy policy URL
https://wleejess.github.io/neutralize/privacy/

## Support site
https://github.com/wleejess/neutralize/issues

## Homepage
https://wleejess.github.io/neutralize/

## Screenshots needed
1. Popup with annotated text — color-coded highlights on a political paragraph
2. Tooltip open — word-level breakdown with synonym alternatives
3. Neutral rewrite — the result section with explanation
4. Options page — API key entry screen

## Notes on Firefox-specific behavior
- The extension opens as a popup (400×600px) when the toolbar icon is clicked
- User workflow: highlight text → click icon → see analysis
- This differs from the Chrome version where the side panel opens automatically on selection
