# LEDGER — Design Language for TaskFlow

A ground-up visual language for the Team Task Manager. Not a restyle: a different
set of convictions about what a work-tracking tool should look like.

---

## 1. Design philosophy

**A task manager is a ledger, not a brochure.**

The current UI treats every piece of information as a "card" — a floating,
rounded, shadowed object. That metaphor comes from marketing sites and it is why
the app reads as AI-generated: cards are what you get when a tool doesn't know
what the content _is_. But tasks, members, and activity are **records**. Records
belong in ruled lists, tables, and columns — the visual grammar of ledgers,
engineering notebooks, and print schedules.

Five convictions drive every decision below:

1. **Lines, not boxes.** Structure comes from 1px rules and background steps,
   never from shadows or heavy container chrome. A hairline says "these things
   are related" more quietly and more precisely than a card does.
2. **Ink is the interface.** One near-black, one warm paper tone, and a single
   persimmon accent used like a rubber stamp — for what is _active or urgent_,
   never for decoration. Color is information; if a color carries no meaning it
   doesn't ship.
3. **Data wears a monospace.** Counts, dates, percentages, statuses, and IDs are
   set in mono with tabular figures. This is the single strongest "handcrafted
   instrument" signal — numbers align into columns, scan vertically, and stop
   looking like body copy.
4. **Density is respect.** People who track work want more rows per screen, not
   bigger cards with more padding. Comfortable, not cramped — but the default
   leans dense (36–40px rows), the way Linear and Bloomberg lean dense.
5. **Light is the default.** Paper-warm light mode is the primary theme (dark
   remains available). Dark-by-default is the 2024 AI-tool tell; a warm light
   surface with true black ink immediately reads as designed.

What this kills from the current UI: rounded-2xl cards, hover `-translate-y`
lifts, icon-in-tinted-tile card headers, teal-on-charcoal, shadow-based
elevation, and the blueprint grid background.

---

## 2. Color system

Warm-neutral ramp (no blue-gray), one accent, four functional hues. All values
are design tokens; Tailwind classes must reference tokens, never raw palette
classes like `bg-emerald-500/15`.

### Core tokens — light (default)

```css
:root {
  color-scheme: light;

  /* Surfaces — elevation = background step, not shadow */
  --surface-page: #faf8f4; /* warm paper */
  --surface-raised: #ffffff; /* panels, popovers, rows on hover */
  --surface-sunken: #f1eee7; /* wells, column tracks, table headers */
  --surface-inverse: #1d1b16; /* ink-filled elements (primary buttons, tooltips) */

  /* Ink */
  --ink-primary: #1d1b16; /* body text — 15.4:1 on paper */
  --ink-secondary: #5c5850; /* supporting text — 6.4:1 */
  --ink-tertiary: #8a857a; /* timestamps, placeholders — 4.5:1 */
  --ink-inverse: #f7f5f0;

  /* Rules */
  --rule: #e3dfd5; /* default hairline */
  --rule-strong: #c9c4b8; /* section dividers, table header rule */

  /* Accent — persimmon, the "stamp" color */
  --accent: #c8501e; /* interactive fills, active marks */
  --accent-ink: #a03c12; /* accent as text — 5.6:1 on paper */
  --accent-wash: #f6e4da; /* selected-row / active-tab background */

  /* Functional — warm-shifted, never neon */
  --status-todo: #6e6a61; /* graphite */
  --status-active: #9a6b0f; /* ochre  (text-safe: 4.9:1) */
  --status-done: #3f6c33; /* moss   (text-safe: 5.6:1) */
  --status-danger: #a83226; /* oxide  (text-safe: 6.2:1) */
  --wash-active: #f3e8ce; /* ochre wash for badges */
  --wash-done: #e2ecdc;
  --wash-danger: #f5deda;

  --focus-ring: #c8501e;
}
```

### Core tokens — dark

Warm carbon, not blue-black. Same token names, remapped:

```css
.dark {
  color-scheme: dark;
  --surface-page: #171512;
  --surface-raised: #201d19;
  --surface-sunken: #121110;
  --surface-inverse: #f2efe8;
  --ink-primary: #ede9e0;
  --ink-secondary: #a8a296;
  --ink-tertiary: #7c776c;
  --ink-inverse: #1d1b16;
  --rule: #2e2b25;
  --rule-strong: #45413a;
  --accent: #e06a33;
  --accent-ink: #e8804f; /* 5.4:1 on carbon */
  --accent-wash: #3a251b;
  --status-todo: #8a857a;
  --status-active: #c9962e;
  --status-done: #7fa86b;
  --status-danger: #d9604f;
  --wash-active: #332a17;
  --wash-done: #232b1e;
  --wash-danger: #37201d;
  --focus-ring: #e06a33;
}
```

### Usage rules

- `--accent` fill appears in **at most two places per screen** (primary action +
  active nav mark). Everything else that's clickable is ink with an underline or
  weight change on hover.
- Status is always **glyph + label + hue**, never hue alone (see §9).
- `*-wash` backgrounds only ever pair with their matching text-safe hue.
- Primary buttons are **ink-filled** (`--surface-inverse`), not accent-filled.
  Reserving the accent for state rather than the biggest button is what makes
  the palette feel deliberate.

---

## 3. Typography

Three faces, three jobs. No Inter, no Geist.

| Role      | Face                      | Source                        | Why                                                                                                                         |
| --------- | ------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| UI / body | **Switzer**               | Fontshare (free, variable)    | Neutral grotesque with real character in the a/g/t — warmer than Inter, tighter than Helvetica clones                       |
| Display   | **Newsreader** (opsz 24+) | Google Fonts (free, variable) | Editorial serif for page titles and empty-state headlines only; one serif line per screen gives the "printed" voice         |
| Data      | **Spline Sans Mono**      | Google Fonts (free)           | Humanist mono for every number, date, count, status label, and email; `font-feature-settings: "tnum"` everywhere it appears |

Fallback stacks: `Switzer, "Helvetica Neue", Arial, sans-serif` /
`Newsreader, Georgia, serif` / `"Spline Sans Mono", ui-monospace, monospace`.

### Scale (rem, 1.0 = 16px)

| Token     | Size / line              | Face & weight        | Use                                     |
| --------- | ------------------------ | -------------------- | --------------------------------------- |
| `display` | 28/34, -0.5px            | Newsreader 500       | Page title (one per page)               |
| `title`   | 18/24, -0.25px           | Switzer 600          | Section headings, modal titles          |
| `body`    | 14/20                    | Switzer 400/500      | Default UI text, task titles (500)      |
| `small`   | 13/18                    | Switzer 400          | Supporting copy, descriptions           |
| `data`    | 13/18                    | Spline Sans Mono 400 | Dates, counts, emails, badges           |
| `data-lg` | 22/26                    | Spline Sans Mono 500 | Stat numerals                           |
| `label`   | 11/14, +0.8px, uppercase | Switzer 600          | Column heads, form labels, nav sections |

Rules: task/record titles are `body/500`, never larger — hierarchy in dense
lists comes from weight and ink level, not size. Uppercase `label` is the only
tracking-modified style. Maximum two sizes inside any list row.

---

## 4. Spacing system

4px base unit. Named steps, no arbitrary values:

```
--space-1: 4px    --space-5: 24px
--space-2: 8px    --space-6: 32px
--space-3: 12px   --space-7: 48px
--space-4: 16px   --space-8: 64px
```

**Density constants** (the rhythm of the app):

- List/table row height: **40px** (36px compact)
- Input & button height: **36px** (28px inline/compact)
- Panel padding: **16px**; page gutter: **24px** desktop / 16px mobile
- Section gap on a page: **32px**, marked by a `--rule` hairline, not whitespace alone
- Content max-width: **1120px** — narrower than the current 1280px; ledgers
  shouldn't stretch, and stat strips read better at fixed measure

---

## 5. Radius & elevation

### Radius — near-sharp

```
--radius-0: 0     tables, rules, panels, columns, nav
--radius-1: 3px   buttons, inputs, badges
--radius-2: 6px   modals, popovers, toasts  (maximum in the system)
--radius-round: 999px  avatars only
```

No rounded cards. Panels are square-cornered with hairline borders — the
sharpness is the brand.

### Elevation — background steps, one shadow

| Level     | Treatment                                                               | Used by                                                             |
| --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 0 base    | `--surface-page`                                                        | page                                                                |
| 1 raised  | `--surface-raised` + 1px `--rule`                                       | panels, table bodies                                                |
| 2 sunken  | `--surface-sunken`                                                      | column tracks, wells, `<thead>`                                     |
| 3 overlay | raised + `0 12px 32px -12px rgb(29 27 22 / 0.25)` + 1px `--rule-strong` | modals, popovers, mobile drawer — the **only** shadow in the system |

Hover on interactive rows = background shifts to `--surface-raised`/`-sunken`.
Never translate, never scale, never grow a shadow.

---

## 6. Component library

### Buttons

36px height, `--radius-1`, Switzer 500, 13px, 12px horizontal padding.

| Variant         | Idle                                                 | Hover                        | Notes                                      |
| --------------- | ---------------------------------------------------- | ---------------------------- | ------------------------------------------ |
| **Primary**     | ink fill (`--surface-inverse`), `--ink-inverse` text | fill lightens 8%             | One per view. Ink, not persimmon           |
| **Secondary**   | transparent, 1px `--rule-strong` border, ink text    | `--surface-sunken` bg        | Default for everything else                |
| **Ghost**       | transparent, `--ink-secondary` text                  | `--surface-sunken`, ink text | Icon buttons, row actions                  |
| **Destructive** | transparent, `--status-danger` text + border         | `--wash-danger` bg           | Confirm via dialog, never one-click delete |

Loading state: label fades to 40%, inline spinner replaces the leading icon —
button never changes size.

### Inputs

36px, `--surface-raised`, 1px `--rule-strong`, `--radius-1`, 13px Switzer.
Focus: border → `--accent`, plus 1px outer ring `--focus-ring` (2px total —
crisp, not a glow). Error: border `--status-danger`, message below in
13px mono with a `↳` prefix, linked via `aria-describedby`. Labels are `label`
style (11px caps) sitting 6px above. Date and email inputs render their value
in mono.

Selects: same box, chevron glyph, native `<select>` under the hood (keep the
current accessibility win). Textareas: 3 rows min, resize-y.

### Panels (replaces Card)

`--surface-raised`, 1px `--rule`, radius 0. Header = 40px row: `label`-style
title left, optional mono count or action right, hairline underneath. **No icon
tiles, no description line under every title.** If a panel needs explaining,
the title is wrong.

### Modals

Centered, 480px (forms) / 560px (confirm + content), `--radius-2`, level-3
elevation, scrim `rgb(29 27 22 / 0.45)`. Header: `title` + close ghost button +
hairline. Footer: hairline + right-aligned secondary-then-primary. Scrim click
and Esc close (with dirty-form guard). Focus trapped; returns to trigger on
close. Enter 150ms fade + 4px rise; exit 100ms fade.

### Navigation

- **Sidebar (desktop ≥1024px):** 220px, `--surface-page` (no separate sidebar
  tint) with a single `--rule` on the right. Wordmark "TaskFlow" set in
  Newsreader 500 italic 18px — the wordmark _is_ the logo; delete the
  checkbox-icon-in-teal-tile. Nav items: 36px rows, 13px Switzer 500,
  `--ink-secondary`; active = `--ink-primary` + 2px `--accent` bar flush left +
  `--accent-wash` background. Section labels in `label` style. User block at
  bottom: avatar + name, role shown as mono text ("ADMIN"), not a pill.
- **Top bar:** 48px, hairline bottom, breadcrumb in mono
  (`Projects / Q2 Launch`) instead of title+subtitle — the page already has a
  display title; the bar shouldn't repeat it. Right: theme toggle (ghost).
- **Mobile:** top bar + slide-in drawer (level-3), body scroll locked.

### Tables / ledgers (new primitive — the workhorse)

- Header row: `--surface-sunken`, `label`-style column heads, 1px
  `--rule-strong` below.
- Body rows: 40px, hairline separators, numeric/date/count cells in mono,
  **right-aligned numerals**.
- Row hover: background step + chevron affordance at row end. Whole row is the
  link (single `<a>`, not nested).
- Empty state lives _inside_ the table frame: one Newsreader line + one action.
- Mobile: table reflows to stacked two-line rows (see §8), same component.

### Badges → "stamps"

18px, mono 11px uppercase, 4px/6px padding, `--radius-1`, wash background +
matching text-safe hue, optional leading glyph: `● ACTIVE`, `▲ OVERDUE`,
`■ DONE`, `○ TODO`. Priority is not a badge — it's a small flag glyph + mono
letter (`⚑ H` in oxide, `⚑ M` in ochre, `⚑ L` in graphite) to keep task rows
quiet.

### Forms

Single column, 16px field gap, labels above, full-width primary at the end
inside modals. Inline validation on blur, summary on submit. Destructive
confirms use a modal with the object's name repeated in mono.

### Toasts

Bottom-right, level-3, 320px, mono 13px, 4s. Success prefix `✓` in moss, error
`✕` in oxide. No icons beyond the glyph.

---

## 7. Motion & interaction

Motion confirms; it never performs.

| Token      | Value                        | Use                                            |
| ---------- | ---------------------------- | ---------------------------------------------- |
| `--t-fast` | 100ms                        | hover/pressed states, exits                    |
| `--t-base` | 150ms                        | modals, popovers, drawer                       |
| `--t-slow` | 250ms                        | page-level list entrance (once per navigation) |
| easing     | `cubic-bezier(0.2, 0, 0, 1)` | everything                                     |

Rules:

- Animate **opacity and ≤4px transform only**. No scale, no hover lifts, no
  staggered card cascades.
- Page entrance: content fades in 4px rise, once, 250ms. Lists do not stagger.
- Status change on a task: row background flashes the target wash for 400ms
  then settles — confirmation without layout motion.
- Pressed state: buttons darken (`filter: brightness(0.95)`), no scale.
- `prefers-reduced-motion: reduce` → all transitions become 1ms; the wash-flash
  confirmation remains (it's information, not decoration).
- Skeletons: hairline-bordered gray bars in the exact geometry of the loaded
  state (row heights, column widths) — no shimmering rounded blobs.

---

## 8. Responsive behavior

Breakpoints: `sm 640` / `md 768` / `lg 1024` / `xl 1280`.

| Range    | Shell            | Content                                                                                                                                                                                                                                                                               |
| -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <768     | Top bar + drawer | Single column; tables become stacked rows (line 1: title + stamp, line 2: mono metadata); board becomes one column with a **segmented status control** (TODO / IN PROGRESS / DONE with counts) instead of vertical column stacking — nobody should scroll past 12 todos to see "Done" |
| 768–1023 | Top bar + drawer | Board shows 3 columns via horizontal scroll with snap points; stat strip wraps 2×2                                                                                                                                                                                                    |
| ≥1024    | Sidebar 220px    | Full layout, content max 1120px                                                                                                                                                                                                                                                       |

Density never changes across breakpoints — touch targets get bigger hit areas
via padding, not taller rows (min 44px effective touch target from row height +
separator).

---

## 9. Accessibility

- **Contrast:** every ink token ≥4.5:1 on its permitted surfaces (verified
  values in §2); text-safe status hues are separate tokens from wash hues so
  low-contrast pairings are unrepresentable. Large mono numerals (22px+) may
  use `--ink-secondary` (6.4:1 — still AAA-large).
- **Never color alone:** status = glyph + uppercase label + hue; overdue = `▲`
  - "OVERDUE" + oxide; priority = flag + letter. Fully legible in grayscale.
- **Focus:** 2px `--focus-ring` outline with 2px offset on every interactive
  element, `:focus-visible` only. The accent doubles as the focus color, so
  keyboard position is always the loudest thing on screen.
- **Keyboard:** modals trap focus and restore it; drawer likewise; board
  columns are `role="list"` with `aria-label="To do, 4 tasks"`; status select
  remains a native `<select>`; row-links are single anchors with the task title
  as accessible name.
- **Forms:** every input labeled (`<label for>`), errors tied via
  `aria-describedby`, submit errors announced via `aria-live="polite"` region
  (toasts alone are not announcements).
- **Hit areas:** 44×44 minimum on touch, including the row action icons
  (padding-extended).
- **Reduced motion** honored (§7). **`tabular-nums`** everywhere digits appear
  so screen-magnifier users get stable columns.
- Semantic landmarks: `<nav>`, `<main>`, one `<h1>` per page (the display
  title), panels use `<section>` + `<h2>`.

---

## 10. Page-by-page redesign plan

### 10.1 Auth (login / signup)

**Now:** centered rounded card on a blueprint-grid background, icon tile, teal
button. Pure template.

**Redesign — "the form is the page":** kill the card and the grid texture.
Left-aligned column (360px) at 38% viewport width on desktop, top-aligned at
20vh. Wordmark in Newsreader italic, one hairline rule, then `display` heading
("Sign in"), then the form directly on paper — no container. Primary button is
ink-filled, full width. Below a hairline: the seed-credentials hint
(admin@company.com / member@company.com) in mono inside a `--surface-sunken`
well — this app is demoed to interviewers; surfacing test logins is a real
usability win, not a hack. Right 62% of the viewport: `--surface-sunken` panel
with a single oversized Newsreader line ("Work, kept in order.") and nothing
else. Mobile: form only.

**Why:** a card floating on a texture says "template." A form set directly on
warm paper with one serif line says someone made a decision. Removing the
container also removes a border-radius/shadow decision that was fighting the
rest of the system.

### 10.2 App shell

**Now:** 256px sidebar with icon-tile logo, pill-highlight nav, user card with
role badge; header repeats the page title + subtitle; separate sidebar tint.

**Redesign:** 220px sidebar on the same paper surface (one hairline, no tint
change — fewer surfaces, calmer frame). Newsreader wordmark. Active nav = accent
bar + wash (already half-there; drop the rounded pill and icon recoloring).
Top bar becomes a **mono breadcrumb** (`Projects / Q2 Launch`) + theme toggle —
it stops repeating the h1 and starts doing the one job the pages can't:
location. User block: avatar, name, mono role text; logout as ghost icon
button on the row.

**Why:** the current shell spends three elements (sidebar title, header title,
page h2) saying the same word. One h1 per page, one breadcrumb for place. The
duplicated "Dashboard / Overview of your team's work" header row is pure
height with zero information.

### 10.3 Dashboard

**Now:** greeting, 4 metric cards (each an icon tile + number + hint), two
chart cards with icon headers, activity card. Textbook AI dashboard.

**Redesign — "the morning briefing":**

1. **Header:** `display` serif greeting stays (it's the one warm moment), date
   in mono to its right. No subtitle.
2. **Stat strip replaces the 4 cards:** one full-width panel, four segments
   divided by hairlines — `data-lg` mono numeral + `label` caption
   (`TOTAL 24 · IN PROGRESS 7 · DONE 12 · OVERDUE 2`). Overdue segment's
   numeral in oxide when >0, with `▲`. One row, ~64px tall, scannable in a
   single fixation.
   _Why:_ four separate cards make four equal claims on attention and waste
   ~120px of icon tiles and hint text. A strip is read as one sentence.
3. **"Board health" panel** merges the two chart cards: status distribution as
   three labeled hairline bars (wash fill, mono counts right-aligned), then a
   rule, then per-person workload as ledger rows (avatar, name, mono count,
   thin bar). Same data, one frame, aligned columns.
   _Why:_ the two cards were the same chart type twice with different icons;
   merging aligns their numerals into one scannable column.
4. **Activity ledger:** table-style rows grouped by day (`TODAY`, `YESTERDAY`
   labels in caps), each row: mono time (`14:32`), actor in 500, action in
   secondary ink, project as a plain mono link — not a badge.
   _Why:_ "3 hours ago" times can't be compared; a mono time column under a
   day header can. Badges for project names made every row shout.

### 10.4 Projects

**Now:** heading + "Admin mode" badge, permanently-open create-project card,
3-column card grid with icon tiles and hover lifts.

**Redesign — projects are a ledger, not a gallery:**

1. **Header row:** `display` "Projects" left, mono count (`12 PROJECTS`), and
   a single primary ink button "New project" right (admins only). Delete the
   "Admin mode" badge — capability is shown by which controls exist, a
   principle applied app-wide.
2. **Create moves into a modal.** The always-open create card was the largest
   element on the page and irrelevant 95% of the time; members saw a page
   organized around a form they couldn't use.
3. **Card grid → ledger table:** columns `PROJECT` (name in 500 + one-line
   description in tertiary), `TASKS`, `MEMBERS` (mono, right-aligned), `DONE`
   (thin moss bar + mono %), `UPDATED` (mono absolute date). Rows are 48px
   links with chevron on hover.
   _Why:_ with cards you can't compare projects; a table makes "which project
   is stalling" answerable in one glance, adds a progress signal that didn't
   fit on the cards, and doubles information density. Grids are for images;
   these records have zero visual identity to justify one.
4. **Empty state** inside the table frame: Newsreader line ("Nothing on the
   books yet.") + primary button.

### 10.5 Project detail

**Now:** back-link, icon tile + title, two filter selects floating top-right,
4 stat pills, kanban columns of shadowed cards, right rail with always-open
create-task card + members card + a hint box about filters.

**Redesign — the board becomes the whole stage:**

1. **Header:** breadcrumb handles "back"; delete the icon tile and back-link.
   `display` project name, description in secondary, and the stat strip from
   10.3 compressed into a single mono line under the title
   (`24 TASKS · 7 ACTIVE · 50% DONE · ▲ 2 OVERDUE`). Right: "New task"
   (primary, admins) + filter controls as compact 28px selects.
   _Why:_ the current page spends ~240px before the first task. Work tools
   earn trust by showing the work immediately.
2. **Full-width board** (right rail removed): three columns on `--surface-sunken`
   tracks, square corners, header row per column (`○ TO DO` + mono count,
   hairline). Task items are **rows, not cards**: 1px hairline separation on
   the raised surface, title in 500; second line in mono — flag glyph+letter
   priority, due date (`JUL 04`, oxide + `▲` when overdue), assignee initials.
   Status control: compact 28px select at the row end for those who can change
   it; readers get plain mono text, **no lock icon** — showing a padlock to
   members turns a permission into a taunt; absence of a control is enough.
   Edit/delete: ghost icons on hover _plus always in keyboard focus order_;
   delete opens a confirm modal (currently it's a one-click destroy — a real
   bug, not just a style issue).
3. **Create/edit task → modal** (480px), opened by "New task" or row-edit.
   Same form, better placed: the permanent sidebar form forced the board into
   ⅔ width and blurred create vs. edit state.
4. **Members → popover panel** from a ghost "Members (4)" button in the header:
   ledger rows (avatar, name, mono email, mono role, owner marked `OWNER` in
   accent-ink), add-by-email row pinned at bottom for admins.
   _Why:_ membership is consulted occasionally, not monitored constantly; it
   doesn't earn 33% of permanent screen width.
5. Delete the "use the filters above" hint box — with the header consolidated,
   filters are adjacent to the board and self-evident.

### 10.6 System-wide deletions (the discipline list)

- Icon-in-tinted-tile headers — everywhere, gone.
- Hover translate/scale lifts — replaced by background steps.
- Redundant subtitles under every heading — a title that needs a subtitle
  needs a better title.
- Badges as decoration (role badges, project-name badges) — mono text.
- Blueprint grid background, teal glow selection, gradient anything.
- `formatDistanceToNow` in lists — absolute mono dates (`JUL 02`, `14:32`);
  relative time survives only in the dashboard day-group headers.

---

## Implementation notes

- Tokens land in `globals.css` under `@theme` (Tailwind v4 already in use);
  components then consume `bg-surface-raised`, `text-ink-secondary`, etc.
  Grep-kill acceptance test: zero raw palette utilities
  (`teal-*`, `emerald-*`, `amber-*`, `red-*`, `sky-*`) outside token definitions.
- Fonts: Switzer via Fontshare CDN or self-host; Newsreader + Spline Sans Mono
  via `next/font/google`. Drop Geist.
- Build order: tokens + fonts → primitives (`button`, `input`, `panel`,
  `stamp`, `table`, `modal`) → shell → auth → projects → dashboard → project
  detail (largest change last, on stable primitives).
- `task-meta.ts` keeps its shape; swap Tailwind class strings for token
  classes and add the glyph characters (`○ ● ■ ▲ ⚑`).
