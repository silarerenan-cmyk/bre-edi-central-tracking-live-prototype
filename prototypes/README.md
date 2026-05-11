# Hypothesis Prototypes

Low-code, navigable web prototypes used to test product hypotheses with real users. Every prototype ships with built-in usage tracking — clicks, pageviews, scroll depth, form interactions, time on page, and custom events — so you can answer *"would users actually do X?"* instead of guessing.

## How it works

```
prototypes/
├── index.html              ← list of all prototypes (open this first)
├── prototypes.json         ← registry, kept in sync by the agent
├── _shared/
│   ├── hypothesis-tracker.js   ← THE tracker, every prototype loads it
│   ├── dashboard.html          ← analytics dashboard
│   ├── dashboard.js
│   └── dashboard.css
├── _template/              ← starter copied when scaffolding a new prototype
│   ├── index.html
│   ├── styles.css
│   └── HYPOTHESIS.md
└── <your-prototype-id>/    ← one folder per hypothesis test
    ├── index.html
    ├── styles.css
    └── HYPOTHESIS.md
```

## Create a new prototype

Ask Cursor:

> *"Scaffold a new prototype to test the hypothesis: Showing prices upfront on the hero increases sign-up conversion."*

The `hypothesis-prototype` skill (in `.cursor/skills/`) will:

1. Ask for an id, screens, and tracked CTA names.
2. Copy `_template/` → `<id>/` and substitute placeholders.
3. Wire the tracker, register the prototype in `prototypes.json`.
4. Give you the local + dashboard + public URLs.

## Run locally

From the repo root:

```powershell
node .serve.cjs
# then open http://127.0.0.1:8765/prototypes/
```

## Share with users

Push to `main`. The `.github/workflows/deploy-pages.yml` workflow publishes the whole repo to GitHub Pages, so each prototype is reachable at:

```
https://<your-user>.github.io/<repo>/prototypes/<id>/
```

Send participants that URL. Every click, scroll, form interaction, and screen view is captured locally in their browser.

## See the data

Each prototype has its own dashboard:

```
…/prototypes/_shared/dashboard.html?id=<prototype-id>
```

It shows: total events, unique participants, active time, top tracked clicks, most-viewed paths, form engagement, scroll-depth funnel, and a recent-events feed. **Download JSON / CSV** exports the raw data so you can collate runs from multiple participants offline.

> Tracker data lives in each participant's `localStorage` — there is no backend. To collect data centrally, ask the skill to enable the `data-endpoint="…"` option (any URL that accepts a `POST` of JSON) or the PostHog adapter.

## Privacy by default

- Anonymous random UUID per browser. No fingerprinting, no IPs, no cross-site tracking.
- Form **values are never captured** unless you explicitly add `data-track-value="true"` to the input — and even then, do not enable it for emails, names, or other PII.
- All data is local-only unless you opt into a remote sink.
