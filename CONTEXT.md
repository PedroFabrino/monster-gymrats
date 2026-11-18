# Monster GymRats

A social tracking and competition platform where friends log daily Monster Energy (and optional other energy drink) consumption via photo check-ins, collect flavors in personal and club catalogs, and compete in permanent clubs and time-bounded challenges.

## Language

### Core Intake & Catalog

**Check-In**:
A single recorded beverage consumption event by a Member, representing one physical can and backed by a photo, timestamp, and matched Brand and Flavor.
_Avoid_: Workout, post, drink log, intake entry

**Brand**:
The beverage manufacturer of a logged can, with Monster Energy as the primary first-class brand and other beverages (e.g., Red Bull, Reign) classified for social logging and brand-filtered challenges.
_Avoid_: Make, company, vendor

**Off-Brand Check-In**:
A Check-In of a non-Monster beverage allowed in Club feeds (badged as an "Off-Brand / Traitor Can" in Monster-focused Clubs) and tracked by brand/flavor, but excluded from Monster-scoped Challenges, the primary Monster Flavor Dex, and the Monster Streak.
_Avoid_: Invalid check-in, rejected can

**Flavor**:
A canonical entry in the official catalog defined by its Brand, name, Flavor Series, default volume and nutritional profile (caffeine, sugar), barcode(s), and visual can characteristics.
_Avoid_: Drink, product, SKU, variant

**Flavor Series**:
The official product line a Flavor belongs to within its Brand (e.g., Ultra, Original, Juice, Rehab, Java, Reserve, Nitro).
_Avoid_: Category, type, sub-brand

**Flavor Dex**:
A collection progression view tracking which canonical Flavors a Member or Club has unlocked at least once versus which remain uncollected.
_Avoid_: Catalog view, badge list, trophy room

**Club Flavor Dex**:
A cooperative Flavor Dex shared by all members of a Club, where any member logging a Flavor unlocks that slot for the entire Club and records the first discoverer.
_Avoid_: Group catalog, team trophy room

**Flavor Champion**:
The Member within a Club (or globally) who has logged the highest valid Check-In count for a specific Flavor during a given time window.
_Avoid_: Top user, flavor leader

**Flavor Request**:
A user-submitted proposal to add a missing, regional, or newly released flavor to the canonical catalog, posted immediately as a provisional Check-In and merged once verified.
_Avoid_: Custom flavor, ad-hoc flavor

### Social & Competition

**Club**:
A permanent friend group with an ongoing shared Club Timeline, cooperative Club Flavor Dex, and lifetime/monthly leaderboards.
_Avoid_: Team, guild, server, room

**Club Timeline**:
The unified chronological stream inside a Club interleaving Check-In cards (with reactions and comment threads) and group chat messages, with a toggle to filter to Check-Ins only.
_Avoid_: Separate chat room, wall

**Challenge**:
A time-bounded competition with a start date, end date, brand scope, and scoring rule, hosted either privately within a Club or publicly as a Community Challenge.
_Avoid_: Tournament, event, contest, league

**Community Challenge**:
A platform-curated Challenge open to any Member (Individual mode) or Club (Club vs. Club total or average mode) across the platform, running independently or concurrently with local Club Challenges.
_Avoid_: Global event, public tournament

**Daily Point Cap**:
The maximum number of cans per calendar day (defaulting to 1 can/day) that contribute points toward a volume-based Challenge leaderboard, preventing unhealthy over-consumption for points while still recording all cans in personal, Club, and Global flavor counts and Flavor Dex unlocks.
_Avoid_: Check-in limit, hard block, rate limit

**Group Share**:
The projection linking a single canonical Check-In to a specific Club or Challenge so one physical can appears in multiple feeds and standings without multiplying personal or global totals.
_Avoid_: Cross-post, duplicate check-in, repost

**Monster Streak**:
The headline count of consecutive calendar days (in a Member's local timezone) on which the Member has recorded at least one valid Monster Energy Check-In, tracked alongside general calendar activity.
_Avoid_: Combo, chain

### Trust & Moderation

**Retroactive Check-In**:
A Check-In logged after the moment of consumption (within the allowed 24-hour window) or carrying photo metadata from earlier than the submission time, badged visibly in feeds.
_Avoid_: Backdated post, late log

**Dispute**:
A formal challenge ("Call BS") raised by Club members or admins against a suspicious Check-In (such as a store-shelf photo or reused image), which voids the Check-In from Club, Community Challenge, and Global standings if upheld.
_Avoid_: Report, flag, downvote
