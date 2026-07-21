# The Nest — Roleplay & Enablement Platform

Internal web app for Carvana's **Learning & Enablement / Training** teams. It measures
the effectiveness of AI-driven training and tracks Customer Advocate readiness through
training classes: a live **Readiness** dashboard, **AI Efficiency** monitoring, admin
**Class Assignments**, **Trainers** performance, **Coaching** logs, and a celebratory
**Report Cards** graduation flow.

This is the production recreation of the design-handoff prototype (see
[`docs/HANDOFF.md`](docs/HANDOFF.md) and the reference bundle under
`Nest Roleplay Interface/`), rebuilt on a real toolchain.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Carvana.DS** design system — loaded from `public/_ds/carvana-ds/` (tokens, themes,
  typography, Inter + Brandon fonts). All styling uses `var(--*)` DS tokens.
- Client-side view routing via a state stack (`src/components/NestApp.tsx`), mirroring
  the prototype's behavior.
- Persistent user actions in `localStorage` (`src/lib/store.tsx`) — the method surface
  is the production mutation/API spec.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
```

No backend or credentials are required — the app runs on deterministic mock data out of
the box.

## Project layout

```
src/
  app/
    layout.tsx          # links the Carvana.DS stylesheet; data-theme="carvana"
    page.tsx            # renders <NestApp/>
    globals.css         # ported prototype global CSS (animations, responsive grids, print)
    api/mom/route.ts    # GET /api/mom — live Snowflake seam (mock fallback)
  components/
    NestApp.tsx         # the App() router (state stack)
    shell.tsx           # NestShell (sidebar + top bar), Panel, StatTile
    ui.tsx              # Dropdown, Segmented, Avatar, badges, ToastHost, ...
    charts.tsx          # SVG viz primitives + color scales
    icons.tsx           # NIcon set (Lucide-style)
    views/              # one file per screen (Dashboard, AIEfficiency, Assignments, ...)
  lib/
    types.ts            # data-shape contract
    nest-data.ts        # deterministic demo data + MOM rubric + scoring
    derive.ts           # deriveStats / resolveAdv ("scores travel with people")
    store.tsx           # persistent action store (localStorage) + useStore hook
    momSource.ts        # Snowflake MOM data source (+ mock fallback)
    toast.ts            # toast bridge
```

## Real MOM data (Snowflake)

Real roleplay MOM scores come from the Snowflake view
`CUSTOMERCARE.MOM_STANDARD.VW_CX_NEST_SIMULATION_INSIGHTS`. The integration seam is
`src/lib/momSource.ts` (served at `GET /api/mom`):

1. Copy `.env.example` → `.env.local` and set `NEST_DATA_SOURCE=snowflake` plus the
   `SNOWFLAKE_*` connection vars.
2. `npm i snowflake-sdk` (kept out of default deps so the demo builds with no native
   modules). The SDK is imported lazily.

When `NEST_DATA_SOURCE` is unset (or a live fetch fails) the app falls back to the
deterministic mock rows, so it never hard-fails.

**Confirmed schema (DESCRIBE VIEW, 2026-07)** — `MOM_QUERY` in `momSource.ts` is written
against the real columns and validated live:

- **Grain:** one row per simulation call (`TRANSCRIPTION_ID`) — the query groups by
  `EMPLOYEE_ID` to produce one row per advocate.
- **Identity:** `EMPLOYEE_ID`, `PREFERRED_NAME`, `EMAIL_ADDRESS`, `LEADER`, `STAFF_GROUP`.
- **Criteria (each its own column):** `COMPREHENSION_SCORE`,
  `CLARITY_OF_NEXT_STEPS_SCORE`, `CUSTOMER_FELT_HEARD_SCORE`. These are exposed as text
  **buckets** (`POOR` / `AVERAGE` / `GREAT`), not raw 1–5, so the query maps them to
  numeric midpoints (POOR = 1.5, AVERAGE = 3, GREAT = 4.5) and averages per advocate.
  `roleplayMom` = mean of the three criteria averages.
**Production MOM** is now also wired, from `CUSTOMERCARE.PUBLIC.VW_MOM_STANDARD_INSIGHTS`
⋈ `VW_ASPECT_ADVOCATE_MAP` (STAFF_GROUP `CX_M1_TRAINING`), matched to advocates by
employee id / email and aggregated per advocate (same bucket→1–5 conversion). Cached in
`lib/production-snapshot.json`. Advocates with no production calls yet show "Coming Soon".

Readiness is provisional: **roleplay + production averaged** where both exist (roleplay
only otherwise). **Assessment** and **Attendance** are still not sourced ("Not Yet
Calculated" / "—") and are excluded from the composite until wired.

> If leadership needs the true 1–5 (not the three buckets), ask the view owner to also
> expose `INSIGHT_DETAILS:*:CRITERION_SCORE::INT`; then drop the `DECODE` mapping in
> `MOM_QUERY`.

## Scoring model (kept faithful to the prototype)

Readiness is a 0–100 composite → A–D letter:

```
composite = roleplayMom*20*0.30 + productionMom*20*0.30 + assessment*0.25 + attendance*0.15
```

Grade bands: **A** 90–100 Ready · **B** 80–89 On track · **C** 70–79 Needs support ·
**D** <70 At risk. MOM criteria (1–5): Comprehension, Clarity of Next Steps, Customer
Felt Heard.

## Deferred to a later pass (see `docs/HANDOFF.md`)

Left out of this first build **intentionally** (marked with `TODO` where they plug in):

- **Auth / authorization** — stood up open for leaders to test.
- **Workday org query** — the full advocate pool for Class Assignments.
- **Streamlit coaching-plan app** — coaching recommendations integration.
- **Email delivery** — stakeholder report send + report-card auto-delivery (the
  Stakeholder Email modal builds the HTML today; delivery is manual copy/mailto).

## Notes

- The `Nest Roleplay Interface/` folder is the original design-handoff bundle, kept for
  reference. It is excluded from the build.
- In production, prefer the real `@carvana/ds-*` component library over the local
  re-implementations in `components/`; keep the bespoke data-viz in `charts.tsx`.
