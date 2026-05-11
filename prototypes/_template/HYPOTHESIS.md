# {{PROTOTYPE_NAME}}

## Hypothesis
> {{HYPOTHESIS}}

## Variant
**A** — describe what makes this variant unique.

## Target audience
Who are we testing this with? (role, segment, sample size target)

## Success metrics
| Metric | Source event | Target |
|---|---|---|
| CTA click-through rate | `click` where `track == "cta-hero-primary"` / `pageview` on `#home` | > 15% |
| Signup completion rate | `signup_completed` / `pageview` on `#signup` | > 40% |
| Time to first CTA | `click` ts − first `pageview` ts | < 30s |

## What "validated" looks like
A short description of the threshold for declaring the hypothesis supported / rejected / inconclusive.

## Data
Open [the dashboard](../_shared/dashboard.html?id={{PROTOTYPE_ID}}) to see live metrics.
Each participant's events are kept in their own browser. Ask testers to click **Download JSON** in the dashboard and send you the file — then collate offline.

## Out of scope
- Real backend / persistence
- Authentication
- Anything not directly testing the hypothesis above
