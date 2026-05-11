# BRE Initiative Tracker

A lightweight, static (no-build) web page to manage a product initiative.

## What it does

Single-page dashboard with 5 sections:

1. **Overview** — project scope, goals, key metadata
2. **Backlog** — Kanban with `Not started`, `In progress`, `Complete`
3. **Updates** — last updates from meetings (engineering, architecture, commercial, partners, …)
4. **Next steps** — actionable items with responsible owner and due date
5. **Progress charts** — two charts: **Discovery** progress and **Delivery** progress

## How data works

All data lives in `data/*.json` files. You can:

- Edit the JSON files directly with any text editor
- Use the **Import** button on each section to load a `.json`, `.md`, or `.txt` file (e.g. paste meeting notes from a file and they will be appended as an Update)
- Use the **Export** button on each section to download the current state as JSON (so changes you make in the UI can be persisted back to disk)

> The app is fully static. Changes made in the UI are kept in `localStorage` for the current browser. To make them permanent, click **Export** on the section and replace the file under `data/`.

## Run it

Just open `index.html` in a browser. For best results (so the JSON `fetch` works on all browsers), serve the folder:

```powershell
# Option A: Python
python -m http.server 8000

# Option B: Node (if you have npx)
npx --yes serve .
```

Then open http://localhost:8000

## File structure

```
.
├── index.html
├── assets/
│   ├── styles.css
│   └── app.js
├── data/
│   ├── overview.json
│   ├── backlog.json
│   ├── updates.json
│   ├── next-steps.json
│   └── progress.json
└── README.md
```
