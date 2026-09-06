# eSIM Compare — V0

SEO-first eSIM plan comparison site. Static, zero-database, zero-cost.

- **Data:** MeiSIM public API (`https://api.meisimusa.com/mm/products`) — free, keyless.
- **Processing:** Python 3 (stdlib only) runs a `fetch → normalize → validate → score → write` pipeline.
- **Frontend:** Next.js (App Router, TypeScript, Tailwind) with **static export** (`output: "export"`), built for SEO with JSON-LD structured data.
- **Deployment:** Cloudflare Pages `*.pages.dev` (free tier), rebuilt on a 12-hour schedule via GitHub Actions.

## Structure

```
config/            scoring.json, destinations.json, affiliates.json, faqs.json, compare-pairs.json
data/raw/          latest source snapshot per country (overwritten each cycle, not append-only)
data/processed/    plans.json, providers.json, destinations.json, aggregates.json
scripts/ingest.py  ingestion pipeline
scripts/generate-og-image.py  deterministic OG image (public/og.png)
app/               Next.js App Router pages
```

## Local development

Prereqs: Node 18.18+, Python 3.9+.

```bash
npm install          # or npm ci after a lockfile exists
npm run dev          # Next.js dev server on http://localhost:3000
```

> Note: if a local install is blocked by an npm `allow-scripts` policy,
> `npm install --ignore-scripts` is sufficient — this project ships native
> binaries as optionalDependencies and needs no postinstall scripts.

## Running ingestion

```bash
python scripts/ingest.py                       # full pipeline (fetch → normalize → validate → score → write)
python scripts/ingest.py --destinations JP,TH  # fetch only specific countries
python scripts/ingest.py --offline             # skip network; reuse data/raw/*.json snapshots
python scripts/ingest.py --stage score --offline   # run one stage only, offline
```

The pipeline fetches the MeiSIM public catalog per destination, normalizes to a
canonical schema, drops/flags broken records (reported in
`data/processed/ingest_report.json`), deduplicates plans across country
snapshots, and computes per-destination rankings with a deterministic value
score (weights in `config/scoring.json`). Outputs:

- `data/processed/plans.json` — canonical, deduplicated plan records
- `data/processed/providers.json` — provider rollups (plan counts, coverage, price range)
- `data/processed/destinations.json` — per-destination coverage rollups
- `data/processed/aggregates.json` — per-destination cheapest/best-value/median price per GB — feeds on-page answer boxes
- `data/processed/ingest_report.json` — flagged/dropped record audit trail

Rebuild the site after ingestion:

```bash
python scripts/generate-og-image.py   # optional: regenerate public/og.png (deterministic)
npm run build        # static export to ./out
```

## Git hygiene

`data/raw/` keeps only the **latest** snapshot per country (files are
overwritten on every cycle). Full append-only history is intentionally not
retained; price-trend history is a future feature to design separately.

## Automation

Deployment pipeline is GitHub Actions + Cloudflare Pages (wired in Phase 6).
Triggered on a 12-hour schedule plus manual `workflow_dispatch`.