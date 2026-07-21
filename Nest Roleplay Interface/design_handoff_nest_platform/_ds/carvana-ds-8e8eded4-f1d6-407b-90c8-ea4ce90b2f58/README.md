# Carvana Design System

A design system for **Carvana.DS** (`@carvana/ds-*`), Carvana's in-house component
library. This folder packages the tokens, typography, iconography, UI kits, and
sample brand-correct screens you need to design for Carvana.com

## Sources

For high-frequency components (Button, TextInput, Badge, etc.) the
UI kit already ports the real source — use the kit directly. For the long
tail, fall back to the source-of-truth chain.

| Layer | Where | When to use |
|---|---|---|
| **0. UI kit** | `ui_kits/carvana-web/` — per-component files (`Button.jsx`, `TextInput.jsx`, …) re-exporting from the `kit*.jsx` impl modules; all bundled into `_ds_bundle.js` | First stop — see the component index in `SKILL.md` for what's covered |
| **1. Guidelines** | `guidelines/components/{name}.md` | Usage rules, props, "do not use when…" — regardless of source |
| **2. Implementation** | `CVNA-TAF/Carvana.DS` GitHub repo, under `packages/{name}/src/lib/` — read `{name}.module.css`, `{Name}.tsx`, `{name}.types.ts` | Real DOM + CSS for on-demand ports (components not in the kit) |
| **3. Visual ref** | `preview/{name}.html` in this folder | A rendered sanity check — *not* a spec |

**Rule:** if the kit exports it, use the kit. If not, read layer 1 + layer 2
before building. Never treat `preview/*.html` as a spec — the preview cards
are compiled artifacts and drift-prone; the repo is canonical.

Other sources:

- **Figma file** — `Patterns.fig` (mounted virtual filesystem during authoring).
  Pages explored: `/Content-Lockup`, `/Footer`, `/FAQ`, `/Layout-Block`,
  `/Navigation-Web`, `/Review`, `/Table`, `/Vehicle-Tile`.
- **Tokens** — `packages/styles/` in the repo (mirrored into `styles/` here).

## What's in this folder

```
README.md                    ← this file
SKILL.md                     ← agent-invocable skill descriptor
styles.css                   ← single global stylesheet entry (consumers link this)
colors_and_type.css          ← thin "fg1 / h1 / body" convenience sheet
styles/
  tokens.css                 ← @import bundle (fonts → reference → theme → type)
  fonts.css                  ← @font-face declarations
  reference.css              ← raw color primitives (blue-500, slate-600…)
  cvna-theme.css             ← semantic light theme (data-theme="carvana")
  cvna-dark-theme.css        ← semantic dark theme
  cvna-typography.css        ← --heading-*, --body-*, --brand-* type tokens
assets/
  logo-horizontal-default.svg  ← Carvana horizontal lockup (navy wordmark)
  logo-horizontal-inverse.svg  ← Carvana horizontal lockup (white wordmark, for dark bg)
  logo-logomark-default.svg    ← standalone disc + car-with-halo mark
  logo-stacked-default.svg     ← mark-above-wordmark (navy)
  logo-stacked-inverse.svg     ← mark-above-wordmark (white, for dark bg)
  footer-bg.png              ← marketing footer/hero background
  vehicle-hero.png           ← sample vehicle photography
preview/                     ← design-system-tab preview cards
ui_kits/
  carvana-web/               ← Carvana.com responsive UI kit
```

## Quick start

Drop one line into the `<head>` of any mock:

```html
<link rel="stylesheet" href="styles.css" />
<body data-theme="carvana"> … </body>
```

`styles.css` is the single entry — it `@import`s the token bundle plus the
convenience classes. (`styles/tokens.css` alone also works if you don't want
the atomic classes.)

To use the React components, load the compiled bundle and read the namespace:

```html
<script src="_ds_bundle.js"></script>
<script type="text/babel">
  const { SiteNav, Button, TextInput } = window.CarvanaDS_8e8ede;
</script>
```

All tokens are CSS custom properties. Use the semantic layer (`--text-default`,
`--background-primary`, `--heading-lg`, `--spacing-xl`, `--border-radius-md`) —
don't reach into the reference layer directly unless you are defining a new
semantic token.

## Content fundamentals

Carvana's voice is **bold, enthusiastic, caring, approachable, supportive** —
"helpful human," never hype. The canonical rules live in
`guidelines/ux-writing/overview-ux-writing.md`;
highlights:

- **Casing** — sentence case is the default. Title case for nav, tabs, short
  CTA buttons, breadcrumbs, days/months/states. **ALL CAPS only** for headlines
  actually set in Brandon for Carvana (the display face).
- **Voice/person** — second person ("You") for the customer, never first-person
  plural royal "we." Write like a helpful human; cut "please note," "at this
  time," "we just need," "simply."
- **CTAs** — start with a verb, keep short. "Start purchase," "See all cars,"
  "Get my offer." Full-sentence buttons go sentence case; short CTAs go title
  case. Never all caps.
- **Errors** — say what happened + what to do next, in plain language. Don't
  blame the user; don't apologise unnecessarily.
- **Contractions** — yes, use them. "You're," "we'll," "don't." Avoid slangy
  ones.
- **Emoji** — **not used** in product UI. Use Lucide icons or Carvana's own
  `*Cvna`/`*Spot` icons instead.
- **Ampersands** — only in proper names or where space demands it.
- **Punctuation** — no serial comma in simple sentences; em-dash for breaks in
  thought; exclamation points sparingly; ellipses only for truncation/quotes.

### Example copy

> **Empty state —** *Your favorites list is empty.* / *Favorite cars to compare
> them side-by-side.* / **Browse cars**
>
> **Success —** *Offer accepted.* / *We'll email your delivery options shortly.*
>
> **Error —** *We couldn't process your card.* / *Check the number and try
> again, or use a different payment method.*
>
> **Nav —** Shop, Finance, Sell/trade, How it works, About Carvana, Support
>
> **Hero —** **THE NEW WAY TO BUY A CAR** (Brandon display, all caps) /
> *7-day money-back guarantee. Nationwide delivery. No-haggle pricing.*

## Visual foundations

### Color

- **Brand anchors:** `--brand-primary` is **Carvana Blue** (`#228be6`, a bright
  mid-blue). `--brand-secondary` is **Navy** (`#0d375e`) — the wordmark and
  most headline text. `--brand-tertiary` is a warm yellow (`#fab005`) used as
  an accent, never for body fills.
- **Neutrals** are **slate** — cool, blue-tinged grays (slate-50 → slate-800),
  plus a neutral `gray-*` ramp used for muted backgrounds. Do not mix stone or
  other warm neutrals.
- **Canvas** stays white (`--canvas-default`). `--canvas-muted` (`gray-100`)
  creates gentle section separation.
- **Semantic feedback:** critical=red, success=green, warning=yellow,
  informational=indigo. Always pair a bold fill with its `-subtle` variant for
  tinted backgrounds (e.g. `background-success-subtle` + `text-success`).
- **Decorative** (`--decorative-1..4`, `--decorative-ev`, `--decorative-pre-order`)
  is for illustration and marketing moments only — never for UI text/icons that
  must meet contrast.
- **Dark mode** ships via `data-theme="carvana-dark"` and rotates slate/blue
  hierarchies — don't hand-roll colors for dark.

### Typography

- **UI face: Inter**, weights 400/500/600/700 (also 300/800/900 loaded).
- **Display face: Brandon for Carvana** — a custom, condensed, heavy geometric
  sans used ALL CAPS for brand moments and hero headlines. Loaded from
  `fonts/BrandonforCarvana-Black.woff2` (900 Black).
- **Scale** is unified across heading/label/body/brand families with matched
  breakpoints (`xs` → `5xl`). Use `var(--heading-lg)` etc. as a single `font:`
  shorthand; each token ships letter-spacing, paragraph spacing and text-case
  helpers alongside.
- **Never shrink body below 16px** to fit more content. Default body is
  `--body-regular-md` at 16/24.

### Spacing & radii

- 13-step spacing scale (`xs` 2px → `9xl` 120px). Common Auto Layout sizes:
  icon↔text 8px, header↔body 16px, form-field stack 8px, CTA gap 40px,
  section gap 56–80px.
- Radius default is **`md` = 8px**. `lg`/`xl`/`2xl` scale with container size.
  `round` = pill. Don't invent in-between radii.

### Surfaces, shadows, borders

- Cards are **white** surfaces with either (a) `border: 1px solid
  var(--border-subtle)` and no shadow, or (b) a soft elevation shadow
  (rare — Carvana favors borders over shadow). Rounded at `--border-radius-lg`
  (12px) for content cards.
- Dividers: `1px solid var(--border-subtle)`; `border-default` for stronger
  separation; `border-strong-transparent` for a softer deep-blue edge.
- Selection/focus: `2px` outline in `--border-primary` with a 2px offset.

### Imagery

- Vehicle photography is **crisp, neutral, studio-lit** — even grey
  backgrounds, no grain, no filter. Marketing imagery shows delivery trucks /
  Carvana vending machines in natural light.
- **No gradients** as decorative flourish. Occasionally a protection gradient
  at the bottom of a hero image for legibility, never a purple/blue mesh.
- Illustrations are clean flat-color (spot illustrations from
  `@carvana/ds-icons`, `*Spot` suffix).

### Motion

- **Subtle, fast, no bounce.** Standard CSS easing (`ease` / `ease-out`),
  120–200ms for hovers, 240–320ms for enter/exit. No elastic, no scale-up
  above 1.04. Hover = background shifts by one step (`-hover` token). Press =
  `-active` token + no scale. Focus = 2px primary ring.

### Layout

- The UI kit is responsive: `SiteNav` and `SiteFooter` observe their
  container width (not the viewport) via `ResizeObserver` and switch between
  three layouts at **1024px** (desktop ↔ compact) and **640px** (tablet ↔
  mobile).
- **Desktop (≥1024)** header is **76px tall**, full-width, white, bordered
  bottom (`border-subtle`), 40px horizontal padding. Logo + nav tabs +
  right cluster on one row.
- **Compact (<1024)** stacks into a 64px logo row on top and a 56px tab
  row below, both 24px horizontal padding, no divider between them.
- Content max-width ≈ 1440px; additional breakpoints at **xs 0 / sm 768 /
  md 1024 / lg 1280 / xl 1440**.
- Touch targets must be ≥44×44px on any surface that might be used on
  a phone — the nav's avatar-and-menu pill is 78×44, heart button 44×44.

### Transparency / blur

- Used sparingly: scrim behind modals (`--canvas-overlay` = slate-700 at 60%),
  capsule-over-image patterns use `--background-weak-transparent` (gray at
  30%). No glassy/frosted web-app look.

## Iconography

Carvana uses two icon sources. Pick the right one:

1. **`lucide-react`** — the default for general icons (arrows, chevrons,
   bell, check, alert, search, user, heart, info, x, plus, minus). 24px
   default, `color="currentColor"`. Loaded from the `lucide` CDN as
   `https://unpkg.com/lucide-static@latest/icons/<name>.svg` when prototyping
   without React.
2. **`@carvana/ds-icons`** — only for Carvana-specific assets:
   - Custom icons with a `Cvna` suffix (e.g. `ArrowLeftDiamondCvna`,
     `HeartFilledCvna`, `UserCvna`, `PlayFilledCvna`, `PlaceholderCvna`).
   - `*Spot` illustrations for empty states / marketing.
   - Vehicle make logos (`vehicle-make/*`).

**Emoji:** never used.
**Unicode characters as icons:** never — always an SVG icon component.
**Icon size:** `size={16}` small, `size={24}` default. Icons inside buttons
nest as children; some components (`Chip`, `TextBadge`) accept icons as props.

For prototypes in this design system we inline Lucide icons as SVG (no CDN
round-trip). The set is exposed as `I` on the bundle namespace
(`window.CarvanaDS_8e8ede.I`); the implementation lives in
`ui_kits/carvana-web/kitIcons.jsx`.

## Index

- Tokens + fonts → `styles/`, `colors_and_type.css` (single entry: root `styles.css`)
- Logos + imagery → `assets/`
- Preview cards (design-system tab) → `preview/`
- UI kit — **Carvana.com** → `ui_kits/carvana-web/index.html`. Components (all on
  `window.CarvanaDS_8e8ede` via `_ds_bundle.js`): `I`, `Logo`, `Button`, `Chip`,
  `Banner`, `Stars`, `IndicatorBadge`, `TextBadge`, `LabelBadge`, `IconBadge`,
  `TextInput`, `Checkbox`, `Select`, `SelectOption`, `SiteNav`, `Hero`,
  `VehicleTile`, `ReviewCard`, `FAQ`, `FAQItem`, `SiteFooter`.
- Agent skill entrypoint → `SKILL.md`

## Caveats

- **Brandon for Carvana** is loaded from
  `fonts/BrandonforCarvana-Black.woff2`. Only the **900 Black** weight exists —
  Brandon must never be used at any other weight. All non-900 display type
  should use Inter or the non-brand type tokens.
- The kit covers high-frequency primitives (`Button`, `Chip`, `Banner`, the
  badge family, `TextInput`, `Checkbox`, `Select`) plus mockup compositions
  (`SiteNav`, `Hero`, `VehicleTile`, `ReviewCard`, `FAQ`/`FAQItem`,
  `SiteFooter`). Longer-tail components — modal, card, datepickers, range
  sliders, pagination, carousel, table, and so on — are **not** in the kit;
  port them on-demand from `packages/{name}/` when a design needs them. See the
  component index in `SKILL.md`.
