# Handoff: The Nest — Roleplay & Enablement Platform

---

## 🟢 START HERE — Beginner's guide to using this package

You don't need to be a developer to hand this off. Here's the whole process in plain terms.

**What this folder is:** a complete description of an app, plus a working preview of it, that you give to an AI coding assistant called **Claude Code**. Claude Code reads it and builds the real website for you.

**What "unzip into your target repo" meant (ignore the jargon):**
- A **zip** is the compressed folder you just downloaded. **Unzip** = double-click it to open it into a normal folder. On a Mac it unzips itself; on Windows, right-click → "Extract All."
- A **repo** (repository) is just the folder where your app's code lives. If you don't have one yet, that's fine — this unzipped folder *becomes* your starting folder.
- So: **download the zip → double-click to unzip → you now have a folder called `design_handoff_nest_platform` on your computer.** That's it.

**What "open Claude Code" meant:**
- **Claude Code** is a tool that runs on your computer (in an app called the Terminal) and can write code for you. Someone on your team who codes can install it in ~5 minutes (instructions: search "install Claude Code"), or ask IT.
- "Open Claude Code *there*" just means: start Claude Code from inside that unzipped folder, so it can see these files.

**The 4 steps once Claude Code is open:**
1. Point it at this folder and paste the prompt in the next section.
2. It reads the `README.md` (this file), looks at the screenshots, and runs the preview to understand the app.
3. It builds the real website, screen by screen. You can ask it questions the whole time in plain English.
4. When it's done, it can put the site online (ask it: "deploy this so my team can try it") — you'll get a link to share with senior leaders.

**Don't want to touch a terminal at all?** Forward this whole zip to a developer (or IT) and say: *"Please stand this up as an internal test site using the README."* Everything they need is in here.

### 📋 Copy-paste prompt for Claude Code
```
Read design_handoff_nest_platform/README.md in full, look at the images in
design_handoff_nest_platform/screenshots/, and open the prototype at
"design_handoff_nest_platform/Nest Readiness App.html" to see how it behaves.

Then build this as a real, runnable website:
- Recreate every screen to match the prototype and screenshots.
- Use a normal modern setup (React + Vite or Next.js) with real page routing.
- Wire in REAL DATA for MOM scores from our Snowflake query (see the
  "Connecting real MOM data" section of the README). Each advocate should come
  in from that query with their Roleplay MOM and Production MOM scores, which
  feed the Readiness tab and report cards.
- Start with NO classes/cohorts. We create classes manually on the Class
  Assignments tab and drag advocates (pulled from the query) into them. A class
  shows real scores on the Readiness tab as soon as advocates are assigned.
- Do NOT wire up Workday, the Streamlit coaching app, email delivery, or
  login/authorization yet. Keep it an internal demo I can click around.
- Leave clear TODO comments where those remaining sources will plug in later.
When it runs, tell me how to open it, and then help me put it online so my
team can test it.

My Snowflake MOM query is here:  [PASTE YOUR QUERY / connection details, or
tell Claude Code the file path where you've saved it]
```
> **Tip:** paste your actual MOM query where it says `[PASTE YOUR QUERY…]`, or save it as a file in the folder and tell Claude Code its name. See the next section for what the query needs to return.

### 🖼️ Screenshots (in `screenshots/`)
Visual reference for each screen — Claude Code will match these.
- `01-readiness.png` — Readiness dashboard (landing page)
- `02-ai-efficiency.png` — AI Efficiency
- `03-class-assignments.png` — Class Assignments
- `04-trainers.png` — Trainers
- `05-coaching.png` — Coaching board
- `06-report-cards-landing.png` — Report Cards ("Time to graduate!" landing)
- `07-report-card-full.png` — a full individual report card
- `08-log-coaching-panel.png` — the Log Coaching side panel
- `09-stakeholder-email.png` — the Export Report → stakeholder email template

### ⏭️ What's in this build vs. later
- **IN this build:** real **MOM score data** from your Snowflake query (Roleplay MOM + Production MOM per advocate), feeding the Readiness tab and report cards. Classes start empty and are created manually on Class Assignments.
- **LATER:** login / authorization / admin-only gating (leave out for now — stand it up open so leaders can test); the **Workday org query** for the full advocate pool; the **Streamlit coaching-plan app**; **email delivery** of reports/report cards; and any MOM inputs the query doesn't yet provide (assessments, attendance). Where a real value isn't available yet, keep the prototype's placeholder for that one field and mark it with a TODO. The "State Management" section documents exactly where each plugs in.

---

## Connecting real MOM data (this build)

The Readiness score is a 0–100 composite of four inputs (see "Readiness score" below): **Roleplay MOM (30%)**, **Production MOM (30%)**, **Assessment (25%)**, **Attendance (15%)**. Your Snowflake query provides the **MOM** pieces; anything it doesn't return yet should fall back to the prototype's placeholder value for that field (with a TODO) so the app still runs.

**How the data should flow:**
1. Run the Snowflake MOM query → get a row per advocate (or per call, aggregated to an advocate average).
2. Build each **advocate** object from it, matching the shape in `app/data.jsx` (see "Key entities & fields"): at minimum `id, name, email, roleplayMom (1–5), productionMom (1–5)`, and the three MOM rubric sub-scores `cats {comprehension, clarity, heard}` (each 1–5) if the query returns them. Derive `roleplay`/`production` (×20), `composite`, `grade`, `strength`, `opportunity` using the exact formulas in this README.
3. These advocates populate the **Class Assignments advocate pool**. There are **no classes at first** — the user creates them and drags advocates in. A class's Readiness card, grade mix, and MOM bars are computed live from the real scores of whoever's assigned (the prototype already does this in `deriveStats`).

**What the query should return** (map your columns to these; name them however your query does and let Claude Code adapt):
- advocate identifier + display name (+ email if available)
- Roleplay MOM (1–5) and Production MOM (1–5) — either pre-averaged, or per-call rows the app averages
- optionally the three coaching-criteria sub-scores (Comprehension, Clarity of Next Steps, Customer Felt Heard), 1–5 each
- optionally per-call detail (scenario, duration, ACS id, timestamp) — this also powers the AI Efficiency tab if present

**Connection:** Claude Code should read Snowflake credentials from environment variables (a `.env` file it will help you set up), never hard-code them. If the live connection isn't reachable while building, it can run the query once and cache the result as a local JSON file to develop against, then switch to live.

---

## Overview
The Nest is an internal web application for Carvana's **Learning & Enablement** and **Training** teams. It is an **admin/leadership tool** (not advocate-facing) for measuring the effectiveness of AI-driven training and tracking Customer Advocate readiness through training classes.

It centralizes six things:
1. **Readiness dashboard** — a live, "as of now" snapshot of every training class, rolled up into an A–D readiness grade.
2. **AI Efficiency** — health of the AI scoring pipeline (cut-off calls, omitted calls, failed MOM scores) with the ability to omit bad calls from an advocate's official score.
3. **Class Assignments** (admin) — build cohorts from an org roster via drag-and-drop; assign a trainer.
4. **Trainers** — per-trainer class performance, AI-detected coaching trends, and self-service status.
5. **Coaching** — coaching plans/logs per advocate with a structured "log coaching" flow.
6. **Report Cards** — a celebratory graduation flow producing a tangible report card, with graduate/release/handoff actions and an admin archive.

## About the Design Files
The files in this bundle are **design references created in HTML/React-via-Babel** — a fully interactive prototype that demonstrates the intended look, behavior, data model, and interactions. **They are not production code to ship directly.**

The task is to **recreate this application in a production environment** using established patterns and a real toolchain:
- The prototype uses React 18 loaded via CDN + in-browser Babel (`<script type="text/babel">`). Production should use a real build (Vite/Next.js) with compiled JSX/TSX, TypeScript, and a router.
- The prototype persists all user actions in **`localStorage`** (see `app/store.jsx`). Production must replace this with the real backend: **Snowflake** for MOM scores / call data / rosters, and a **Workday org query** for the advocate pool. The store's method surface is a ready-made spec for the API/mutations you'll need.
- All mock data is **deterministically generated** in `app/data.jsx` and `app/data_ext.jsx` from seeds. Treat these files as the **data-shape contract** (what fields each entity has), not as real data.
- Styling is the **Carvana.DS** design system, loaded from `_ds/carvana-ds-8e8eded4-f1d6-407b-90c8-ea4ce90b2f58/`. Reuse the real `@carvana/ds-*` component library and tokens in production rather than the prototype's local re-implementations.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, component styling, layout, and interactions are all final and grounded in Carvana.DS tokens. Recreate the UI faithfully using the production Carvana design-system components and token variables (all values are already `var(--*)` references, listed in the Design Tokens section).

## Architecture at a glance
- **Single-page app**, client-side view routing via a simple state stack (see `App()` in `Nest Readiness App.html`). Views: `dash` (Readiness), `aieff`, `assign`, `trainers`, `coaching`, `report`, plus drill-downs `classDetail`, `advocateDetail`, `reportCard`, `archive`. A back-stack (`push`/`back`) drives drill-down navigation.
- **Left sidebar shell** (`app/shell.jsx` → `NestShell`) wraps every view: fixed 244px navy sidebar (full viewport height, internally scrollable), 76px top bar with title/subtitle, live search input, and a per-view actions slot.
- **Persistent store** (`app/store.jsx` → `window.Store` + `useStore()` hook) is the single source of truth for user actions; it emits change events and all views subscribe.

## Domain model & scoring (critical — get this right)

### MOM score
An AI-generated evaluation of a Customer Advocate's conversation against a rubric, scored **1–5**. The rubric has **three coaching criteria** (the only ones surfaced/graded in this app):
- **Comprehension** — accurately interprets the customer's question, context, constraints.
- **Clarity of Next Steps** — actionable, complete guidance (what, who owns it, by when).
- **Customer Felt Heard** — customer leaves feeling validated, acknowledged, respected.

(There are also non-coaching context dimensions — Customer Difficulty, Situation Difficulty, Sentiment Impact — carried in the data model for AI Efficiency context; see `CONTEXT` in `app/data.jsx`.)

### Readiness score (the "report-card" grade)
A **0–100 composite** rolled up from four weighted components, then mapped to an **A–D letter**:

| Component | Weight | Scale in source |
|---|---|---|
| Roleplay MOM | 30% | 1–5, ×20 to reach 0–100 |
| Production MOM | 30% | 1–5, ×20 |
| Assessment | 25% | 0–100 |
| Attendance | 15% | 0–100 |

Composite = `roleplayMom*20*0.30 + productionMom*20*0.30 + assessment*0.25 + attendance*0.15`, rounded.

**Grade bands:** A = 90–100 "Ready" (green) · B = 80–89 "On track" (blue) · C = 70–79 "Needs support" (yellow) · D = <70 "At risk" (red). The A–D scale is the elementary-school-style quick read leadership wanted. Readiness threshold for "needs a coaching plan" is **70** (`READINESS_THRESHOLD`).

On the Readiness cards the three bars (Production, AI Roleplay, AI Assessments) are all shown on the **same 1–5 MOM scale** (assessment is divided by 20 to normalize).

### Class levels (training tracks)
`New Hire, CAII, Senior, Digi, Exec Res` — every class has one. Filterable everywhere.

### Cohort
A cohort = a class **start date**. The Readiness/Classes cohort dropdown groups by start date and is **sorted by name**, and must **live-update** as new classes are created on the Assignments tab.

### Key entities & fields
- **Advocate**: `id, name, cohort (classId), composite (0–100), grade (A–D), roleplayMom (1–5), productionMom (1–5), roleplay (0–100), production (0–100), assessment (0–100), attendance (0–100), delta (wk change), cats {comprehension, clarity, heard} (each 1–5), strength {key,label,val}, opportunity {key,label,val}, sessions, liveCalls, missed, note`.
- **Class/cohort**: `id, name, level, mode, weekOf, weeks, size, status (Graduating|In training|Onboarding|Graduated), lead (trainer short name), trainerId, startDate, cohortKey, cohortLabel, advocates[], cats, momAvg, avg, grade, dist {A,B,C,D}, strength, opportunity`.
- **Trainer**: `id, name, short, email, tenure, home, role? ("Team Lead" for the two leaders)`. Roster in `app/data_ext.jsx`. Trainers are styled **distinctly from advocates** (navy chip w/ gold ring — see `TrainerAvatar`/`TrainerChip` in `app/ui.jsx`).
- **Call** (AI Efficiency): `id, advId, scenario, durationSec, cutoff (bool), failedMom (bool), scored (bool), mom (1–5|null), date, acsId, endReason`.
- **Coaching record**: `id, advId, kind, focus, trainerId, assignee?, assigneeId?, date, priority (bool), source (plan|session|release|handoff), + log: {coachId, strengths:[{key,note}], opportunities:[{key,note}], notes, status (incomplete|complete), completedAt}`.

## Screens / Views

### 1. Readiness (`dash`) — landing page
- **Purpose**: live, "as of now" snapshot of where every class stands. No date-period filter (removed intentionally — slice by class/level instead).
- **Layout**: navy hero band (grid: donut · headline block · side panel with Top opportunity / Strongest). Then a filter row (class cohort dropdown, name-sorted, live-updating + level segmented control). Then a responsive grid of class cards. Then a lower two-column row: at-risk advocate panel + trending-opportunities panel.
- **Hero**: recalculates against the **level filter** — pick "New Hire" and the whole navy overview (readiness %, grade-mix chips, top opportunity/strongest) rescopes to that level. Grade-mix chips carry definitions ("On track · grades A–B", "Needs support · grade C", "At risk · grade D").
- **Class card**: outlined in the class's **grade color**. Header: name, level tag, "Started {date}", grade pill + composite (shown on 1–5 scale). Three MOM-scale bars: **Production**, **AI Roleplay**, **AI Assessments** (all 1–5, color-coded by `momColor`). Grade-mix bar: thicker (22px), each grade's count rendered **inside** its colored segment. Strength (green-tinted) and Focus (yellow-tinted) bubbles — no arrows, larger text. Footer: "Trainer: {name}" + "View class" link. Newly created (unscored) classes render as a dashed placeholder card until scores populate.
- **Export report** action → opens the **Stakeholder Email modal** (`app/email_report.jsx`): a Carvana-branded, email-client-safe HTML email built from the current (filter-scoped) snapshot — navy header w/ CARVANA badge, big readiness score + grade, grade-mix bar, strongest/opportunity cards, per-class table, footer. Actions: **Copy email** (writes `text/html` + `text/plain` to clipboard via `navigator.clipboard.write`), **Open in email** (`mailto:`), **Download HTML**.

### 2. AI Efficiency (`aieff`)
- **Purpose**: monitor AI scoring health; remove bad calls from official scores.
- **Layout**: 5 KPI stat tiles (Cut off <3min, % omitted, Avg call length, Calls scored, Missing/failed MOM). Segmented tabs: Cut off / Missing MOM / Omitted. A table of calls.
- **Row**: advocate (→ opens advocate detail), scenario, duration (red if cutoff), end reason, MOM (or "Failed" chip), **ACS record link** (opens transcript+MOM modal), date, and an **Omit call** / **Restore** button.
- **Omit flow**: clicking "Omit call" opens a modal that **requires a reason** (radio list of 6 canned reasons + optional note), then removes the call from that advocate's official MOM average. Omitted calls are restorable.
- **ACS modal**: shows a transcript (system line noting sub-3-min cutoff where relevant) + the MOM breakdown (CatBars, 1–5) or a failure notice. "Open in ACS" is a stub (toast) — in production, deep-link to the real ACS record.

### 3. Class Assignments (`assign`) — admin
- **Purpose**: build cohorts and staff them.
- **Layout**: left sticky **Advocate pool** (searchable, from the Workday org query; unassigned advocates + manually-added). Right: a **Nest trainers** rail (draggable trainer chips) + a grid of class cards.
- **Interactions**: **Create new class** modal (level, start date, auto-named "New Hire 7/6" style). **Add student** modal (manual entry: name, email, level). **Drag-and-drop** an advocate card onto a class card to assign; **drag a trainer chip** onto a class to staff it. Remove advocate/trainer via the ✕ on their chip. Delete class via trash button. New classes appear on the Readiness tab immediately.
- **Scores travel with people**: when an advocate is reassigned, their existing scores move with them — the source class loses them from its averages and the destination class gains them. (See "scores travel" logic in `app/dashboard.jsx` `deriveStats` + `resolveAdv`.)

### 4. Trainers (`trainers`)
- **Purpose**: per-trainer performance + AI trend analysis + self-service status.
- **Layout**: top roster rail (selectable trainer buttons w/ navy avatars). Selected trainer: header card (avatar, email/home/tenure, KV stats: classes led, advocates, avg readiness, rank) + a **status selector** (In training / In production / Assessments / Coaching / Meeting / Admin time — persists per trainer). Then an **AI trend analysis** panel (3 insight cards + MOM category averages across their classes). Then a table of the classes they own.
- **AI trends** (`trainerInsights` in `app/data_ext.jsx`): recurring weakest MOM category across their classes (e.g. "Clarity of Next Steps is lowest in 3 of 4 classes"), above/below program average with rank, and strongest category. In production these narratives should be generated from real aggregates (or an LLM over them).

### 5. Coaching (`coaching`)
- **Purpose**: all coaching plans/logs per class & advocate.
- **Layout**: 4 summary tiles (Incomplete, Completed, Priority-release, Total). Controls: search-by-advocate + a filter dropdown (**by class, by trainer, by level**) + status segmented (All/Incomplete/Completed). Grid of coaching cards.
- **Card**: advocate, kind, coach (auto = that advocate's classroom trainer), date. **Completed** cards show a **green border** and surface only the **selected MOM values** discussed (green strength lines / yellow focus lines, each with its note). **Priority release** cards show a **pink border + ring**. "Recommendations" (for plan-source cards) opens the coaching-plan drawer; "Log coaching" / "View log" opens the log panel.
- **Log coaching panel**: **Coach selector** (defaults to the classroom trainer; can pick any trainer OR the two leaders **Shelby Gary** / **Shantelle Garner** who occasionally coach). **Strengths discussed** — the 3 MOM values as green-selectable rows, each expanding an inline note field. **Opportunities discussed** — same, yellow. **Overall coaching notes** textarea. "Mark coaching complete" (enabled once ≥1 value is selected) sets status=complete + timestamp; "Save progress" persists without completing; completed logs can be reopened.

### 6. Report Cards (`report`) + Archive (`archive`)
- **Landing**: a celebratory **"Time to graduate!"** hero (Brandon display font, confetti, trophy) + an **advocate search** (type-ahead) + quick-access cards for advocates in graduating classes. Header has an **Archive** button (admin-only area).
- **Full report card** (on selecting an advocate): readiness donut + identity; the 6 report-card fields leadership specified — **Average Roleplay MOM, Average Production MOM, Overall Assessment, Attendance, Current Strength, Current Opportunity, Notes** — plus a MOM rubric breakdown, every individual call score received, all coachings & notes, and a trainer note w/ assigned team lead.
- **Actions**: If readiness is **below a C** (composite <70), a **"Set a meeting"** prompt creates a "Team Lead Handoff" coaching (the new team lead + trainer align on whether the advocate can graduate). **Graduate** (green) → marks advocate Graduated and moves them into the admin **Archive**. **Release** (yellow) → creates a **pink priority coaching auto-assigned to Shelby Gary** and flags the advocate released.
- **Archive**: admin-only table of graduated advocates (searchable) with final readiness, strength, opportunity, graduation date.

## Interactions & Behavior
- **Navigation**: sidebar item → resets to that top-level view; drill-downs push onto a back-stack; BackBar pops. Search in the top bar jumps to Advocates and filters live.
- **Drag-and-drop**: HTML5 DnD (`draggable`, `onDragStart`/`onDragOver`/`onDrop`) for advocate→class and trainer→class on the Assignments tab.
- **Modals/drawers**: Escape closes; scrim click closes; right-side slide-in drawer for coaching log (animation `cdSlide`), centered modals elsewhere. Confetti + fade animations defined in the HTML `<style>` (`cdFade`, `cdSlide`, `cdSpin`).
- **Toasts**: `window.nestToast(msg, tone)` — bottom-center, auto-dismiss ~3.2s (`ToastHost` in `app/ui.jsx`).
- **Print**: report card supports `window.print()`; sidebar/header/`.no-print` hidden in print CSS.
- **Responsive**: dashboard grids collapse at 1180/1080/720px (see `.nest-cards`, `.nest-hero`, `.nest-lower` media queries in the HTML).

## State Management
All in `app/store.jsx` (`window.Store`), persisted to `localStorage` key `nest_store_v2`, exposed to React via `useStore()`. **This method surface is your production mutation/API spec:**
- `omits{callId→{reason,at}}`: `omitCall`, `restoreCall`, `isOmitted`
- `logs{coachingId→{coachId,strengths[],opportunities[],notes,status,completedAt}}`: `getLog`, `saveCoachingNotes`, `completeCoaching`, `reopenCoaching`, `addCoaching`
- `customClasses[]`: `createClass`, `deleteClass`, `assignTrainer`, `assignAdvocate`, `unassignAdvocate`
- `assignments{advId→classId}` (reassignment overrides)
- `manualAdvocates[]`: `addManualAdvocate`
- `trainerStatus{trainerId→statusKey}`: `setTrainerStatus`
- `graduated{advId→{at,classId}}`: `graduate`, `graduateMany`, `isGraduated`
- `released{advId→{at}}`: `release` (auto-creates the pink Shelby Gary coaching), `isReleased`

**Production data sources to wire (replacing the mock):**
- **Snowflake** — MOM scores (roleplay + production), call/transcript records (ACS), assessment & attendance, class rosters. There is an existing Snowflake **Streamlit coaching-plan app** to integrate for the coaching recommendations (referenced by the team; not accessible from the prototype).
- **Workday org query** — the advocate pool for Class Assignments (individuals under a given Manager/Team Lead).
- **Email** — stakeholder report send + auto-deliver report cards to future team leaders.

## Design Tokens
All styling uses **Carvana.DS** CSS custom properties (loaded from `_ds/carvana-ds-8e8eded4-f1d6-407b-90c8-ea4ce90b2f58/`). Use the production `@carvana/ds-*` library + these tokens; do not hardcode hex except in the email template (email clients can't use CSS vars — see hex map below).

- **Brand**: `--brand-primary` #228be6 (Carvana blue), `--brand-secondary` #0d375e (navy), `--brand-tertiary` #fab005 (gold accent).
- **Grade colors**: A `--reference-green-500`, B `--reference-blue-500`, C `--reference-yellow-500`, D `--reference-red-500`, each paired with its `--background-*-subtle` + `--text-*` semantic pair.
- **Surfaces**: `--canvas-default` (white), `--canvas-muted`, `--border-subtle`, `--border-default`. Cards: 1px `--border-subtle`, radius `--border-radius-lg` (12px).
- **Type**: Inter (UI, 400–700); Brandon for Carvana **900 only**, ALL CAPS, for brand moments (the "Time to graduate!" headline). Tokens: `--heading-*`, `--body-*`, `--label-*`.
- **Email hex map** (`app/email_report.jsx`): A #1f8a5b, B #228be6, C #fab005, D #e03131, navy #0d375e, gold #fab005.
- **Spacing/radius**: Carvana scale; radius default 8px (`md`), 12px (`lg`) for content cards.

## Assets
- Carvana logos: `assets/logo-horizontal-default.svg` (navy) and `-inverse.svg` (white, used in the navy sidebar), plus logomark/stacked variants.
- Fonts: `fonts/Inter-*.woff2`, `fonts/BrandonforCarvana-Black.woff2`.
- Icons: inline Lucide-style SVGs defined in `app/shell.jsx` (`NIcon`). In production use `lucide-react` + `@carvana/ds-icons` (Cvna/Spot sets). **No emoji.**
- All charts/visualizations are hand-built SVG in `app/charts.jsx` (GradePill, ReadinessDonut, DistBar, Sparkline, TrendChart, CatBars, ContextBar, HeatCell) — reusable as-is or replace with a charting lib.

## Files (in this bundle)
- `Nest Readiness App.html` — **the app entry point**; open this to run the prototype. Contains the router (`App()`), script includes, global CSS, responsive rules, print rules.
- `app/data.jsx` — core data model, MOM rubric, grade scale, seeded cohort/advocate generation. **Data-shape contract.**
- `app/data_ext.jsx` — trainers roster, statuses, AI-efficiency call records, base coachings, trainer trend analysis.
- `app/store.jsx` — persistent action store (**production mutation spec**).
- `app/shell.jsx` — app shell (sidebar + top bar), nav definition, `NIcon` icon set, `StatTile`, `Panel`.
- `app/ui.jsx` — shared atoms: Dropdown, Segmented, Avatar, StatusBadge, LevelTag, TrainerAvatar, TrainerChip, StatusDot, ToastHost, EmptyState.
- `app/charts.jsx` — SVG viz primitives + color scales (`gradeColor`, `scoreColor`, `momColor`).
- `app/dashboard.jsx` — Readiness view (hero, filters, class cards, at-risk/trends, scores-travel logic).
- `app/email_report.jsx` — Stakeholder Email modal.
- `app/ai_efficiency.jsx` — AI Efficiency view + ACS/Omit modals.
- `app/assignments.jsx` — Class Assignments (pool, DnD, create-class/add-student modals).
- `app/trainers.jsx` — Trainers view + insight cards.
- `app/coaching_view.jsx` — Coaching board + Log Coaching panel (current version).
- `app/reportcards.jsx` — Report Cards landing, full report card, Archive.
- `app/classes.jsx`, `app/advocates.jsx` — Classes list + class drill-down (roster), Advocates list + advocate detail (reachable via "View class" and search; no top-level nav item).
- `app/coaching.jsx` — the coaching-plan generator drawer (MOM-based recommendations).
- `_ds/carvana-ds-8e8eded4-f1d6-407b-90c8-ea4ce90b2f58/` — the Carvana.DS bundle + stylesheets. Use the real `@carvana/ds-*` library in production.

## Notes for the implementer
- Start from `Nest Readiness App.html` — it runs; use it as the behavioral source of truth for anything ambiguous in this doc.
- The prototype's local `app/*.jsx` component re-implementations exist because it can't import the private component library over CDN; in the real repo, prefer the actual Carvana.DS components and only keep the bespoke data-viz.
- Access control: "admin only" areas (Class Assignments, Archive) are labeled but not enforced in the prototype. **For the first build, leave authorization out entirely** — stand it up open for leaders to test. Role enforcement is a later pass.
- `index.html` in the project is an older 3-option design-exploration canvas and `Senior Leader Overview.html` is a separate presentation slide — **not part of this app**; ignore unless asked.
