// Nest Readiness — shared data model.
// Built on Carvana's real MOM rubric:
//   Coaching criteria (scored 1–5):   Comprehension · Clarity of Next Steps · Customer Felt Heard
//   Non-coaching context (categorical): Customer Difficulty · Situation Difficulty · Sentiment Impact
// Readiness = 0–100 composite → A–D letter (rolls up Roleplay MOM, Production MOM, Assessment, Attendance).
// Deterministic seeded generation so the mock is stable across reloads.
// Exposes (to window): NEST.

(() => {
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const round = (n) => Math.round(n);
  const r1 = (n) => Math.round(n * 10) / 10;
  const gauss = (r, mean, sd) => {
    const u = 1 - r(), v = r();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + z * sd;
  };

  // -- grade scale (report-card A–D), driven by 0–100 composite --
  const GRADES = {
    A: { letter: "A", label: "Ready",         range: "90–100", fill: "var(--reference-green-500)",  subtle: "var(--background-success-subtle)",       text: "var(--text-success)",       solid: "var(--background-success)" },
    B: { letter: "B", label: "On track",      range: "80–89",  fill: "var(--reference-blue-500)",   subtle: "var(--background-informational-subtle)", text: "var(--text-informational)", solid: "var(--background-informational)" },
    C: { letter: "C", label: "Needs support", range: "70–79",  fill: "var(--reference-yellow-500)", subtle: "var(--background-warning-subtle)",       text: "var(--text-warning)",       solid: "var(--background-warning)" },
    D: { letter: "D", label: "At risk",       range: "<70",    fill: "var(--reference-red-500)",    subtle: "var(--background-critical-subtle)",      text: "var(--text-critical)",      solid: "var(--background-critical)" },
  };
  const gradeOf = (n) => n >= 90 ? GRADES.A : n >= 80 ? GRADES.B : n >= 70 ? GRADES.C : GRADES.D;

  // -- MOM coaching criteria (AI grades each call/roleplay 1–5) --
  // bias is applied on the 1–5 scale; reflects where classes typically run hot/cold.
  const CATEGORIES = [
    { key: "comprehension", label: "Comprehension",        short: "Comprehension", bias:  0.22, desc: "Accurately interprets the customer's question, context and constraints." },
    { key: "clarity",       label: "Clarity of Next Steps", short: "Clarity",       bias: -0.30, desc: "Gives actionable, complete guidance — what, who owns it, by when." },
    { key: "heard",         label: "Customer Felt Heard",   short: "Felt Heard",    bias: -0.12, desc: "Customer leaves feeling validated, acknowledged and respected." },
  ];

  // -- context (non-coaching) dimensions --
  const CONTEXT = {
    customerDifficulty: { key: "customerDifficulty", label: "Customer difficulty",
      levels: [
        { key: "easy",        label: "Easy",        color: "var(--reference-green-500)" },
        { key: "medium",      label: "Medium",      color: "var(--reference-yellow-500)" },
        { key: "challenging", label: "Challenging", color: "var(--reference-red-500)" },
      ] },
    situationDifficulty: { key: "situationDifficulty", label: "Situation difficulty",
      levels: [
        { key: "easy",   label: "Easy",   color: "var(--reference-green-500)" },
        { key: "medium", label: "Medium", color: "var(--reference-yellow-500)" },
        { key: "hard",   label: "Hard",   color: "var(--reference-red-500)" },
      ] },
    sentiment: { key: "sentiment", label: "Sentiment impact",
      levels: [
        { key: "improved",   label: "Improved",   color: "var(--reference-green-500)" },
        { key: "noChange",   label: "No change",  color: "var(--reference-slate-400)" },
        { key: "concerning", label: "Concerning", color: "var(--reference-red-500)" },
      ] },
  };

  const FIRST = ["Maya","Devon","Priya","Marcus","Elena","Jordan","Aaliyah","Tyler","Sofia","Andre","Nina","Cole","Brianna","Diego","Hannah","Isaiah","Camila","Reza","Grace","Malik","Olivia","Trevor","Yuki","Damon","Lena","Omar","Paige","Quinn","Rosa","Sam","Tara","Victor","Wren","Xavier","Yara","Zane","Bella","Caleb","Dana","Eli","Faith","Gabe","Hope","Ivan","Jade","Kira","Leo","Mara","Noah","Opal"];
  const LAST = ["Reyes","Carter","Sharma","Johnson","Vasquez","Lee","Brooks","Nguyen","Romano","Walker","Patel","Foster","Diaz","Klein","Murphy","Bennett","Ortiz","Khan","Sullivan","Coleman","Hughes","Park","Tanaka","Bauer","Novak","Hassan","Webb","Riley","Mendez","Cohen","Frost","Adler","Boyd","Cruz","Dunn","Estes","Flynn","Gates","Holt","Iqbal","Jensen","Kemp","Lowe","Marsh","Noble","Owens","Pace","Quill","Ross","Stein"];

  // -- class levels (training tracks) --
  const LEVELS = ["New Hire", "CAII", "Senior", "Digi", "Exec Res"];

  // start date is derived from program week, relative to the reporting Monday (Jun 8, 2026).
  const REPORT_MONDAY = new Date("2026-06-08T00:00:00");
  const startDateOf = (weekOf) => {
    const d = new Date(REPORT_MONDAY);
    d.setDate(d.getDate() - (weekOf - 1) * 7);
    return d;
  };
  const fmtDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const COHORTS = [
    { id: "n2609", name: "Nest 26-09", level: "New Hire", loc: "Tempe, AZ",   mode: "In-person", weekOf: 6, weeks: 6, size: 20, base: 87, seed: 1109, status: "Graduating",  lead: "R. Calloway" },
    { id: "n2610", name: "Nest 26-10", level: "CAII",     loc: "Phoenix, AZ", mode: "Hybrid",    weekOf: 5, weeks: 6, size: 18, base: 85, seed: 1210, status: "In training", lead: "M. Okafor" },
    { id: "n2611", name: "Nest 26-11", level: "New Hire", loc: "Tempe, AZ",   mode: "In-person", weekOf: 5, weeks: 6, size: 22, base: 81, seed: 1111, status: "In training", lead: "A. Flynn" },
    { id: "n2612", name: "Nest 26-12", level: "Senior",   loc: "Remote",      mode: "Remote",    weekOf: 4, weeks: 6, size: 16, base: 88, seed: 1212, status: "In training", lead: "J. Pruitt" },
    { id: "n2613", name: "Nest 26-13", level: "New Hire", loc: "Atlanta, GA", mode: "In-person", weekOf: 3, weeks: 6, size: 24, base: 78, seed: 1313, status: "In training", lead: "S. Beckett" },
    { id: "n2614", name: "Nest 26-14", level: "Digi",     loc: "Remote",      mode: "Remote",    weekOf: 3, weeks: 6, size: 18, base: 82, seed: 1414, status: "In training", lead: "D. Marsh" },
    { id: "n2615", name: "Nest 26-15", level: "CAII",     loc: "Austin, TX",  mode: "In-person", weekOf: 2, weeks: 6, size: 20, base: 84, seed: 1515, status: "In training", lead: "T. Vance" },
    { id: "n2616", name: "Nest 26-16", level: "Exec Res", loc: "Phoenix, AZ", mode: "Hybrid",    weekOf: 1, weeks: 6, size: 14, base: 80, seed: 1616, status: "Onboarding",  lead: "L. Ortiz" },
    { id: "n2617", name: "Nest 26-17", level: "New Hire", loc: "Tempe, AZ",   mode: "In-person", weekOf: 1, weeks: 6, size: 24, base: 77, seed: 1717, status: "Onboarding",  lead: "K. Webb" },
  ].map(c => {
    const sd = startDateOf(c.weekOf);
    return { ...c, startDate: sd, cohortKey: sd.toISOString().slice(0, 10), cohortLabel: fmtDate(sd) };
  });

  // distribute a count across levels by weights, summing exactly to total
  function distribute(total, weights, r) {
    const raw = weights.map(w => w * total);
    const out = raw.map(Math.floor);
    let rem = total - out.reduce((s, v) => s + v, 0);
    const frac = raw.map((v, i) => ({ i, f: v - Math.floor(v) })).sort((a, b) => b.f - a.f);
    for (let k = 0; k < rem; k++) out[frac[k % frac.length].i]++;
    return out;
  }

  function buildCohort(c) {
    const r = rng(c.seed);
    const momMean = c.base / 20; // ~3.8–4.35 on the 1–5 scale
    const advocates = [];
    for (let i = 0; i < c.size; i++) {
      const roleplayMom   = clamp(r1(gauss(r, momMean - 0.05, 0.55)), 1.4, 5);
      const productionMom = clamp(r1(gauss(r, momMean - 0.22, 0.62)),  1.2, 5);
      const assessment    = clamp(round(gauss(r, c.base - 3, 9)), 45, 100);
      const attendance    = clamp(round(gauss(r, 91, 8)), 64, 100);
      // composite on 0–100 from report-card weights (MOM scaled ×20)
      const comp = round(roleplayMom * 20 * 0.30 + productionMom * 20 * 0.30 + assessment * 0.25 + attendance * 0.15);
      const delta = round(gauss(r, 2.5, 3));
      const name = `${FIRST[(c.seed + i * 7) % FIRST.length]} ${LAST[(c.seed * 3 + i * 5) % LAST.length]}`;
      // per-advocate MOM category breakdown (1–5), clustered around their own MOM level
      const acr = rng(c.seed * 17 + i * 101 + 3);
      const aMom = (roleplayMom + productionMom) / 2;
      const aCats = {};
      CATEGORIES.forEach(cat => { aCats[cat.key] = clamp(r1(gauss(acr, aMom + cat.bias * 1.4, 0.4)), 1, 5); });
      const aSorted = CATEGORIES.map(cat => ({ ...cat, val: aCats[cat.key] })).sort((a, b) => b.val - a.val);
      // weeks of attendance detail + roleplay count
      const sessions = 6 + Math.floor(acr() * 10);
      const liveCalls = 12 + Math.floor(acr() * 40);
      const firstName = name.split(" ")[0];
      const g = gradeOf(comp).letter;
      const note = (
        g === "A" ? `${firstName} is graduation-ready and consistently models ${aSorted[0].label.toLowerCase()}. A strong candidate for an accelerated ramp; pair as a peer mentor.`
        : g === "B" ? `${firstName} is on track. ${aSorted[0].label} is a clear strength; tighten ${aSorted[aSorted.length-1].label.toLowerCase()} before handoff and they'll be solid on the floor.`
        : g === "C" ? `${firstName} needs targeted support on ${aSorted[aSorted.length-1].label.toLowerCase()}. Reinforce with focused roleplays; reassess before the next milestone.`
        : `${firstName} is at risk and below threshold on ${aSorted[aSorted.length-1].label.toLowerCase()}. Active coaching plan in place; daily touchpoints recommended.`
      );
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

    // cohort MOM category averages (1–5)
    const cr = rng(c.seed + 99);
    const cats = {};
    CATEGORIES.forEach(cat => { cats[cat.key] = clamp(r1(gauss(cr, momMean + cat.bias, 0.14)), 1, 5); });
    const momAvg = r1(CATEGORIES.reduce((s, cat) => s + cats[cat.key], 0) / CATEGORIES.length);

    // context distributions (counts of graded interactions this week ≈ size×3)
    const interactions = c.size * 3;
    const ccr = rng(c.seed + 51);
    const hard = c.base < 80 ? 0.10 : 0.07;
    const ctx = {
      customerDifficulty: zip(CONTEXT.customerDifficulty.levels, distribute(interactions, [0.70, 0.22, 0.08], ccr)),
      situationDifficulty: zip(CONTEXT.situationDifficulty.levels, distribute(interactions, [0.74, 0.19, hard], ccr)),
      sentiment: zip(CONTEXT.sentiment.levels, distribute(interactions, [clamp(0.30 + (momMean - 4) * 0.2, 0.2, 0.55), 0.45, clamp(0.18 - (momMean - 4) * 0.15, 0.05, 0.3)], ccr)),
    };

    const avg = round(advocates.reduce((s, a) => s + a.composite, 0) / advocates.length);
    const dist = { A: 0, B: 0, C: 0, D: 0 };
    advocates.forEach(a => dist[a.grade]++);
    const tr = rng(c.seed + 7);
    const trend = [];
    let v = c.base - (c.weekOf * 2.2) - 4;
    for (let w = 1; w <= c.weekOf; w++) { v += gauss(tr, 2.6, 1.2); trend.push(clamp(round(v), 55, 99)); }
    trend[trend.length - 1] = avg;

    const sortedCats = CATEGORIES.map(cat => ({ ...cat, val: cats[cat.key] })).sort((a, b) => b.val - a.val);
    return {
      ...c, advocates, cats, momAvg, ctx, interactions, avg, grade: gradeOf(avg), dist, trend,
      strength: sortedCats[0], opportunity: sortedCats[sortedCats.length - 1],
    };
  }
  function zip(levels, counts) {
    const o = {};
    levels.forEach((l, i) => o[l.key] = counts[i]);
    return o;
  }

  const cohorts = COHORTS.map(buildCohort);
  const allAdvocates = cohorts.flatMap(c => c.advocates);

  const totalAdv = allAdvocates.length;
  const programAvg = round(allAdvocates.reduce((s, a) => s + a.composite, 0) / totalAdv);
  const dist = { A: 0, B: 0, C: 0, D: 0 };
  allAdvocates.forEach(a => dist[a.grade]++);
  const pctReady = round(((dist.A + dist.B) / totalAdv) * 100);
  const READINESS_THRESHOLD = 76;
  const atRisk = allAdvocates.filter(a => a.composite < READINESS_THRESHOLD).sort((a, b) => a.composite - b.composite);
  const graduating = cohorts.find(c => c.status === "Graduating");

  // program MOM category averages (1–5)
  const catProgram = CATEGORIES.map(cat => {
    const vals = cohorts.map(c => c.cats[cat.key]);
    return { ...cat, val: r1(vals.reduce((s, v) => s + v, 0) / vals.length) };
  });
  const programMom = r1(catProgram.reduce((s, c) => s + c.val, 0) / catProgram.length);
  const opportunities = [...catProgram].sort((a, b) => a.val - b.val);
  const strengths = [...catProgram].sort((a, b) => b.val - a.val);

  // aggregate context across program → percentages
  function aggCtx(dimKey) {
    const levels = CONTEXT[dimKey].levels;
    const totals = {}; let sum = 0;
    levels.forEach(l => { totals[l.key] = cohorts.reduce((s, c) => s + c.ctx[dimKey][l.key], 0); sum += totals[l.key]; });
    return levels.map(l => ({ ...l, count: totals[l.key], pct: round((totals[l.key] / sum) * 100) }));
  }
  const context = {
    customerDifficulty: aggCtx("customerDifficulty"),
    situationDifficulty: aggCtx("situationDifficulty"),
    sentiment: aggCtx("sentiment"),
  };

  const ptr = rng(424242);
  const programTrend = []; let pv = programAvg - 11;
  for (let w = 1; w <= 6; w++) { pv += gauss(ptr, 1.9, 0.8); programTrend.push(clamp(round(pv), 60, 95)); }
  programTrend[programTrend.length - 1] = programAvg;
  const priorTrend = programTrend.map((x, i) => clamp(round(x - 3 - (5 - i) * 0.4 + gauss(ptr, 0, 1)), 55, 95));

  const momentum = [...allAdvocates].sort((a, b) => b.delta - a.delta).slice(0, 5);

  const cohortName = (id) => cohorts.find(c => c.id === id)?.name || id;
  const cohortById = (id) => cohorts.find(c => c.id === id);
  const advocateById = (id) => allAdvocates.find(a => a.id === id);

  // -- cohort groups (distinct start dates, newest first) for the cohort dropdown --
  const cohortGroups = [...new Set(cohorts.map(c => c.cohortKey))]
    .sort((a, b) => b.localeCompare(a))
    .map(key => {
      const cs = cohorts.filter(c => c.cohortKey === key);
      return { key, label: cs[0].cohortLabel, classes: cs.map(c => c.id), count: cs.length };
    });

  // -- per-level rollups --
  const levelStats = LEVELS.map(level => {
    const cs = cohorts.filter(c => c.level === level);
    const advs = cs.flatMap(c => c.advocates);
    const avg = advs.length ? round(advs.reduce((s, a) => s + a.composite, 0) / advs.length) : 0;
    return { level, classes: cs.length, advocates: advs.length, avg, grade: gradeOf(avg) };
  }).filter(l => l.advocates > 0);

  // -- coaching-plan generator: derive a structured plan from an advocate's MOM scores --
  // mirrors the Streamlit MOM coaching app: focus on weakest criteria, prescribe drills,
  // roleplay scenarios, manager talking points and a 2-week check-in cadence.
  const PLAYBOOK = {
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

  function makePlan(advId) {
    const a = allAdvocates.find(x => x.id === advId);
    if (!a) return null;
    const c = cohorts.find(co => co.id === a.cohort);
    // rank advocate's criteria ascending → focus on the lowest 1–2
    const ranked = CATEGORIES.map(cat => ({ ...cat, val: a.cats[cat.key] })).sort((x, y) => x.val - y.val);
    const primary = ranked[0];
    const secondary = ranked[1].val < 3.6 ? ranked[1] : null;
    const focusKeys = [primary.key, secondary && secondary.key].filter(Boolean);
    const horizon = a.composite < 64 ? "2 weeks · daily touchpoints" : "2 weeks · 3 check-ins";
    return {
      advocate: a, cohort: c,
      generatedAt: "Jun 12, 2026",
      summary: `${a.name.split(" ")[0]} is scoring ${a.composite} (grade ${a.grade}) — below the readiness threshold. The biggest lever is ${PLAYBOOK[primary.key].focus.split(" — ")[0].toLowerCase()}, where ${a.name.split(" ")[0]} averages ${a.cats[primary.key].toFixed(1)}/5 versus a program average of ${catProgram.find(cp => cp.key === primary.key).val.toFixed(1)}.`,
      focusAreas: focusKeys.map(k => ({ key: k, score: a.cats[k], ...PLAYBOOK[k] })),
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

  window.NEST = {
    GRADES, gradeOf, CATEGORIES, CONTEXT, PLAYBOOK, LEVELS,
    cohorts, allAdvocates, cohortName, cohortById, advocateById, makePlan,
    cohortGroups, levelStats,
    totalAdv, programAvg, programGrade: gradeOf(programAvg), programMom,
    dist, pctReady, atRisk, graduating, READINESS_THRESHOLD,
    catProgram, opportunities, strengths, context,
    programTrend, priorTrend, momentum,
    period: "Week of Jun 8 – Jun 12, 2026",
    fmt: { clamp, round, r1, fmtDate },
  };
})();
