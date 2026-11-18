# Bolt.new Master UI/UX Prototype Prompt — Monster GymRats

Copy and paste the entire prompt below into **bolt.new**:

---

```text
Build a high-craft, mobile-first interactive UI/UX prototype for **Monster GymRats** — a GymRats-style social Progressive Web App (PWA) for friends to track daily Monster Energy intake via photo check-ins, auto-detect flavors from photos/barcodes, collect flavors in a Pokédex-style "Flavor Dex", and compete in permanent Clubs and time-bounded Challenges.

### 1. Tech Stack & Code Structure
- **Framework**: Next.js (App Router) + TypeScript (`strict: true`, zero `any`) + Tailwind CSS + `lucide-react` icons.
- **PWA-ready viewport**: Mobile-first layout (`max-w-[430px]` centered phone frame on desktop screens with subtle bezel/toggle, edge-to-edge full screen on mobile viewports) with persistent bottom tab navigation and a raised center `+ Check-In` action button.
- **State & Architecture**: Cleanly separate UI components from typed domain data and mock state (`src/data/mock-data.ts`, `src/types/domain.ts`) so the screens, modals, tabs, filters, reactions, disputes, and check-in simulator are 100% interactive client-side while matching our future Supabase + OpenAI-compatible Vision LLM API contracts.
- Use **named exports** for all domain/component modules (default exports only for Next.js `page.tsx`/`layout.tsx`).

### 2. Design System — "Midnight Claw / Neon Energy"
- **Visual Identity**: Sleek, dark-mode-first athletic/energy social app combining GymRats' addictive friend-group feed warmth with Monster Energy's obsidian-and-volt contrast and tactile Pokédex collectible cards.
- **Color Tokens**:
  - Background Canvas: `#0A0B0E` (Void Obsidian)
  - Card Surface: `#13161C` (Carbon Slate)
  - Elevated Sheet / Modal: `#1C2029` (Graphite)
  - Hairline Border: `#262B36`
  - Primary Brand Accent: `#95D600` (Monster Acid Volt — primary CTAs, active nav, Monster Streak flame)
  - Flavor Series Accents:
    - Ultra: `#00D4FF` (Ice Cyan) / `#E2E8F0` (Ultra White)
    - Original / Nitro: `#95D600` (Volt Green)
    - Juice / Juiced: `#FF9F1C` (Mango Gold) & `#FF4D8D` (Pipeline Pink)
    - Rehab: `#FFB703` (Tea Amber)
    - Reserve / Java: `#C084FC` / `#D97706`
  - Semantic Status:
    - Verified: `#22C55E`
    - Off-Brand / Traitor Can: `#F97316`
    - Retroactive Check-In: `#38BDF8`
    - Unverified Can Warning: `#EAB308`
    - Dispute ("Call BS") / Voided: `#EF4444`
- **Typography**:
  - Display / Headers / Leaderboard Numbers: `Barlow Condensed` (bold, uppercase accents where punchy) or `Space Grotesk`
  - Body / Chat / Comments: `Inter`
  - Metrics (caffeine mg, counts, percentages, countdowns): `JetBrains Mono` with `tabular-nums`
- **Core UI Primitives**:
  - Tactile **Flavor Pills** (color dot + series + flavor name + caffeine mg)
  - **Badge Chips** (`Retroactive`, `Off-Brand / Traitor Can`, `Pending Flavor`, `⚠️ Unverified Can`, `BS Disputed`)
  - Bottom Sheets with smooth slide-up transitions for Check-In Flow, Flavor Detail, Install Guide, Dispute ("Call BS"), and Wrapped Cards.

### 3. Canonical Domain Vocabulary (Use These Exact Terms Everywhere)
- **Check-In** (never "workout" or "drink log") — 1 physical can photo
- **Club** (permanent friend group) & **Club Timeline** (unified feed + chat stream)
- **Challenge** (club-private) & **Community Challenge** (platform-wide, Individual + Club vs. Club)
- **Flavor**, **Flavor Series**, **Flavor Dex**, **Club Flavor Dex**, **Flavor Champion**, **Flavor Request**
- **Monster Streak** (consecutive days drinking Monster)
- **Off-Brand Check-In** (e.g., Red Bull — allowed in Club feed with playful badge, excluded from Monster Challenges/Streak/Dex)
- **Daily Point Cap** (default `1 can/day` for volume challenge points, decoupled from true Flavor Counts & Flavor Dex unlocks)
- **Dispute** ("Call BS") & **Retroactive Check-In** (up to 24h window)

### 4. Screens & Exact Contents to Build

Make every screen below reachable and interactive via the bottom navigation bar (**Clubs**, **Challenges**, **+ Log**, **Flavor Dex**, **Stats**) plus top-bar/sheet routes:

1. **Auth, Invite Landing & Guided PWA Install Onboarding (Accessible via Demo Switcher or Banner `/join/night-shift`)**:
   - Friend invite card: *"Pedro invited you to join **Night Shift Monsters** • 12 members • 38/62 Flavors Unlocked"*.
   - Sign-in buttons: **Continue with Google**, **Continue with Discord**, and **Email Magic Link / Password**.
   - First-login flair setup: Display Name, Avatar picker, and Signature Monster Flavor badge.
   - **Interactive "Add to Home Screen" Tutorial Sheet**: OS selector tabs (**iOS Safari** | **Android Chrome** | **Installed Standalone**) with crisp step-by-step illustrated instructions (Share icon -> Scroll -> "Add to Home Screen" -> Enable Push Notifications).

2. **Clubs Home (`/clubs`)**:
   - Top Header: App wordmark (`MONSTER RATS`), user's live **Monster Streak pill** (`🔥 14d`), notification bell (with unread badge), and **"+ Create Club"** / **"Join by Code"** buttons.
   - Highlighted **Community Challenge Banner**: e.g., *"Global Monster Dex 2026 — 4,812 players • Ends in 12d"* with quick CTA.
   - List of joined permanent **Clubs**: Each card shows Club name, member avatar stack, today's cans count, current monthly leader, and a mini **Club Flavor Dex** completion bar (`38 / 62 Flavors • 61%`).

3. **Unified Club Timeline (`/clubs/[id]`)**:
   - Sticky Header: Club name, member count, **"Copy Invite Link"** button (shows toast), and sub-tabs: **Timeline** | **Leaderboard** | **Club Flavor Dex** | **Challenges**.
   - **Timeline Filter Chips**: `All Activity` | `Check-Ins Only` | `Media Gallery` (3-column photo grid of cans).
   - **Unified Chronological Stream** mixing:
     - **Check-In Cards**: Header (avatar, username, favorite flavor flair, timestamp), full-bleed can photo (can use crisp styled placeholder/SVG can art or realistic photography cards), Flavor Pill (`Monster Ultra Zero • 473ml • 150mg`), 1–5 star rating, optional price (`$2.99`), caption, contextual badges (`Retroactive • 3h ago`, `Off-Brand / Traitor Can` on a Red Bull card, `Pending Flavor` on a Flavor Request card, `⚠️ Unverified Can`), **Reaction Bar** (`⚡ 4`, `🤍 2`, `🚨 1` — interactive toggle), **Comments button** (opens inline/sheet comment thread), and **"Call BS"** button (opens Dispute modal; show one active Dispute card with `2 / 3 votes • 41h left` progress bar and Admin Clear/Void controls).
     - **Chat Messages & System Events**: Casual friend messages (`"Who drained the gas station Ultra Rosa?"`) and milestone callouts (`"🔥 Lucas unlocked Monster Bad Apple for the Club!"`).
   - Sticky bottom chat input bar (`Message Night Shift Monsters...`) that appends real messages into the mock timeline.
   - **Club Leaderboard Sub-tab**: Member rankings for *This Month* and *All-Time*, plus Club Flavor Counts and `Flavor Champion` crowns.

4. **Check-In Camera, Vision LLM & Barcode Flow (Center `+` FAB Sheet)**:
   - Interactive 3-step modal:
     - **Step 1 (Snap / Scan)**: Simulated camera viewfinder with 5 one-tap **Sample Photo Presets** so anyone testing the prototype can experience every path:
       1. *Monster Ultra Zero (Clear Shot)* -> high-confidence Vision match
       2. *Monster Mango Loco (Dark Room)* -> uses **"Scan Barcode"** deterministic fallback
       3. *Red Bull Sugarfree (Off-Brand)* -> triggers `Off-Brand Check-In` tag
       4. *Rare Imported Flavor (Not in Catalog)* -> triggers **Flavor Request** submission
       5. *Empty Desk / Grocery Shelf* -> triggers **Non-Can Warning** with *"Retake"* vs. *"Post Anyway (⚠️ Unverified Can)"* override
     - **Step 2 (AI Identification & Details)**: Animated scanning state -> Match card (`98% Match` + top-3 runner-up chips + searchable catalog fallback + `"Missing flavor? Submit Flavor Request"`). Optional controls: Can size (`355ml` / `473ml` / `500ml` / `710ml`), 1–5 star rating, price paid, caption, and **"Log Retroactive (up to 24h ago)"** timestamp selector.
     - **Step 3 (Group Share Fan-Out)**: Pre-checked toggle list of all joined **Clubs** and active **Challenges** (with 1-tap uncheck toggles), showing a clear notice when an `Off-Brand Check-In` is automatically deselected from Monster-only Challenges, and a clear readout: *"Logs +1 Personal & +1 Global — never double-counted"*. Posting immediately injects the new Check-In into the active Club Timeline, Dex, and Stats!

5. **Challenges & Community Challenges Hub (`/challenges`)**:
   - Tabs: **Club Challenges** | **Community Challenges** | **+ New Challenge**.
   - Challenge Cards showing Scope (`Club` vs. `Global Community`), Brand Rule (`Monster Only` vs. `Multi-Brand`), Scoring Mode (`Total Cans` | `Flavor Dex Mode` | `Active Days` | `Flavor Hunter Points`), and `Daily Point Cap: 1 can/day` pill.
   - **Challenge Detail Sheet/View**:
     - Switcher on Community Challenges: **Individual** | **Club vs. Club (Total)** | **Club vs. Club (Average)**.
     - Interactive explainer banner: *"Daily Point Cap (1/day): Your 2nd can today gave +0 volume points here, but still counted +1 to Flavor Counts & unlocked a new Flavor Dex slot!"*
     - **Create Challenge Modal**: Name, date range, Brand scope toggle, Scoring Rule selector (all 4 modes), Daily Point Cap stepper (default `1`), Club vs. Community toggle.

6. **Flavor Dex — Personal & Cooperative Club Pokédex (`/dex`)**:
   - Segmented control: **My Flavor Dex** | **Club Flavor Dex** (club dropdown) | **Flavor Requests**.
   - Hero progress ring (`28 / 62 Monster Flavors • 45%`), Search bar, and **Flavor Series** filter chips (`All`, `Ultra`, `Original`, `Juice`, `Rehab`, `Java`, `Reserve`, `Nitro`).
   - Rich Pokédex Grid containing **24+ seeded canonical Monster flavors** (with realistic colors, names, series, caffeine/sugar) + 2 off-brand entries:
     - **Unlocked flavors**: Vibrant series border, styled metallic/neon can graphic, count badge (`x14`), and `👑 Champion` indicator in Club mode.
     - **Locked flavors**: Matte dark silhouette (`"???"` or dimmed name, `"0 logged"`).
   - **Flavor Detail Bottom Sheet** (opens on tap): Series, volume, caffeine mg, sugar g, **Personal Count & Avg Rating**, **Club Count + First Discoverer + Club Flavor Champion**, and **Global Count + Global Rank** (with *All-Time / Year / Month / Week* toggle).

7. **Stats, Global Flavor Counts & Profile (`/stats`)**:
   - Time Filter Bar: **All-Time** | **This Year** | **This Month** | **This Week**.
   - **Flavor Count Leaderboard** with 3 scope tabs (**Personal** | **Club** | **Global**) showing ranked horizontal bar charts of top flavors (e.g., `#1 Ultra Zero — 142,810 global cans`) + toggle to view Off-Brand breakdown.
   - **Monster Streak & Calendar Heatmap**: Current Streak (`14 days`), Longest Streak (`29 days`), and monthly calendar grid distinguishing Monster days (Volt Green), Off-Brand-only days (Orange), and rest days.
   - **Profile & Settings Drawer**: Edit display name & signature flavor flair, **5 Web Push Notification toggles** (*New Club Check-In*, *Call BS Dispute*, *Reactions & Comments*, *Club Chat @mentions*, *Challenge Recaps*), **"PWA Install Guide"** button, and **"Share Wrapped Recap Card"** modal (a sleek downloadable-style poster card showing Total Cans, Top 3 Flavors, Flavor Dex %, Longest Streak, and Flavor Champion crowns).
```
