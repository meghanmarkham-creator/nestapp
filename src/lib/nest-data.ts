// The Nest — shared data model (TypeScript port of app/data.jsx + app/data_ext.jsx).
//
// Built on Carvana's real MOM rubric:
//   Coaching criteria (scored 1–5): Comprehension · Clarity of Next Steps · Customer Felt Heard
//   Non-coaching context (categorical): Customer Difficulty · Situation Difficulty · Sentiment Impact
// Readiness = 0–100 composite → A–D letter (Roleplay MOM, Production MOM, Assessment, Attendance).
//
// This module deterministically generates a stable demo dataset from seeds — it is the
// DATA-SHAPE CONTRACT, not real data. Real MOM scores are wired in lib/momSource.ts,
// which sources from Snowflake (CUSTOMERCARE.MOM_STANDARD.VW_CX_NEST_SIMULATION_INSIGHTS)
// and overlays them onto these advocate shapes.

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
// MOM coaching criteria (AI grades each call/roleplay 1–5)
// ---------------------------------------------------------------------------
export const CATEGORIES: Category[] = [
  { key: "comprehension", label: "Comprehension", short: "Comprehension", bias: 0.22, desc: "Accurately interprets the customer's question, context and constraints." },
  { key: "clarity", label: "Clarity of Next Steps", short: "Clarity", bias: -0.3, desc: "Gives actionable, complete guidance — what, who owns it, by when." },
  { key: "heard", label: "Customer Felt Heard", short: "Felt Heard", bias: -0.12, desc: "Customer leaves feeling validated, acknowledged and respected." },
];

export const CONTEXT = {
  customerDifficulty: {
    key: "customerDifficulty",
    label: "Customer difficulty",
    levels: [
      { key: "easy", label: "Easy", color: "var(--reference-green-500)" },
      { key: "medium", label: "Medium", color: "var(--reference-yellow-500)" },
      { key: "challenging", label: "Challenging", color: "var(--reference-red-500)" },
    ] as ContextLevel[],
  },
  situationDifficulty: {
    key: "situationDifficulty",
    label: "Situation difficulty",
    levels: [
      { key: "easy", label: "Easy", color: "var(--reference-green-500)" },
      { key: "medium", label: "Medium", color: "var(--reference-yellow-500)" },
      { key: "hard", label: "Hard", color: "var(--reference-red-500)" },
    ] as ContextLevel[],
  },
  sentiment: {
    key: "sentiment",
    label: "Sentiment impact",
    levels: [
      { key: "improved", label: "Improved", color: "var(--reference-green-500)" },
      { key: "noChange", label: "No change", color: "var(--reference-slate-400)" },
      { key: "concerning", label: "Concerning", color: "var(--reference-red-500)" },
    ] as ContextLevel[],
  },
};
type CtxDimKey = keyof typeof CONTEXT;

const FIRST = ["Maya","Devon","Priya","Marcus","Elena","Jordan","Aaliyah","Tyler","Sofia","Andre","Nina","Cole","Brianna","Diego","Hannah","Isaiah","Camila","Reza","Grace","Malik","Olivia","Trevor","Yuki","Damon","Lena","Omar","Paige","Quinn","Rosa","Sam","Tara","Victor","Wren","Xavier","Yara","Zane","Bella","Caleb","Dana","Eli","Faith","Gabe","Hope","Ivan","Jade","Kira","Leo","Mara","Noah","Opal"];
const LAST = ["Reyes","Carter","Sharma","Johnson","Vasquez","Lee","Brooks","Nguyen","Romano","Walker","Patel","Foster","Diaz","Klein","Murphy","Bennett","Ortiz","Khan","Sullivan","Coleman","Hughes","Park","Tanaka","Bauer","Novak","Hassan","Webb","Riley","Mendez","Cohen","Frost","Adler","Boyd","Cruz","Dunn","Estes","Flynn","Gates","Holt","Iqbal","Jensen","Kemp","Lowe","Marsh","Noble","Owens","Pace","Quill","Ross","Stein"];

export const LEVELS = ["New Hire", "CAII", "Senior", "Digi", "Exec Res"];

// start date derived from program week, relative to the reporting Monday (Jun 8, 2026).
const REPORT_MONDAY = new Date("2026-06-08T00:00:00");
const startDateOf = (weekOf: number) => {
  const d = new Date(REPORT_MONDAY);
  d.setDate(d.getDate() - (weekOf - 1) * 7);
  return d;
};
const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

interface CohortSeed {
  id: string; name: string; level: string; loc: string; mode: string;
  weekOf: number; weeks: number; size: number; base: number; seed: number;
  status: NestClass["status"]; lead: string;
}

const COHORTS: (CohortSeed & { startDate: Date; cohortKey: string; cohortLabel: string })[] = (
  [
    { id: "n2609", name: "Nest 26-09", level: "New Hire", loc: "Tempe, AZ", mode: "In-person", weekOf: 6, weeks: 6, size: 20, base: 87, seed: 1109, status: "Graduating", lead: "R. Calloway" },
    { id: "n2610", name: "Nest 26-10", level: "CAII", loc: "Phoenix, AZ", mode: "Hybrid", weekOf: 5, weeks: 6, size: 18, base: 85, seed: 1210, status: "In training", lead: "M. Okafor" },
    { id: "n2611", name: "Nest 26-11", level: "New Hire", loc: "Tempe, AZ", mode: "In-person", weekOf: 5, weeks: 6, size: 22, base: 81, seed: 1111, status: "In training", lead: "A. Flynn" },
    { id: "n2612", name: "Nest 26-12", level: "Senior", loc: "Remote", mode: "Remote", weekOf: 4, weeks: 6, size: 16, base: 88, seed: 1212, status: "In training", lead: "J. Pruitt" },
    { id: "n2613", name: "Nest 26-13", level: "New Hire", loc: "Atlanta, GA", mode: "In-person", weekOf: 3, weeks: 6, size: 24, base: 78, seed: 1313, status: "In training", lead: "S. Beckett" },
    { id: "n2614", name: "Nest 26-14", level: "Digi", loc: "Remote", mode: "Remote", weekOf: 3, weeks: 6, size: 18, base: 82, seed: 1414, status: "In training", lead: "D. Marsh" },
    { id: "n2615", name: "Nest 26-15", level: "CAII", loc: "Austin, TX", mode: "In-person", weekOf: 2, weeks: 6, size: 20, base: 84, seed: 1515, status: "In training", lead: "T. Vance" },
    { id: "n2616", name: "Nest 26-16", level: "Exec Res", loc: "Phoenix, AZ", mode: "Hybrid", weekOf: 1, weeks: 6, size: 14, base: 80, seed: 1616, status: "Onboarding", lead: "L. Ortiz" },
    { id: "n2617", name: "Nest 26-17", level: "New Hire", loc: "Tempe, AZ", mode: "In-person", weekOf: 1, weeks: 6, size: 24, base: 77, seed: 1717, status: "Onboarding", lead: "K. Webb" },
  ] as CohortSeed[]
).map((c) => {
  const sd = startDateOf(c.weekOf);
  return { ...c, startDate: sd, cohortKey: sd.toISOString().slice(0, 10), cohortLabel: fmtDate(sd) };
});

function distribute(total: number, weights: number[], r: () => number): number[] {
  const raw = weights.map((w) => w * total);
  const out = raw.map(Math.floor);
  const rem = total - out.reduce((s, v) => s + v, 0);
  const frac = raw
    .map((v, i) => ({ i, f: v - Math.floor(v) }))
    .sort((a, b) => b.f - a.f);
  for (let k = 0; k < rem; k++) out[frac[k % frac.length].i]++;
  return out;
}

function zip(levels: ContextLevel[], counts: number[]): Record<string, number> {
  const o: Record<string, number> = {};
  levels.forEach((l, i) => (o[l.key] = counts[i]));
  return o;
}

function buildCohort(c: (typeof COHORTS)[number]): NestClass {
  const r = rng(c.seed);
  const momMean = c.base / 20;
  const advocates: Advocate[] = [];
  for (let i = 0; i < c.size; i++) {
    const roleplayMom = clamp(r1(gauss(r, momMean - 0.05, 0.55)), 1.4, 5);
    const productionMom = clamp(r1(gauss(r, momMean - 0.22, 0.62)), 1.2, 5);
    const assessment = clamp(round(gauss(r, c.base - 3, 9)), 45, 100);
    const attendance = clamp(round(gauss(r, 91, 8)), 64, 100);
    const comp = round(roleplayMom * 20 * 0.3 + productionMom * 20 * 0.3 + assessment * 0.25 + attendance * 0.15);
    const delta = round(gauss(r, 2.5, 3));
    const name = `${FIRST[(c.seed + i * 7) % FIRST.length]} ${LAST[(c.seed * 3 + i * 5) % LAST.length]}`;
    const acr = rng(c.seed * 17 + i * 101 + 3);
    const aMom = (roleplayMom + productionMom) / 2;
    const aCats = {} as CatMap;
    CATEGORIES.forEach((cat) => {
      aCats[cat.key] = clamp(r1(gauss(acr, aMom + cat.bias * 1.4, 0.4)), 1, 5);
    });
    const aSorted: CatScore[] = CATEGORIES.map((cat) => ({ ...cat, val: aCats[cat.key] })).sort((a, b) => b.val - a.val);
    const sessions = 6 + Math.floor(acr() * 10);
    const liveCalls = 12 + Math.floor(acr() * 40);
    const firstName = name.split(" ")[0];
    const g = gradeOf(comp).letter;
    const note =
      g === "A"
        ? `${firstName} is graduation-ready and consistently models ${aSorted[0].label.toLowerCase()}. A strong candidate for an accelerated ramp; pair as a peer mentor.`
        : g === "B"
          ? `${firstName} is on track. ${aSorted[0].label} is a clear strength; tighten ${aSorted[aSorted.length - 1].label.toLowerCase()} before handoff and they'll be solid on the floor.`
          : g === "C"
            ? `${firstName} needs targeted support on ${aSorted[aSorted.length - 1].label.toLowerCase()}. Reinforce with focused roleplays; reassess before the next milestone.`
            : `${firstName} is at risk and below threshold on ${aSorted[aSorted.length - 1].label.toLowerCase()}. Active coaching plan in place; daily touchpoints recommended.`;
    advocates.push({
      id: `${c.id}-${i}`, name, cohort: c.id,
      composite: comp, grade: g,
      roleplayMom, productionMom,
      roleplay: round(roleplayMom * 20), production: round(productionMom * 20),
      assessment, attendance, delta,
      cats: aCats, strength: aSorted[0], opportunity: aSorted[aSorted.length - 1],
      sessions, liveCalls, missed: clamp(Math.round((100 - attendance) / 6), 0, 4), note,
    });
  }
  advocates.sort((a, b) => b.composite - a.composite);

  const cr = rng(c.seed + 99);
  const cats = {} as CatMap;
  CATEGORIES.forEach((cat) => {
    cats[cat.key] = clamp(r1(gauss(cr, momMean + cat.bias, 0.14)), 1, 5);
  });
  const momAvg = r1(CATEGORIES.reduce((s, cat) => s + cats[cat.key], 0) / CATEGORIES.length);

  const interactions = c.size * 3;
  const ccr = rng(c.seed + 51);
  const hard = c.base < 80 ? 0.1 : 0.07;
  const ctx = {
    customerDifficulty: zip(CONTEXT.customerDifficulty.levels, distribute(interactions, [0.7, 0.22, 0.08], ccr)),
    situationDifficulty: zip(CONTEXT.situationDifficulty.levels, distribute(interactions, [0.74, 0.19, hard], ccr)),
    sentiment: zip(CONTEXT.sentiment.levels, distribute(interactions, [clamp(0.3 + (momMean - 4) * 0.2, 0.2, 0.55), 0.45, clamp(0.18 - (momMean - 4) * 0.15, 0.05, 0.3)], ccr)),
  };

  const avg = round(advocates.reduce((s, a) => s + a.composite, 0) / advocates.length);
  const dist: Record<GradeLetter, number> = { A: 0, B: 0, C: 0, D: 0 };
  advocates.forEach((a) => dist[a.grade]++);
  const tr = rng(c.seed + 7);
  const trend: number[] = [];
  let v = c.base - c.weekOf * 2.2 - 4;
  for (let w = 1; w <= c.weekOf; w++) {
    v += gauss(tr, 2.6, 1.2);
    trend.push(clamp(round(v), 55, 99));
  }
  trend[trend.length - 1] = avg;

  const sortedCats: CatScore[] = CATEGORIES.map((cat) => ({ ...cat, val: cats[cat.key] })).sort((a, b) => b.val - a.val);
  return {
    ...c, trainerId: null, advocates, cats, momAvg, ctx, interactions, avg,
    grade: gradeOf(avg), dist, trend,
    strength: sortedCats[0], opportunity: sortedCats[sortedCats.length - 1],
  };
}

export const cohorts: NestClass[] = COHORTS.map(buildCohort);
export const allAdvocates: Advocate[] = cohorts.flatMap((c) => c.advocates);

const totalAdv = allAdvocates.length;
export const programAvg = round(allAdvocates.reduce((s, a) => s + a.composite, 0) / totalAdv);
const dist: Record<GradeLetter, number> = { A: 0, B: 0, C: 0, D: 0 };
allAdvocates.forEach((a) => dist[a.grade]++);
export const pctReady = round(((dist.A + dist.B) / totalAdv) * 100);
export const READINESS_THRESHOLD = 76;
export const atRisk = allAdvocates.filter((a) => a.composite < READINESS_THRESHOLD).sort((a, b) => a.composite - b.composite);
export const graduating = cohorts.find((c) => c.status === "Graduating");

export const catProgram: CatScore[] = CATEGORIES.map((cat) => {
  const vals = cohorts.map((c) => c.cats[cat.key]);
  return { ...cat, val: r1(vals.reduce((s, v) => s + v, 0) / vals.length) };
});
export const programMom = r1(catProgram.reduce((s, c) => s + c.val, 0) / catProgram.length);
export const opportunities = [...catProgram].sort((a, b) => a.val - b.val);
export const strengths = [...catProgram].sort((a, b) => b.val - a.val);

function aggCtx(dimKey: CtxDimKey): ContextLevelAgg[] {
  const levels = CONTEXT[dimKey].levels;
  const totals: Record<string, number> = {};
  let sum = 0;
  levels.forEach((l) => {
    totals[l.key] = cohorts.reduce((s, c) => s + c.ctx[dimKey][l.key], 0);
    sum += totals[l.key];
  });
  return levels.map((l) => ({ ...l, count: totals[l.key], pct: round((totals[l.key] / sum) * 100) }));
}
export const context = {
  customerDifficulty: aggCtx("customerDifficulty"),
  situationDifficulty: aggCtx("situationDifficulty"),
  sentiment: aggCtx("sentiment"),
};

const ptr = rng(424242);
export const programTrend: number[] = [];
let pv = programAvg - 11;
for (let w = 1; w <= 6; w++) {
  pv += gauss(ptr, 1.9, 0.8);
  programTrend.push(clamp(round(pv), 60, 95));
}
programTrend[programTrend.length - 1] = programAvg;
export const priorTrend = programTrend.map((x, i) => clamp(round(x - 3 - (5 - i) * 0.4 + gauss(ptr, 0, 1)), 55, 95));

export const momentum = [...allAdvocates].sort((a, b) => b.delta - a.delta).slice(0, 5);

export const cohortName = (id: string) => cohorts.find((c) => c.id === id)?.name || id;
export const cohortById = (id: string) => cohorts.find((c) => c.id === id);
export const advocateById = (id: string) => allAdvocates.find((a) => a.id === id);

export const cohortGroups = [...new Set(cohorts.map((c) => c.cohortKey))]
  .sort((a, b) => b.localeCompare(a))
  .map((key) => {
    const cs = cohorts.filter((c) => c.cohortKey === key);
    return { key, label: cs[0].cohortLabel, classes: cs.map((c) => c.id), count: cs.length };
  });

export const levelStats = LEVELS.map((level) => {
  const cs = cohorts.filter((c) => c.level === level);
  const advs = cs.flatMap((c) => c.advocates);
  const avg = advs.length ? round(advs.reduce((s, a) => s + a.composite, 0) / advs.length) : 0;
  return { level, classes: cs.length, advocates: advs.length, avg, grade: gradeOf(avg) };
}).filter((l) => l.advocates > 0);

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
  const c = cohorts.find((co) => co.id === a.cohort);
  const ranked: CatScore[] = CATEGORIES.map((cat) => ({ ...cat, val: a.cats[cat.key] })).sort((x, y) => x.val - y.val);
  const primary = ranked[0];
  const secondary = ranked[1].val < 3.6 ? ranked[1] : null;
  const focusKeys = [primary.key, secondary && secondary.key].filter(Boolean) as CatKey[];
  const horizon = a.composite < 64 ? "2 weeks · daily touchpoints" : "2 weeks · 3 check-ins";
  return {
    advocate: a, cohort: c,
    generatedAt: "Jun 12, 2026",
    summary: `${a.name.split(" ")[0]} is scoring ${a.composite} (grade ${a.grade}) — below the readiness threshold. The biggest lever is ${PLAYBOOK[primary.key].focus.split(" — ")[0].toLowerCase()}, where ${a.name.split(" ")[0]} averages ${a.cats[primary.key].toFixed(1)}/5 versus a program average of ${catProgram.find((cp) => cp.key === primary.key)!.val.toFixed(1)}.`,
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
// data_ext.jsx — trainers, statuses, calls, base coachings, trend analysis
// ---------------------------------------------------------------------------
export const TRAINERS: Trainer[] = [
  { id: "t-calloway", name: "Rachel Calloway", short: "R. Calloway", email: "rachel.calloway@carvana.com", tenure: "3.5 yrs", home: "Tempe, AZ" },
  { id: "t-okafor", name: "Marcus Okafor", short: "M. Okafor", email: "marcus.okafor@carvana.com", tenure: "2 yrs", home: "Phoenix, AZ" },
  { id: "t-flynn", name: "Aisha Flynn", short: "A. Flynn", email: "aisha.flynn@carvana.com", tenure: "4 yrs", home: "Tempe, AZ" },
  { id: "t-pruitt", name: "Jordan Pruitt", short: "J. Pruitt", email: "jordan.pruitt@carvana.com", tenure: "1.5 yrs", home: "Remote" },
  { id: "t-beckett", name: "Sam Beckett", short: "S. Beckett", email: "sam.beckett@carvana.com", tenure: "5 yrs", home: "Atlanta, GA" },
  { id: "t-marsh", name: "Dana Marsh", short: "D. Marsh", email: "dana.marsh@carvana.com", tenure: "2.5 yrs", home: "Remote" },
  { id: "t-vance", name: "Tara Vance", short: "T. Vance", email: "tara.vance@carvana.com", tenure: "3 yrs", home: "Austin, TX" },
  { id: "t-ortiz", name: "Luis Ortiz", short: "L. Ortiz", email: "luis.ortiz@carvana.com", tenure: "1 yr", home: "Phoenix, AZ" },
  { id: "t-webb", name: "Kira Webb", short: "K. Webb", email: "kira.webb@carvana.com", tenure: "6 yrs", home: "Tempe, AZ" },
  { id: "t-gary", name: "Shelby Gary", short: "S. Gary", email: "shelby.gary@carvana.com", tenure: "7 yrs", home: "Tempe, AZ", role: "Team Lead" },
  { id: "t-garner", name: "Shantelle Garner", short: "S. Garner", email: "shantelle.garner@carvana.com", tenure: "8 yrs", home: "Tempe, AZ", role: "Team Lead" },
];
const trainerByShortMap: Record<string, Trainer> = {};
TRAINERS.forEach((t) => (trainerByShortMap[t.short] = t));
export const trainerByShort = (short: string) => trainerByShortMap[short];
export const trainerById = (id: string | null) => TRAINERS.find((t) => t.id === id) || null;
// attach trainerId to each cohort (by matching lead short-name)
cohorts.forEach((c) => {
  c.trainerId = (c.lead && trainerByShortMap[c.lead]?.id) || null;
});

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
  const avg = round(advs.reduce((s, a) => s + a.composite, 0) / advs.length);
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

// ---- AI Efficiency: call records ----
const SCENARIO = ["Delivery reschedule", "Trade-in valuation", "Financing question", "Doc upload help", "Title & registration", "Warranty claim", "Cancellation", "Payment update", "Delivery status", "Buyback inquiry"];
export const calls: Call[] = [];
{
  const cr = rng(90210);
  allAdvocates.forEach((a, idx) => {
    const n = 2 + Math.floor(cr() * 3);
    for (let k = 0; k < n; k++) {
      const durationSec = Math.floor(60 + cr() * 900);
      const cutoff = durationSec < 180 && cr() < 0.62;
      const failedMom = !cutoff && cr() < 0.05;
      const scored = !cutoff && !failedMom;
      const mom = scored ? r1(Math.max(1, Math.min(5, a.roleplayMom + (cr() - 0.5) * 1.2))) : null;
      const daysAgo = Math.floor(cr() * 6);
      const d = new Date("2026-06-12T00:00:00");
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

// ---- Base coaching records ----
const DATES = ["Jun 12, 2026", "Jun 11, 2026", "Jun 10, 2026", "Jun 9, 2026", "Jun 6, 2026", "Jun 5, 2026"];
export const baseCoachings: (Coaching & { defaultComplete: boolean })[] = atRisk.map((a, i) => {
  const c = cohortById(a.cohort)!;
  return {
    id: `cp-${a.id}`, advId: a.id, kind: "Coaching plan", focus: a.opportunity.label,
    trainerId: c.trainerId, date: DATES[i % DATES.length], priority: false, source: "plan" as const,
    defaultComplete: a.delta >= 6,
  };
});
export const extraSamples: (Coaching & { defaultComplete: boolean })[] = allAdvocates
  .filter((a) => a.composite >= READINESS_THRESHOLD && a.delta >= 5)
  .slice(0, 6)
  .map((a, i) => {
    const c = cohortById(a.cohort)!;
    return {
      id: `s1-${a.id}`, advId: a.id, kind: i % 2 ? "1:1 logged" : "Roleplay reviewed", focus: a.opportunity.label,
      trainerId: c.trainerId, date: DATES[(i + 2) % DATES.length], priority: false, source: "session" as const, defaultComplete: true,
    };
  });

export const avgCallLen = round(calls.reduce((s, c) => s + c.durationSec, 0) / calls.length);
export const scoredCount = calls.filter((c) => c.scored).length;
export const programGrade = gradeOf(programAvg);
export const period = "Week of Jun 8 – Jun 12, 2026";
export const fmt = { clamp, round, r1, fmtDate };
