// The Nest — data-shape contract (TypeScript).
// Mirrors the shapes generated in the prototype's app/data.jsx + app/data_ext.jsx.

export type GradeLetter = "A" | "B" | "C" | "D";

export interface Grade {
  letter: GradeLetter;
  label: string;
  range: string;
  fill: string; // CSS var()
  subtle: string;
  text: string;
  solid: string;
}

export type CatKey = "comprehension" | "clarity" | "heard";

export interface Category {
  key: CatKey;
  label: string;
  short: string;
  bias: number;
  desc: string;
}

/** A category with its resolved 1–5 value (used in bars/rankings). */
export interface CatScore extends Category {
  val: number;
}

export interface ContextLevel {
  key: string;
  label: string;
  color: string;
}

export interface ContextLevelAgg extends ContextLevel {
  count: number;
  pct: number;
}

export type CatMap = Record<CatKey, number>;

export interface Advocate {
  id: string;
  name: string;
  email?: string;
  cohort: string | null; // home/assigned class id (null = unassigned pool)
  composite: number; // 0–100 (provisional: roleplay-only until production/assessment land)
  grade: GradeLetter;
  roleplayMom: number; // 1–5 (live)
  /** null until the Production MOM query is wired ("Coming Soon"). */
  productionMom: number | null; // 1–5
  roleplay: number; // 0–100 (roleplayMom×20)
  /** null until the Production MOM query is wired ("Coming Soon"). */
  production: number | null; // 0–100
  /** null until the Assessment query is wired ("Not Yet Calculated"). */
  assessment: number | null; // 0–100
  /** null until an Attendance source is wired. */
  attendance: number | null; // 0–100
  delta: number; // wk change
  cats: CatMap;
  strength: CatScore;
  opportunity: CatScore;
  sessions: number;
  liveCalls: number;
  missed: number;
  note: string;
  // --- live roster fields (from the Workday role-map join) ---
  /** direct leader / team lead name from the roster. */
  leader?: string;
  hireDate?: string;
  /** simplified job title (Advocate/Intern/Specialist/Team Lead). */
  job?: string;
  /** mapped training level for filters/tags. */
  level?: string;
  /** number of scored simulations backing the roleplay MOM. */
  sims?: number;
  /** true for advocates sourced from the live MOM/roster query. */
  live?: boolean;
  /** true for advocates added manually on Class Assignments (no scores yet). */
  manual?: boolean;
}

export type ClassStatus =
  | "Graduating"
  | "In training"
  | "Onboarding"
  | "Graduated";

export interface NestClass {
  id: string;
  name: string;
  level: string;
  loc?: string;
  mode?: string;
  weekOf?: number;
  weeks?: number;
  size?: number;
  base?: number;
  seed?: number;
  status: ClassStatus;
  lead?: string; // trainer short name
  trainerId: string | null;
  startDate: Date;
  cohortKey: string; // ISO yyyy-mm-dd
  cohortLabel: string;
  advocates: Advocate[];
  cats: CatMap;
  momAvg: number;
  ctx: Record<string, Record<string, number>>;
  interactions: number;
  avg: number;
  grade: Grade;
  dist: Record<GradeLetter, number>;
  trend: number[];
  strength: CatScore;
  opportunity: CatScore;
  /** true for custom classes created on the Assignments tab. */
  custom?: boolean;
}

export interface Trainer {
  id: string;
  name: string;
  short: string;
  email: string;
  tenure: string;
  home: string;
  role?: string; // "Team Lead"
}

export interface TrainerStatus {
  key: string;
  label: string;
  color: string;
}

export interface Call {
  id: string;
  advId: string;
  scenario: string;
  durationSec: number;
  cutoff: boolean;
  failedMom: boolean;
  scored: boolean;
  mom: number | null;
  date: string;
  acsId: string;
  endReason: string;
}

export type CoachingSource = "plan" | "session" | "release" | "handoff";

export interface Coaching {
  id: string;
  advId: string;
  kind: string;
  focus: string;
  trainerId: string | null;
  assignee?: string;
  assigneeId?: string;
  date: string;
  priority: boolean;
  source: CoachingSource;
  defaultComplete?: boolean;
}

export interface CoachingLog {
  coachId: string | null;
  strengths: { key: string; note: string }[];
  opportunities: { key: string; note: string }[];
  notes: string;
  status: "incomplete" | "complete";
  completedAt: string | null;
}

export interface TrainerInsight {
  classes: number;
  advocates: number;
  avg: number;
  gap: number;
  catAvgs: CatScore[];
  weakest: CatScore;
  weakInHowMany: number;
}
