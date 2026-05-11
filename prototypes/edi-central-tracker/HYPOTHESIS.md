# EDI Central Tracker

## Hypothesis
> Retailers will adopt a self-service EDI order tracker (Order-level + Item-level) instead of contacting BEES support, increasing self-service resolution and reducing inbound contact volume.

## Variant
**A** — Order-level tab fully built; Item-level tab present as a placeholder pending detailed spec.

## Target audience
EDI-enabled retailer users (chain HQ buyers, store ops, account managers) with one or more POCs attached to their account.

## Success metrics
| Metric | Source event(s) | Target |
|---|---|---|
| **Self-service resolution rate** | `reprocess_triggered` / sessions | ≥ 30% of sessions trigger a reprocess on a rejected/alerted order |
| **Filter adoption** | `filter_applied` events / unique sessions | ≥ 60% of sessions apply ≥ 1 filter |
| **Time to first useful action** | first `filter_applied` OR `order_drawer_opened` ts − first `pageview` ts | < 20s median |
| **Order drill-down** | `order_drawer_opened` / sessions | ≥ 50% of sessions open ≥ 1 order detail |
| **Item-level demand signal** | `nav-item-tab` clicks / sessions | ≥ 25% (informs Item-level priority) |

## Tracked events
- `pageview` (hash routing) — auto
- `click` with `data-track="…"` — auto
- `filter_applied` — props: `{ filter, value }`
- `filters_cleared`
- `order_drawer_opened` — props: `{ status, vendor }` (no PO numbers logged)
- `reprocess_triggered` — props: `{ status_before }` (no PO numbers logged)
- `reprocess_completed` — props: `{ outcome }` (mock — randomly Accepted / Accepted with alerts)
- `period_set` — props: `{ days }` (interval length only, not the dates)

## Data
The prototype ships with ~80 mock EDI orders across 4 vendors, 12 POCs, 5 statuses, dates within the last 30 days. No real customer data is used.

## Out of scope (this iteration)
- Item-level view (placeholder only — pending spec)
- Real backend / persistence (changes are in-memory)
- Authentication / POC entitlement enforcement (we simulate the logged-in user has 4 POCs)
- Bulk reprocess
- Export to CSV/Excel
- Pagination beyond client-side (the seed is small enough to render in full)

## Privacy
- No PII is captured. Form values are NOT tracked.
- PO numbers are sensitive — they are NEVER logged in tracking events. Only counts, statuses, vendor names, and aggregated filter usage are captured.

## Data
Open the [live dashboard](../_shared/dashboard.html?id=edi-central-tracker) to see metrics. Click around the prototype first to generate sample events.
