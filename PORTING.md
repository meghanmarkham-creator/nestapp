# Porting conventions — prototype JSX → Next.js TSX

Port each prototype file in `Nest Roleplay Interface/design_handoff_nest_platform/app/*.jsx`
to a TypeScript React component under `src/components/views/`. **Match the prototype
exactly** — same layout, inline styles, tokens, text, and behavior. This is a hifi
recreation; do not redesign.

## Mechanical rules
- First line of every file: `"use client";`
- Convert JSX → TSX. Add types on component props and event handlers. Prefer
  `React.CSSProperties` for style-constant objects; pragmatic `any` is OK for
  loose data maps to keep momentum — but no `@ts-ignore`.
- Replace globals with module imports:
  - `window.NEST.X` → import `X` from `@/lib/nest-data` (named exports). Examples:
    `cohorts, allAdvocates, atRisk, READINESS_THRESHOLD, CATEGORIES, GRADES, LEVELS,
    gradeOf, cohortName, cohortById, advocateById, trainerById, TRAINERS,
    TRAINER_STATUSES, defaultTrainerStatus, classesOfTrainer, trainerInsights,
    trainerRanking, calls, cutoffCalls, failedCalls, fmtDur, transcriptFor,
    baseCoachings, extraSamples, avgCallLen, scoredCount, opportunities, strengths,
    context, programTrend, priorTrend, programAvg, programGrade, programMom, pctReady,
    dist, momentum, catProgram, cohortGroups, levelStats, makePlan, PLAYBOOK, period, fmt`.
  - `window.NEST.fmt.round(x)` → `fmt.round(x)` (import `fmt`).
  - `window.useStore()` → `useStore()` from `@/lib/store`. `window.Store` → `Store`.
  - `window.nestToast(msg, tone)` → `nestToast(msg, tone)` from `@/lib/toast`.
  - Charts: import from `@/components/charts`:
    `GradePill, ReadinessDonut, DistBar, Sparkline, TrendChart, CatBars, ContextBar,
    HeatCell, WeekDots, gradeColor, scoreColor, momColor, momFmt`.
    (`window.momColor` → `momColor`, etc.)
  - UI atoms: import from `@/components/ui`:
    `Dropdown, Segmented, Avatar, StatusBadge, LevelTag, EmptyState, TrainerAvatar,
    TrainerChip, StatusDot, ToastHost, initials, LEVEL_COLOR`.
  - Shell: import from `@/components/shell`: `NestShell, Panel, StatTile, NAV`.
  - Icons: import `{ NIcon }` from `@/components/icons`.
  - Shared class-rollup logic: import `{ deriveStats, resolveAdv }` from `@/lib/derive`.
    (`deriveStats(advs)`; `resolveAdv(id, S)` where `S = store.get()`.)
  - React hooks: `import { useState, useEffect, useMemo, useRef } from "react"`.
- The Dashboard is already ported in `src/components/views/Dashboard.tsx` — mirror its
  style (module-scope style consts, imports, exports).

## Exports
Export as **named exports** every top-level component the router (`App`) or another
view uses. The router expects these names (keep them):
`Dashboard, AIEfficiencyView, ClassAssignmentsView, TrainersView, ClassesView,
ClassDetail, AdvocatesView, AdvocateDetail, CoachingBoard, ReportCardsView,
ArchiveView, CoachingDrawer`.
Also export any helper a *different* prototype file references (they were `window.*`
globals). If you need a symbol defined in another prototype file, import it from that
file's TSX module (grep the prototype to find where it's defined).

## File → module map
| prototype file | target module | key exports |
|---|---|---|
| dashboard.jsx | views/Dashboard.tsx | Dashboard (done) |
| ai_efficiency.jsx | views/AIEfficiency.tsx | AIEfficiencyView |
| assignments.jsx | views/Assignments.tsx | ClassAssignmentsView |
| trainers.jsx | views/Trainers.tsx | TrainersView |
| coaching_view.jsx | views/CoachingBoard.tsx | CoachingBoard |
| reportcards.jsx | views/ReportCards.tsx | ReportCardsView, ArchiveView |
| classes.jsx | views/Classes.tsx | ClassesView, ClassDetail |
| advocates.jsx | views/Advocates.tsx | AdvocatesView, AdvocateDetail |
| coaching.jsx | views/CoachingDrawer.tsx | CoachingDrawer |
| email_report.jsx | views/EmailReport.tsx | StakeholderEmailModal |

Dashboard imports `StakeholderEmailModal` from `views/EmailReport`.

## Verify
The whole app must `npm run build` cleanly. Keep imports minimal — only import what
the file uses (unused imports fail the strict build under `noUnusedLocals` is off,
but keep it clean).
