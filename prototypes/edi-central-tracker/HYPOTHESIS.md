# EDI Central Tracker

## Hypothesis
> Retailers who can see the real-time status and detail of their EDI orders in a self-service tracker will need less support contact, because they will understand what happened to each order without calling BEES.

## Variant
**A** — Order-level list with filters, order detail drawer, and item-level page.

## Target audience
EDI-enabled retailer users (chain HQ buyers, store ops, account managers) with one or more POCs attached to their account.

> **Important:** Retailers are **read-only** users of this feature. Reprocess, bulk select, and any remediation actions are capabilities reserved for BEES operations teams and are **not** shown in this prototype.

## Metrics

| # | Name | Type | Threshold | Tracks |
|---|---|---|---|---|
| M1 | Self-service triage rate | **Primary** | ≥ 50% of sessions that land on the orders list also open ≥ 1 order detail (drawer or item page) | `order_drawer_opened`, `item_page_rendered` |
| M2 | Time to first useful action | **Time-to-action** | Median < 20s from first `pageview` on `#orders` to first `order_drawer_opened` or `filters_applied` | `pageview` → `order_drawer_opened` / `filter_applied` |
| M3 | Filter adoption | **Discovery** | ≥ 60% of sessions apply ≥ 1 filter before opening any order | `filter_applied` → `row-open-items` |
| M4 | Item-level drill-down | **Task completion** | ≥ 30% of sessions that open a drawer also navigate to the item-level page | `order_drawer_opened` → `item_page_rendered` |
| M5 | Status understanding signal | **Engagement** | ≥ 40% of sessions that open an order with a non-Accepted status also expand the detail drawer | `row-open-items` (non-Accepted) → `order_drawer_opened` |

## Tracked events
- `pageview` (hash routing) — auto
- `click` with `data-track="…"` — auto
- `filter_applied` — props: `{ filter, value }`
- `filters_cleared`
- `order_drawer_opened` — props: `{ status, vendor }` (no PO numbers logged)
- `item_page_rendered` — props: `{ status, lines, counts }`
- `period_set` — props: `{ days }` (interval length only, not the dates)

## Out of scope (this iteration)
- Reprocess actions of any kind (single row, drawer, bulk, item page) — ops-only capability
- Bulk selection UI
- Real backend / persistence (changes are in-memory)
- Authentication / POC entitlement enforcement (we simulate the logged-in user has 4 POCs)
- Export to CSV/Excel
- Pagination beyond client-side (the seed is small enough to render in full)

## Data
The prototype ships with ~80 mock EDI orders across 4 vendors, 12 POCs, 5 statuses, dates within the last 30 days. No real customer data is used.

## Privacy
- No PII is captured. Form values are NOT tracked.
- PO numbers are sensitive — they are NEVER logged in tracking events. Only counts, statuses, vendor names, and aggregated filter usage are captured.

## Dashboard
Open the [live dashboard](../_shared/dashboard.html?id=edi-central-tracker) to see metrics. Click **🗺 Heatmap** to see where users are clicking most.
