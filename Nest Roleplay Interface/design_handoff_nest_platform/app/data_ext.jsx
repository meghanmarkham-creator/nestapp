// Nest — data extensions layered onto window.NEST.
// Trainers roster, trainer statuses, AI-efficiency call records, base coaching
// records, ACS transcript samples, and trainer-trend analysis. Deterministic.

(() => {
  const N = window.NEST;
  const round = (n) => Math.round(n);
  const r1 = (n) => Math.round(n * 10) / 10;
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---- Trainers (visually distinct from advocates: navy identity) ----
  const TRAINERS = [
    { id: "t-calloway", name: "Rachel Calloway", short: "R. Calloway", email: "rachel.calloway@carvana.com", tenure: "3.5 yrs", home: "Tempe, AZ" },
    { id: "t-okafor",   name: "Marcus Okafor",   short: "M. Okafor",   email: "marcus.okafor@carvana.com",   tenure: "2 yrs",   home: "Phoenix, AZ" },
    { id: "t-flynn",    name: "Aisha Flynn",     short: "A. Flynn",    email: "aisha.flynn@carvana.com",     tenure: "4 yrs",   home: "Tempe, AZ" },
    { id: "t-pruitt",   name: "Jordan Pruitt",   short: "J. Pruitt",   email: "jordan.pruitt@carvana.com",   tenure: "1.5 yrs", home: "Remote" },
    { id: "t-beckett",  name: "Sam Beckett",     short: "S. Beckett",  email: "sam.beckett@carvana.com",     tenure: "5 yrs",   home: "Atlanta, GA" },
    { id: "t-marsh",    name: "Dana Marsh",      short: "D. Marsh",    email: "dana.marsh@carvana.com",      tenure: "2.5 yrs", home: "Remote" },
    { id: "t-vance",    name: "Tara Vance",      short: "T. Vance",    email: "tara.vance@carvana.com",      tenure: "3 yrs",   home: "Austin, TX" },
    { id: "t-ortiz",    name: "Luis Ortiz",      short: "L. Ortiz",    email: "luis.ortiz@carvana.com",      tenure: "1 yr",    home: "Phoenix, AZ" },
    { id: "t-webb",     name: "Kira Webb",       short: "K. Webb",     email: "kira.webb@carvana.com",       tenure: "6 yrs",   home: "Tempe, AZ" },
    { id: "t-gary",     name: "Shelby Gary",     short: "S. Gary",     email: "shelby.gary@carvana.com",     tenure: "7 yrs",   home: "Tempe, AZ", role: "Team Lead" },
    { id: "t-garner",   name: "Shantelle Garner", short: "S. Garner",  email: "shantelle.garner@carvana.com", tenure: "8 yrs",  home: "Tempe, AZ", role: "Team Lead" },
  ];
  const trainerByShort = {}; TRAINERS.forEach(t => trainerByShort[t.short] = t);
  const trainerById = (id) => TRAINERS.find(t => t.id === id) || null;
  // attach trainerId to each cohort (by matching lead short-name)
  N.cohorts.forEach(c => { c.trainerId = (trainerByShort[c.lead] || {}).id || null; });

  const TRAINER_STATUSES = [
    { key: "training",    label: "In training",    color: "var(--reference-blue-500)" },
    { key: "production",  label: "In production",  color: "var(--reference-green-500)" },
    { key: "assessments", label: "Assessments",    color: "var(--reference-indigo-500)" },
    { key: "coaching",    label: "Coaching",       color: "var(--reference-orange-500)" },
    { key: "meeting",     label: "Meeting",        color: "var(--reference-violet-500)" },
    { key: "admin",       label: "Admin time",     color: "var(--reference-slate-400)" },
  ];
  const defaultTrainerStatus = (id) => {
    const seed = id.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
    return TRAINER_STATUSES[seed % TRAINER_STATUSES.length].key;
  };

  // classes a trainer currently owns (base cohorts)
  const classesOfTrainer = (trainerId) => N.cohorts.filter(c => c.trainerId === trainerId);

  // ---- Trainer trend analysis (AI insight) ----
  const trainerInsights = (trainerId) => {
    const classes = classesOfTrainer(trainerId);
    if (!classes.length) return null;
    // recurring weak category across their classes
    const catTotals = {}; N.CATEGORIES.forEach(cat => catTotals[cat.key] = []);
    classes.forEach(c => N.CATEGORIES.forEach(cat => catTotals[cat.key].push(c.cats[cat.key])));
    const catAvgs = N.CATEGORIES.map(cat => ({ ...cat, val: r1(catTotals[cat.key].reduce((s, v) => s + v, 0) / classes.length) }));
    const weakest = [...catAvgs].sort((a, b) => a.val - b.val)[0];
    const weakInHowMany = classes.filter(c => {
      const sorted = N.CATEGORIES.map(cat => ({ key: cat.key, val: c.cats[cat.key] })).sort((a, b) => a.val - b.val);
      return sorted[0].key === weakest.key;
    }).length;
    // trainer avg vs program avg
    const advs = classes.flatMap(c => c.advocates);
    const avg = round(advs.reduce((s, a) => s + a.composite, 0) / advs.length);
    const gap = avg - N.programAvg;
    return { classes: classes.length, advocates: advs.length, avg, gap, catAvgs, weakest, weakInHowMany };
  };

  // trainer ranking (by avg readiness of their classes)
  const trainerRanking = () => TRAINERS.filter(t => classesOfTrainer(t.id).length).map(t => {
    const ins = trainerInsights(t.id);
    return { trainer: t, avg: ins.avg, classes: ins.classes, advocates: ins.advocates, weakest: ins.weakest };
  }).sort((a, b) => b.avg - a.avg);

  // ---- AI Efficiency: call records ----
  // Generate recent scored calls; some cut off <3min, some with failed MOM.
  const SCENARIO = ["Delivery reschedule", "Trade-in valuation", "Financing question", "Doc upload help", "Title & registration", "Warranty claim", "Cancellation", "Payment update", "Delivery status", "Buyback inquiry"];
  const calls = [];
  const cr = rng(90210);
  N.allAdvocates.forEach((a, idx) => {
    const n = 2 + Math.floor(cr() * 3); // 2–4 recent calls each
    for (let k = 0; k < n; k++) {
      const durationSec = Math.floor(60 + cr() * 900); // 1–16 min
      const cutoff = durationSec < 180 && cr() < 0.62; // ended under 3 min, abruptly
      const failedMom = !cutoff && cr() < 0.05;        // MOM missing/failed
      const scored = !cutoff && !failedMom;
      const mom = scored ? r1(Math.max(1, Math.min(5, a.roleplayMom + (cr() - 0.5) * 1.2))) : null;
      const daysAgo = Math.floor(cr() * 6);
      const d = new Date("2026-06-12T00:00:00"); d.setDate(d.getDate() - daysAgo);
      calls.push({
        id: `call-${a.id}-${k}`, advId: a.id, scenario: SCENARIO[(idx + k) % SCENARIO.length],
        durationSec, cutoff, failedMom, scored, mom,
        date: N.fmt.fmtDate(d),
        acsId: `ACS-${(100000 + Math.floor(cr() * 899999))}`,
        endReason: cutoff ? (cr() < 0.5 ? "Customer disconnected" : "Dropped — no resolution") : "Completed",
      });
    }
  });
  const cutoffCalls = calls.filter(c => c.cutoff).sort((a, b) => a.durationSec - b.durationSec);
  const failedCalls = calls.filter(c => c.failedMom);

  const fmtDur = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // A mock ACS transcript for the preview modal
  const transcriptFor = (call) => {
    const a = N.advocateById(call.advId);
    const first = a.name.split(" ")[0];
    const lines = [
      { who: "Customer", t: "Hi, I'm calling about my delivery — it was supposed to be today." },
      { who: "Advocate", t: `Thanks for reaching out, this is ${first} with Carvana. Let me pull that up for you.` },
      { who: "Customer", t: "I've already waited a week, this is really frustrating." },
    ];
    if (call.cutoff) lines.push({ who: "System", t: `Call ended at ${fmtDur(call.durationSec)} — ${call.endReason}. Transcript below the 3-minute scoring threshold.` });
    else { lines.push({ who: "Advocate", t: "I completely understand, and I'm sorry for the wait. Here's exactly what I can do…" }); lines.push({ who: "Customer", t: "Okay, that works. Thank you." }); }
    return lines;
  };

  // ---- Base coaching records ----
  // One coaching plan per at-risk advocate; pre-complete the ones with strong momentum.
  const DATES = ["Jun 12, 2026", "Jun 11, 2026", "Jun 10, 2026", "Jun 9, 2026", "Jun 6, 2026", "Jun 5, 2026"];
  const baseCoachings = N.atRisk.map((a, i) => {
    const c = N.cohortById(a.cohort);
    return {
      id: `cp-${a.id}`, advId: a.id, kind: "Coaching plan", focus: a.opportunity.label,
      trainerId: c.trainerId, date: DATES[i % DATES.length], priority: false, source: "plan",
      defaultComplete: a.delta >= 6, // some already done
    };
  });
  // a few completed 1:1s for on-track advocates (gives the Completed filter content)
  const extraSamples = N.allAdvocates.filter(a => a.composite >= N.READINESS_THRESHOLD && a.delta >= 5).slice(0, 6).map((a, i) => {
    const c = N.cohortById(a.cohort);
    return { id: `s1-${a.id}`, advId: a.id, kind: i % 2 ? "1:1 logged" : "Roleplay reviewed", focus: a.opportunity.label, trainerId: c.trainerId, date: DATES[(i + 2) % DATES.length], priority: false, source: "session", defaultComplete: true };
  });

  Object.assign(N, {
    TRAINERS, trainerById, trainerByShort, TRAINER_STATUSES, defaultTrainerStatus,
    classesOfTrainer, trainerInsights, trainerRanking,
    calls, cutoffCalls, failedCalls, fmtDur, transcriptFor,
    baseCoachings, extraSamples,
    avgCallLen: round(calls.reduce((s, c) => s + c.durationSec, 0) / calls.length),
    scoredCount: calls.filter(c => c.scored).length,
  });
})();
