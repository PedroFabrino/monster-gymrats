# Project memory

## Product intent & audience

- App appears to be a snack/food tracking or rating app featuring "flavors" and "off-brand" vs brand-name categorization
- Likely mobile-first or presented within a phone-frame UI

## Brand personality & voice

- Playful, casual tone (terms like "Flavor Counts", "Off-Brand switch")

## Visual design & UX direction

- Phone-frame layout simulating mobile viewport on desktop
- Card-based components (e.g., "Flavor Counts" card, "Selected" leaderboard section)
- Toggle/switch UI elements for filtering (e.g., Off-Brand toggle)
- Cards must clip horizontal overflow and shrink within the phone frame on narrow screens
- Layout uses container constraints; child components should respect parent boundaries

## Decisions, constraints & rationale

- Framework: Next.js (App Router likely)
- Toggle overflow fixed by clipping container and allowing flexible shrink within phone frame
- Stale Next.js generated build cache can cause false build failures; clearing generated build output resolves it
- Non-blocking ESLint warnings from Next.js ESLint plugin are acceptable as long as no compilation or type errors

## Open questions & assumptions

- Exact app purpose and data model for "flavors" and "off-brand" items still inferred
- Unknown whether the phone frame is a design choice for all screens or specific to Stats page
- Unclear if there are other pages with similar overflow risk that need the same fix