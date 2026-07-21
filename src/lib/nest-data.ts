// The Nest — shared data model (LIVE build).
//
// Advocates are sourced from a cached snapshot of the real Snowflake join:
//   CUSTOMERCARE.MOM_STANDARD.VW_CX_NEST_SIMULATION_INSIGHTS  (roleplay MOM)
//   ⋈ CUSTOMERCARE.ADVOCATE.VW_HISTORICAL_ADVOCATE_ROLE_MAP    (identity / roster)
// See lib/mom-snapshot.json + lib/momSource.ts (live seam) + lib/momScale.ts (bucket→1–5).
//
// Roleplay MOM (Comprehension / Clarity / Felt Heard) is real. Production MOM,
// Assessment, and Attendance are NOT yet available — they are null and render as
// "Coming Soon" / "Not Yet Calculated" until their queries are wired. Readiness is
// therefore PROVISIONAL (roleplay-only) for now.
//
// There are NO pre-built classes: advocates start in the unassigned pool and are
// dragged into classes the user creates on the Class Assignments tab.

import snapshot from "./mom-snapshot.json";
import trainerSnapshot from "./trainer-snapshot.json";
import productionSnapshot from "./production-snapshot.json";
import { bucketAvg } from "./momScale";
import type {
  Advocate,
  Call,
  CatKey,
  CatMap,
  CatScore,
  Category,
  Coaching,
  ContextLevel,
  ContextLevelAgg,
  Grade,
  GradeLetter,
  NestClass,
  Trainer,
  TrainerInsight,
  TrainerStatus,
} from "./types";

// ---------------------------------------------------------------------------
// deterministic RNG + math helpers
// ---------------------------------------------------------------------------
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const round = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;
const gauss = (r: () => number, mean: number, sd: number) => {
  const u = 1 - r();
  const v = r();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * sd;
};

// ---------------------------------------------------------------------------
// grade scale (report-card A–D), driven by 0–100 composite
// ---------------------------------------------------------------------------
export const GRADES: Record<GradeLetter, Grade> = {
  A: { letter: "A", label: "Ready", range: "90–100", fill: "var(--reference-green-500)", subtle: "var(--background-success-subtle)", text: "var(--text-success)", solid: "var(--background-success)" },
  B: { letter: "B", label: "On track", range: "80–89", fill: "var(--reference-blue-500)", subtle: "var(--background-informational-subtle)", text: "var(--text-informational)", solid: "var(--background-informational)" },
  C: { letter: "C", label: "Needs support", range: "70–79", fill: "var(--reference-yellow-500)", subtle: "var(--background-warning-subtle)", text: "var(--text-warning)", solid: "var(--background-warning)" },
  D: { letter: "D", label: "At risk", range: "<70", fill: "var(--reference-red-500)", subtle: "var(--background-critical-subtle)", text: "var(--text-critical)", solid: "var(--background-critical)" },
};
export const gradeOf = (n: number): Grade =>
  n >= 90 ? GRADES.A : n >= 80 ? GRADES.B : n >= 70 ? GRADES.C : GRADES.D;

// ---------------------------------------------------------------------------
// MOM coaching criteria
// ---------------------------------------------------------------------------
export const CATEGORIES: Category[] = [
  { key: "comprehension", label: "Comprehension", short: "Comprehension", bias: 0.22, desc: "Accurately interprets the customer's question, context and constraints." },
  { key: "clarity", label: "Clarity of Next Steps", short: "Clarity", bias: -0.3, desc: "Gives actionable, complete guidance — what, who owns it, by when." },
  { key: "heard", label: "Customer Felt Heard", short: "Felt Heard", bias: -0.12, desc: "Customer leaves feeling validated, acknowledged and respected." },
];

export const CONTEXT = {
  customerDifficulty: {
    key: "customerDifficulty", label: "Customer difficulty",
    levels: [
      { key: "easy", label: "Easy", color: "var(--reference-green-500)" },
      { key: "medium", label: "Medium", color: "var(--reference-yellow-500)" },
      { key: "challenging", label: "Challenging", color: "var(--reference-red-500)" },
    ] as ContextLevel[],
  },
  situationDifficulty: {
    key: "situationDifficulty", label: "Situation difficulty",
    levels: [
      { key: "easy", label: "Easy", color: "var(--reference-green-500)" },
      { key: "medium", label: "Medium", color: "var(--reference-yellow-500)" },
      { key: "hard", label: "Hard", color: "var(--reference-red-500)" },
    ] as ContextLevel[],
  },
  sentiment: {
    key: "sentiment", label: "Sentiment impact",
    levels: [
      { key: "improved", label: "Improved", color: "var(--reference-green-500)" },
      { key: "noChange", label: "No change", color: "var(--reference-slate-400)" },
      { key: "concerning", label: "Concerning", color: "var(--reference-red-500)" },
    ] as ContextLevel[],
  },
};

export const LEVELS = ["New Hire", "CAII", "Senior", "Digi", "Exec Res"];

// map roster job title → a training level for tags/filters
const LEVEL_BY_JOB: Record<string, string> = {
  Intern: "New Hire",
  Advocate: "New Hire",
  Specialist: "Senior",
  "Team Lead": "Exec Res",
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ---------------------------------------------------------------------------
// build advocates from the live snapshot
// ---------------------------------------------------------------------------
type SnapRow = [
  string, string, string, string, string, string, boolean, number,
  [number, number, number], [number, number, number], [number, number, number],
];

// Production MOM overlay (matched by EMPLOYEE_ID; email matches equivalently).
type ProdRow = [string, number, [number, number, number], [number, number, number], [number, number, number]];
const PRODUCTION = new Map<string, { mom: number; calls: number }>();
(productionSnapshot.rows as ProdRow[]).forEach(([id, calls, comp, clar, heard]) => {
  const pc = bucketAvg({ POOR: comp[0], AVERAGE: comp[1], GREAT: comp[2] });
  const pl = bucketAvg({ POOR: clar[0], AVERAGE: clar[1], GREAT: clar[2] });
  const ph = bucketAvg({ POOR: heard[0], AVERAGE: heard[1], GREAT: heard[2] });
  PRODUCTION.set(String(id), { mom: r1((pc + pl + ph) / 3), calls });
});

function buildAdvocate(row: SnapRow): Advocate {
  const [id, name, email, leader, hireDate, job, employed, sims, comp, clar, heard] = row;
  void employed;
  const cats: CatMap = {
    comprehension: bucketAvg({ POOR: comp[0], AVERAGE: comp[1], GREAT: comp[2] }),
    clarity: bucketAvg({ POOR: clar[0], AVERAGE: clar[1], GREAT: clar[2] }),
    heard: bucketAvg({ POOR: heard[0], AVERAGE: heard[1], GREAT: heard[2] }),
  };
  const roleplayMom = r1((cats.comprehension + cats.clarity + cats.heard) / 3);
  // Production MOM (real when the advocate has production calls; else pending).
  const prod = PRODUCTION.get(id) || null;
  const productionMom = prod ? prod.mom : null;
  // Provisional readiness: roleplay + production when both present, else roleplay only.
  // (Assessment / Attendance still pending.)
  const composite = prod
    ? round(((roleplayMom + prod.mom) / 2) * 20)
    : round(roleplayMom * 20);
  const g = gradeOf(composite).letter;
  const sorted: CatScore[] = CATEGORIES.map((c) => ({ ...c, val: cats[c.key] })).sort((a, b) => b.val - a.val);
  const first = name.split(" ")[0];
  const note =
    g === "A"
      ? `${first} is graduation-ready on roleplay and consistently models ${sorted[0].label.toLowerCase()}. Confirm Production MOM and assessments before graduating.`
      : g === "B"
        ? `${first} is on track on roleplay. ${sorted[0].label} is a clear strength; tighten ${sorted[sorted.length - 1].label.toLowerCase()} as production scores come online.`
        : g === "C"
          ? `${first} needs targeted support on ${sorted[sorted.length - 1].label.toLowerCase()}. Reinforce with focused roleplays and reassess.`
          : `${first} is below roleplay threshold on ${sorted[sorted.length - 1].label.toLowerCase()}. Active coaching recommended.`;
  return {
    id, name, email, cohort: null,
    composite, grade: g,
    roleplayMom, productionMom,
    roleplay: round(roleplayMom * 20), production: prod ? round(prod.mom * 20) : null,
    assessment: null, attendance: null,
    delta: 0,
    cats, strength: sorted[0], opportunity: sorted[sorted.length - 1],
    sessions: sims, liveCalls: prod ? prod.calls : 0, missed: 0, note,
    leader: leader || undefined, hireDate: hireDate || undefined, job: job || undefined,
    level: LEVEL_BY_JOB[job] || "New Hire", sims, live: true,
  };
}

// Employees who are "Training Specialist, Customer Care" are trainers/facilitators,
// not students — exclude them from the advocate pool (they appear in the trainer rail).
const TRAINER_EMP_IDS = new Set((trainerSnapshot.rows as unknown[][]).map((r) => String(r[0])));

export const allAdvocates: Advocate[] = (snapshot.rows as SnapRow[])
  .map(buildAdvocate)
  .filter((a) => !TRAINER_EMP_IDS.has(a.id))
  .sort((a, b) => a.name.localeCompare(b.name));

// No pre-built classes — advocates are assigned into user-created classes.
export const cohorts: NestClass[] = [];

const totalAdv = allAdvocates.length;
export const programAvg = totalAdv ? round(allAdvocates.reduce((s, a) => s + a.composite, 0) / totalAdv) : 0;
const dist: Record<GradeLetter, number> = { A: 0, B: 0, C: 0, D: 0 };
allAdvocates.forEach((a) => dist[a.grade]++);
export { dist };
export const pctReady = totalAdv ? round(((dist.A + dist.B) / totalAdv) * 100) : 0;
export const READINESS_THRESHOLD = 76;
export const atRisk = allAdvocates.filter((a) => a.composite < READINESS_THRESHOLD).sort((a, b) => a.composite - b.composite);

export const catProgram: CatScore[] = CATEGORIES.map((cat) => {
  const val = totalAdv ? r1(allAdvocates.reduce((s, a) => s + a.cats[cat.key], 0) / totalAdv) : 0;
  return { ...cat, val };
});
export const programMom = r1(catProgram.reduce((s, c) => s + c.val, 0) / (catProgram.length || 1));
export const opportunities = [...catProgram].sort((a, b) => a.val - b.val);
export const strengths = [...catProgram].sort((a, b) => b.val - a.val);

// program-level context is not yet sourced live — synthesized at a neutral distribution.
const ccr = rng(90210);
function synthCtx(dimKey: keyof typeof CONTEXT, weights: number[]): ContextLevelAgg[] {
  const levels = CONTEXT[dimKey].levels;
  return levels.map((l, i) => ({ ...l, count: 0, pct: Math.round(weights[i] * 100) }));
}
void ccr;
export const context = {
  customerDifficulty: synthCtx("customerDifficulty", [0.7, 0.22, 0.08]),
  situationDifficulty: synthCtx("situationDifficulty", [0.74, 0.19, 0.07]),
  sentiment: synthCtx("sentiment", [0.34, 0.45, 0.21]),
};

const ptr = rng(424242);
export const programTrend: number[] = [];
let pv = programAvg - 11;
for (let w = 1; w <= 6; w++) {
  pv += gauss(ptr, 1.9, 0.8);
  programTrend.push(clamp(round(pv), 55, 95));
}
programTrend[programTrend.length - 1] = programAvg;
export const priorTrend = programTrend.map((x, i) => clamp(round(x - 3 - (5 - i) * 0.4 + gauss(ptr, 0, 1)), 50, 92));

export const momentum = [...allAdvocates].sort((a, b) => b.roleplayMom - a.roleplayMom).slice(0, 5);

export const cohortName = (id: string | null) => cohorts.find((c) => c.id === id)?.name || "Unassigned";
export const cohortById = (id: string | null) => cohorts.find((c) => c.id === id);
export const advocateById = (id: string) => allAdvocates.find((a) => a.id === id);

export const cohortGroups: { key: string; label: string; classes: string[]; count: number }[] = [];

export const levelStats = LEVELS.map((level) => {
  const advs = allAdvocates.filter((a) => a.level === level);
  const avg = advs.length ? round(advs.reduce((s, a) => s + a.composite, 0) / advs.length) : 0;
  return { level, classes: 0, advocates: advs.length, avg, grade: gradeOf(avg) };
}).filter((l) => l.advocates > 0);

export const graduating = cohorts.find((c) => c.status === "Graduating");

// ---------------------------------------------------------------------------
// coaching-plan generator (mirrors the Streamlit MOM coaching app)
// ---------------------------------------------------------------------------
export const PLAYBOOK: Record<CatKey, { focus: string; why: string; drills: string[]; scenarios: string[]; talking: string }> = {
  comprehension: {
    focus: "Comprehension — accurately reading the customer's question and constraints",
    why: "Misreads on the customer's actual ask drive avoidable rework and repeat contacts.",
    drills: [
      "Teach-back: after each practice call, restate the customer's problem in one sentence before responding.",
      "Note the customer's stated constraint (timeline, budget, vehicle) out loud before proposing a path.",
      "Review 3 recent transcripts and mark where the intent was missed vs. confirmed.",
    ],
    scenarios: ["Multi-issue call: customer raises financing + trade-in together", "Ambiguous ask: customer unsure whether they want to buy or sell first"],
    talking: "Lead with what you heard, then confirm before solving. Slow the first 30 seconds down.",
  },
  clarity: {
    focus: "Clarity of next steps — giving complete, actionable guidance",
    why: "Vague closes are the top driver of repeat contacts and low resolution scores.",
    drills: [
      "End every roleplay with an explicit recap: what happens, who owns it, by when.",
      "Practice the 'one clear next step' close — no more than two actions handed to the customer.",
      "Record yourself summarizing a resolution in under 20 seconds.",
    ],
    scenarios: ["Hand-off call: set expectations for a callback window", "Document-needed call: tell the customer exactly what to upload and where"],
    talking: "Always close the loop. The customer should be able to repeat the next step back to you.",
  },
  heard: {
    focus: "Customer felt heard — validation and acknowledgement",
    why: "Low 'felt heard' scores correlate with detractor sentiment even when the issue is resolved.",
    drills: [
      "Open with an empathy statement that names the customer's situation, not a script line.",
      "Practice reflective listening: acknowledge the emotion before the logistics.",
      "Shadow a top-scoring advocate's call and note their acknowledgement moments.",
    ],
    scenarios: ["Frustrated customer: delivery delayed twice", "Anxious first-time buyer needing reassurance"],
    talking: "Acknowledge before you act. Name what the customer is feeling early in the call.",
  },
};

export function makePlan(advId: string) {
  const a = allAdvocates.find((x) => x.id === advId);
  if (!a) return null;
  const c = cohortById(a.cohort);
  const ranked: CatScore[] = CATEGORIES.map((cat) => ({ ...cat, val: a.cats[cat.key] })).sort((x, y) => x.val - y.val);
  const primary = ranked[0];
  const secondary = ranked[1].val < 3.6 ? ranked[1] : null;
  const focusKeys = [primary.key, secondary && secondary.key].filter(Boolean) as CatKey[];
  const horizon = a.composite < 64 ? "2 weeks · daily touchpoints" : "2 weeks · 3 check-ins";
  return {
    advocate: a, cohort: c,
    generatedAt: fmtDate(new Date("2026-07-16T00:00:00")),
    summary: `${a.name.split(" ")[0]} is scoring ${a.composite} (grade ${a.grade}) on roleplay. The biggest lever is ${PLAYBOOK[primary.key].focus.split(" — ")[0].toLowerCase()}, where ${a.name.split(" ")[0]} averages ${a.cats[primary.key].toFixed(1)}/5 versus a program average of ${catProgram.find((cp) => cp.key === primary.key)!.val.toFixed(1)}.`,
    focusAreas: focusKeys.map((k) => ({ key: k, score: a.cats[k], ...PLAYBOOK[k] })),
    horizon,
    checkins: [
      { when: "Day 1", what: "Kickoff 1:1 — review scores, agree on the focus and set a target." },
      { when: "Day 4", what: "Roleplay session on the primary focus scenario; score with the MOM rubric." },
      { when: "Day 8", what: "Live-call review — listen to 2 production calls together." },
      { when: "Day 12", what: "Re-assessment roleplay; compare MOM delta and decide next step." },
    ],
    target: Math.min(a.composite + 12, 88),
  };
}

// ---------------------------------------------------------------------------
// Trainers — real "Training Specialist, Customer Care" from the Workday roster,
// draggable as the class coach/facilitator on Class Assignments.
// The two team-lead coaches (Shelby Gary / Shantelle Garner) who occasionally
// coach are retained for the coaching-log flow + Release auto-assignment.
// ---------------------------------------------------------------------------
type TrainerRow = [string, string, string, string, string, string, number];
const shortName = (name: string) => {
  const parts = name.split(" ");
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
};
const LOCATION_NAME: Record<string, string> = { "HQ-5": "Tempe, AZ", "HQ-3": "Tempe, AZ" };
const tenureStr = (months: number) => `${Math.max(0.1, Math.round((months / 12) * 10) / 10)} yrs`;

const REAL_TRAINERS: Trainer[] = (trainerSnapshot.rows as TrainerRow[]).map((r) => {
  const [id, name, email, , location, , tenureMonths] = r;
  return { id: `t-${id}`, name, short: shortName(name), email, tenure: tenureStr(tenureMonths), home: LOCATION_NAME[location] || location };
});

// Leadership (from the roster reporting chain): Shantelle Garner (Team Lead; Workday
// preferred name "Shantelle Rammell") manages all the trainers and reports to Shelby
// Gary (Manager), who is over the whole program. Both occasionally coach; Release
// reviews auto-assign to Shelby Gary (top of the chain).
export const TRAINERS: Trainer[] = [
  ...REAL_TRAINERS,
  { id: "t-garner", name: "Shantelle Garner", short: "S. Garner", email: "shantelle.garner@carvana.com", tenure: "2.8 yrs", home: "Tempe, AZ", role: "Team Lead" },
  { id: "t-gary", name: "Shelby Gary", short: "S. Gary", email: "shelby.gary@carvana.com", tenure: "5.4 yrs", home: "Tempe, AZ", role: "Manager" },
];
const trainerByShortMap: Record<string, Trainer> = {};
TRAINERS.forEach((t) => (trainerByShortMap[t.short] = t));
export const trainerByShort = (short: string) => trainerByShortMap[short];
export const trainerById = (id: string | null) => TRAINERS.find((t) => t.id === id) || null;

export const TRAINER_STATUSES: TrainerStatus[] = [
  { key: "training", label: "In training", color: "var(--reference-blue-500)" },
  { key: "production", label: "In production", color: "var(--reference-green-500)" },
  { key: "assessments", label: "Assessments", color: "var(--reference-indigo-500)" },
  { key: "coaching", label: "Coaching", color: "var(--reference-orange-500)" },
  { key: "meeting", label: "Meeting", color: "var(--reference-violet-500)" },
  { key: "admin", label: "Admin time", color: "var(--reference-slate-400)" },
];
export const defaultTrainerStatus = (id: string) => {
  const seed = id.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return TRAINER_STATUSES[seed % TRAINER_STATUSES.length].key;
};

export const classesOfTrainer = (trainerId: string) => cohorts.filter((c) => c.trainerId === trainerId);

export const trainerInsights = (trainerId: string): TrainerInsight | null => {
  const classes = classesOfTrainer(trainerId);
  if (!classes.length) return null;
  const catTotals: Record<CatKey, number[]> = { comprehension: [], clarity: [], heard: [] };
  classes.forEach((c) => CATEGORIES.forEach((cat) => catTotals[cat.key].push(c.cats[cat.key])));
  const catAvgs: CatScore[] = CATEGORIES.map((cat) => ({ ...cat, val: r1(catTotals[cat.key].reduce((s, v) => s + v, 0) / classes.length) }));
  const weakest = [...catAvgs].sort((a, b) => a.val - b.val)[0];
  const weakInHowMany = classes.filter((c) => {
    const sorted = CATEGORIES.map((cat) => ({ key: cat.key, val: c.cats[cat.key] })).sort((a, b) => a.val - b.val);
    return sorted[0].key === weakest.key;
  }).length;
  const advs = classes.flatMap((c) => c.advocates);
  const avg = advs.length ? round(advs.reduce((s, a) => s + a.composite, 0) / advs.length) : 0;
  const gap = avg - programAvg;
  return { classes: classes.length, advocates: advs.length, avg, gap, catAvgs, weakest, weakInHowMany };
};

export const trainerRanking = () =>
  TRAINERS.filter((t) => classesOfTrainer(t.id).length)
    .map((t) => {
      const ins = trainerInsights(t.id)!;
      return { trainer: t, avg: ins.avg, classes: ins.classes, advocates: ins.advocates, weakest: ins.weakest };
    })
    .sort((a, b) => b.avg - a.avg);

// ---- AI Efficiency: call records (synthesized from real advocates' roleplay MOM) ----
// TODO: replace with real ACS call/transcript records when that source is wired.
const SCENARIO = ["Delivery reschedule", "Trade-in valuation", "Financing question", "Doc upload help", "Title & registration", "Warranty claim", "Cancellation", "Payment update", "Delivery status", "Buyback inquiry"];
export const calls: Call[] = [];
{
  const cr = rng(90210);
  allAdvocates.forEach((a, idx) => {
    const n = a.sims ? Math.min(a.sims, 4) : 2;
    for (let k = 0; k < n; k++) {
      const durationSec = Math.floor(60 + cr() * 900);
      const cutoff = durationSec < 180 && cr() < 0.62;
      const failedMom = !cutoff && cr() < 0.05;
      const scored = !cutoff && !failedMom;
      const mom = scored ? r1(Math.max(1, Math.min(5, a.roleplayMom + (cr() - 0.5) * 1.2))) : null;
      const daysAgo = Math.floor(cr() * 6);
      const d = new Date("2026-07-16T00:00:00");
      d.setDate(d.getDate() - daysAgo);
      calls.push({
        id: `call-${a.id}-${k}`, advId: a.id, scenario: SCENARIO[(idx + k) % SCENARIO.length],
        durationSec, cutoff, failedMom, scored, mom,
        date: fmtDate(d),
        acsId: `ACS-${100000 + Math.floor(cr() * 899999)}`,
        endReason: cutoff ? (cr() < 0.5 ? "Customer disconnected" : "Dropped — no resolution") : "Completed",
      });
    }
  });
}
export const cutoffCalls = calls.filter((c) => c.cutoff).sort((a, b) => a.durationSec - b.durationSec);
export const failedCalls = calls.filter((c) => c.failedMom);
export const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export const transcriptFor = (call: Call) => {
  const a = advocateById(call.advId)!;
  const first = a.name.split(" ")[0];
  const lines = [
    { who: "Customer", t: "Hi, I'm calling about my delivery — it was supposed to be today." },
    { who: "Advocate", t: `Thanks for reaching out, this is ${first} with Carvana. Let me pull that up for you.` },
    { who: "Customer", t: "I've already waited a week, this is really frustrating." },
  ];
  if (call.cutoff) {
    lines.push({ who: "System", t: `Call ended at ${fmtDur(call.durationSec)} — ${call.endReason}. Transcript below the 3-minute scoring threshold.` });
  } else {
    lines.push({ who: "Advocate", t: "I completely understand, and I'm sorry for the wait. Here's exactly what I can do…" });
    lines.push({ who: "Customer", t: "Okay, that works. Thank you." });
  }
  return lines;
};

// ---- Base coaching records: one plan per at-risk advocate ----
const DATES = ["Jul 16, 2026", "Jul 15, 2026", "Jul 14, 2026", "Jul 11, 2026", "Jul 10, 2026", "Jul 9, 2026"];
export const baseCoachings: (Coaching & { defaultComplete: boolean })[] = atRisk.slice(0, 24).map((a, i) => ({
  id: `cp-${a.id}`, advId: a.id, kind: "Coaching plan", focus: a.opportunity.label,
  trainerId: a.cohort ? cohortById(a.cohort)?.trainerId || null : null,
  date: DATES[i % DATES.length], priority: false, source: "plan" as const,
  defaultComplete: false,
}));
export const extraSamples: (Coaching & { defaultComplete: boolean })[] = [];

export const avgCallLen = calls.length ? round(calls.reduce((s, c) => s + c.durationSec, 0) / calls.length) : 0;
export const scoredCount = calls.filter((c) => c.scored).length;
export const programGrade = gradeOf(programAvg);
export const period = "Roleplay simulations · through Jul 16, 2026";
export const fmt = { clamp, round, r1, fmtDate };
