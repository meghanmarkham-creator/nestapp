// Coaching tab — all coaching logs per class/advocate. Search by advocate,
// pull AI recommendations, log coaching + mark complete (green border),
// sort by completed/incomplete, filter by class/cohort/trainer.
// Priority (pink) coachings = release reviews auto-assigned to Shelby Gary.
// Exports (to window): CoachingBoard, LogCoachingPanel.

const CANNED_LOG = "Reviewed recent calls together and modeled the target behavior in a live roleplay. Advocate engaged well and showed immediate improvement. Agreed on a follow-up practice set before the next assessment.";

const buildCoachingList = (N, S) => {
  const all = [...N.baseCoachings, ...N.extraSamples, ...S.extraCoachings];
  // de-dupe by id (store entries win)
  const seen = new Set(); const out = [];
  all.forEach(r => { if (!seen.has(r.id)) { seen.add(r.id); out.push(r); } });
  return out.map(rec => {
    const a = N.advocateById(rec.advId);
    const c = a ? N.cohortById(a.cohort) : null;
    const classroomTrainer = rec.trainerId || (c && c.trainerId) || null;
    const log = S.logs[rec.id];
    let status, notes, completedAt, coachId, strengths, opportunities;
    if (log) {
      status = log.status;
      notes = log.notes || "";
      completedAt = log.completedAt;
      coachId = log.coachId || rec.assigneeId || classroomTrainer;
      strengths = log.strengths || [];
      opportunities = log.opportunities || [];
    } else if (rec.defaultComplete && a) {
      // synthesize a plausible completed log from the advocate's profile
      status = "complete"; notes = CANNED_LOG; completedAt = rec.date;
      coachId = classroomTrainer;
      strengths = [{ key: a.strength.key, note: `Reinforced strong ${a.strength.label.toLowerCase()} — kept modeling it on live calls.` }];
      opportunities = [{ key: a.opportunity.key, note: `Worked through ${a.opportunity.label.toLowerCase()}; set a practice set before next assessment.` }];
    } else {
      status = "incomplete"; notes = ""; completedAt = null;
      coachId = rec.assigneeId || classroomTrainer; strengths = []; opportunities = [];
    }
    return { ...rec, status, notes, completedAt, coachId, classroomTrainer, strengths, opportunities, advocate: a, cohort: c };
  }).filter(r => r.advocate);
};

const CoachingBoard = ({ onNav, onOpenPlan, onOpenAdvocate, search, onSearch }) => {
  const N = window.NEST;
  const store = window.useStore();
  const S = store.get();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [filterBy, setFilterBy] = React.useState("all");   // all | class:<id> | trainer:<id> | level:<lvl>
  const [logFor, setLogFor] = React.useState(null);

  let list = buildCoachingList(N, S);
  if (q) list = list.filter(r => r.advocate.name.toLowerCase().includes(q.toLowerCase()));
  if (status !== "all") list = list.filter(r => r.status === status);
  if (filterBy.startsWith("class:")) list = list.filter(r => r.cohort && r.cohort.id === filterBy.slice(6));
  if (filterBy.startsWith("trainer:")) list = list.filter(r => r.trainerId === filterBy.slice(8) || r.assigneeId === filterBy.slice(8));
  if (filterBy.startsWith("level:")) list = list.filter(r => r.cohort && r.cohort.level === filterBy.slice(6));
  // priority first, then incomplete, then by date recency (kept simple)
  list.sort((a, b) => (b.priority - a.priority) || (a.status === "complete") - (b.status === "complete"));

  const counts = buildCoachingList(N, S).reduce((acc, r) => { acc[r.status]++; if (r.priority && r.status !== "complete") acc.priority++; return acc; }, { complete: 0, incomplete: 0, priority: 0 });

  const filterOpts = [
    { value: "all", label: "All classes & trainers" },
    ...N.LEVELS.map(l => ({ value: `level:${l}`, label: `Level · ${l}` })),
    ...N.cohorts.map(c => ({ value: `class:${c.id}`, label: `Class · ${c.name}` })),
    ...N.TRAINERS.filter(t => N.classesOfTrainer(t.id).length || t.role).map(t => ({ value: `trainer:${t.id}`, label: `Trainer · ${t.name}` })),
  ];

  return (
    <NestShell active="coaching" title="Coaching" subtitle="Coaching plans, logs and 1:1s across every class" onNav={onNav} searchValue={search} onSearch={onSearch}
      actions={<Dropdown value={filterBy} onChange={setFilterBy} options={filterOpts} width={240} align="right" icon={<NIcon.filter s={16}/>}/>}>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16 }}>
        <SummaryTile label="Incomplete" value={counts.incomplete} sub="need action" accent="var(--reference-yellow-500)"/>
        <SummaryTile label="Completed" value={counts.complete} accent="var(--reference-green-500)"/>
        <SummaryTile label="Priority — release" value={counts.priority} sub="Shelby Gary" accent="var(--reference-pink-500)"/>
        <SummaryTile label="Total logged" value={counts.complete + counts.incomplete} accent="var(--brand-primary)"/>
      </div>

      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", width: 300, maxWidth: "100%" }}>
          <NIcon.search s={18}/>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by advocate name" style={{ border: "none", outline: "none", background: "transparent", font: "var(--body-regular-sm)", width: "100%" }}/>
        </div>
        <Segmented value={status} onChange={setStatus} options={[
          { value: "all", label: "All" },
          { value: "incomplete", label: "Incomplete", count: counts.incomplete },
          { value: "complete", label: "Completed", count: counts.complete },
        ]}/>
      </div>

      {/* cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
        {list.map(r => (
          <CoachingCard key={r.id} rec={r} onOpenPlan={onOpenPlan} onOpenAdvocate={onOpenAdvocate} onLog={() => setLogFor(r)}/>
        ))}
      </div>
      {list.length === 0 && <Panel><EmptyState title="No coachings match" sub="Adjust the search, status, or class/trainer filter."/></Panel>}

      {logFor && <LogCoachingPanel rec={logFor} onClose={() => setLogFor(null)}/>}
    </NestShell>
  );
};

const catByKey = (key) => window.NEST.CATEGORIES.find(c => c.key === key);

const ValueLine = ({ tone, catKey, note }) => {
  const cat = catByKey(catKey);
  if (!cat) return null;
  const up = tone === "up";
  return (
    <div style={{ background: up ? "var(--background-success-subtle)" : "var(--background-warning-subtle)", borderRadius: 8, padding: "9px 11px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: up ? "var(--reference-green-500)" : "var(--reference-yellow-500)", flexShrink: 0 }}/>
        <span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{cat.label}</span>
        <span style={{ font: "var(--label-xs)", fontWeight: 700, color: up ? "var(--text-success)" : "var(--text-warning)", textTransform: "uppercase", letterSpacing: ".03em", marginLeft: "auto" }}>{up ? "Strength" : "Focus"}</span>
      </div>
      {note && <div style={{ font: "var(--body-regular-sm)", color: "var(--text-default)", marginTop: 5, lineHeight: 1.45 }}>{note}</div>}
    </div>
  );
};

const CoachingCard = ({ rec, onOpenPlan, onOpenAdvocate, onLog }) => {
  const N = window.NEST;
  const a = rec.advocate, g = N.GRADES[a.grade];
  const complete = rec.status === "complete";
  const priority = rec.priority && !complete;
  const border = complete ? "1.5px solid var(--reference-green-500)" : priority ? "1.5px solid var(--reference-pink-500)" : "1px solid var(--border-subtle)";
  const ring = priority ? "0 0 0 3px var(--background-critical-subtle)" : "none";
  const coachName = rec.coachId ? (N.trainerById(rec.coachId)?.name || "—") : (rec.assignee || "—");
  return (
    <div style={{ background: "var(--canvas-default)", border, boxShadow: ring, borderRadius: "var(--border-radius-lg)", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div onClick={() => onOpenAdvocate(a.id)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", minWidth: 0 }}>
          <Avatar name={a.name} size={38} grade={a.grade}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
            <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>{rec.cohort?.name} · readiness {a.composite}</div>
          </div>
        </div>
        {complete ? <span style={cBadgeDone}><NIcon.check s={13}/> Complete</span>
          : priority ? <span style={cBadgePriority}><NIcon.flag s={12}/> Priority</span>
          : <span style={cBadgeOpen}>Open</span>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>
          <span style={{ color: "var(--icon-default)", display: "inline-flex" }}>{rec.source === "release" ? <NIcon.flag s={15}/> : rec.source === "handoff" ? <NIcon.mail s={15}/> : <NIcon.coaching s={15}/>}</span>
          {rec.kind}
        </div>
        <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>
          {complete ? "Coached by" : "Trainer"}: <span style={{ color: "var(--text-default)" }}>{coachName}</span>
        </div>
        <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>{complete ? `Completed ${rec.completedAt ? new Date(rec.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : rec.date}` : `Created ${rec.date}`}</div>
      </div>

      {/* completed → show only the selected MOM values discussed */}
      {complete && (rec.strengths.length || rec.opportunities.length) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rec.strengths.map(s => <ValueLine key={"s" + s.key} tone="up" catKey={s.key} note={s.note}/>)}
          {rec.opportunities.map(o => <ValueLine key={"o" + o.key} tone="down" catKey={o.key} note={o.note}/>)}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
        {rec.source === "plan" && <button style={cGhostBtn} onClick={() => onOpenPlan(a.id)}><NIcon.spark s={14}/> Recommendations</button>}
        <button style={complete ? cGhostBtn : cPrimaryBtn} onClick={onLog}>
          <NIcon.coaching s={14}/> {complete ? "View log" : "Log coaching"}
        </button>
      </div>
    </div>
  );
};

// ---- Log coaching panel (coach + MOM strengths/opportunities + notes) ----
const LogCoachingPanel = ({ rec, onClose }) => {
  const N = window.NEST;
  const store = window.useStore();
  const a = rec.advocate;
  const complete = rec.status === "complete";

  const [coachId, setCoachId] = React.useState(rec.coachId || rec.classroomTrainer || N.TRAINERS[0].id);
  const [strengths, setStrengths] = React.useState(rec.strengths || []);
  const [opportunities, setOpportunities] = React.useState(rec.opportunities || []);
  const [notes, setNotes] = React.useState(rec.notes || "");

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // coach options: classroom trainers first, then the leaders (Shelby, Shantelle)
  const coachOpts = [
    ...N.TRAINERS.filter(t => !t.role).map(t => ({ value: t.id, label: t.name })),
    ...N.TRAINERS.filter(t => t.role).map(t => ({ value: t.id, label: `${t.name} · ${t.role}` })),
  ];

  const toggle = (list, setList, key) => list.find(x => x.key === key)
    ? setList(list.filter(x => x.key !== key))
    : setList([...list, { key, note: "" }]);
  const setNote = (list, setList, key, note) => setList(list.map(x => x.key === key ? { ...x, note } : x));

  const payload = () => ({ coachId, strengths, opportunities, notes });
  const nothingSelected = !strengths.length && !opportunities.length;

  return (
    <div style={lScrim} onClick={onClose}>
      <div style={lDrawer} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px", borderBottom: "1px solid var(--border-subtle)", background: "var(--canvas-default)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={a.name} size={42} grade={a.grade}/>
            <div>
              <div style={{ font: "var(--heading-sm)", color: "var(--text-strong)" }}>Log coaching · {a.name}</div>
              <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{rec.kind} · {rec.cohort?.name}</div>
            </div>
          </div>
          <button style={lClose} onClick={onClose}><NIcon.x s={18}/></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 22, display: "flex", flexDirection: "column", gap: 20 }}>
          {rec.priority && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--background-critical-subtle)", border: "1px solid var(--reference-pink-500)", borderRadius: 10, padding: "11px 14px", font: "var(--body-regular-sm)", color: "var(--text-default)" }}>
              <span style={{ color: "var(--reference-pink-500)", display: "inline-flex" }}><NIcon.flag s={16}/></span>
              Priority release review — assigned to <strong>{rec.assignee || "Shelby Gary"}</strong>.
            </div>
          )}

          {/* coach selector */}
          <div>
            <div style={lLabel}>Coach conducting the session</div>
            <Dropdown value={coachId} onChange={setCoachId} options={coachOpts} width="100%" align="left"/>
            <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", marginTop: 6 }}>Defaults to {a.name.split(" ")[0]}'s class trainer. Leaders (Shelby Gary, Shantelle Garner) can also be selected.</div>
          </div>

          {/* strengths */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: "var(--reference-green-500)" }}/>
              <span style={lLabel}>Strengths discussed</span>
            </div>
            <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", marginBottom: 10 }}>Select the MOM values you praised and note what you discussed.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {N.CATEGORIES.map(cat => {
                const sel = strengths.find(x => x.key === cat.key);
                return <MomSelectRow key={cat.key} cat={cat} tone="up" selected={!!sel} note={sel?.note || ""}
                  onToggle={() => toggle(strengths, setStrengths, cat.key)}
                  onNote={(v) => setNote(strengths, setStrengths, cat.key, v)}/>;
              })}
            </div>
          </div>

          {/* opportunities */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: "var(--reference-yellow-500)" }}/>
              <span style={lLabel}>Opportunities discussed</span>
            </div>
            <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", marginBottom: 10 }}>Select the MOM values you coached on and note the conversation.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {N.CATEGORIES.map(cat => {
                const sel = opportunities.find(x => x.key === cat.key);
                return <MomSelectRow key={cat.key} cat={cat} tone="down" selected={!!sel} note={sel?.note || ""}
                  onToggle={() => toggle(opportunities, setOpportunities, cat.key)}
                  onNote={(v) => setNote(opportunities, setOpportunities, cat.key, v)}/>;
              })}
            </div>
          </div>

          {/* overall notes */}
          <div>
            <div style={lLabel}>Overall coaching notes</div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did the session go overall? Response, follow-ups, next steps…" rows={5}
              style={{ width: "100%", marginTop: 8, padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border-default)", font: "var(--body-regular-md)", lineHeight: 1.5, outline: "none", resize: "vertical", boxSizing: "border-box" }}/>
          </div>

          {complete && <div style={{ display: "inline-flex", alignItems: "center", gap: 7, font: "var(--body-strong-sm)", color: "var(--text-success)" }}><NIcon.check s={16}/> Marked complete {rec.completedAt ? `on ${new Date(rec.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}</div>}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "16px 22px", borderTop: "1px solid var(--border-subtle)", background: "var(--canvas-default)" }}>
          <button style={lGhost} onClick={() => { store.saveCoachingNotes(rec.id, payload()); window.nestToast("Progress saved"); onClose(); }}>Save progress</button>
          {complete
            ? <button style={lGhost} onClick={() => { store.reopenCoaching(rec.id); window.nestToast("Coaching reopened"); onClose(); }}>Reopen</button>
            : <button style={{ ...lComplete, opacity: nothingSelected ? 0.5 : 1, pointerEvents: nothingSelected ? "none" : "auto" }} onClick={() => { store.completeCoaching(rec.id, payload()); window.nestToast(`Coaching marked complete for ${a.name.split(" ")[0]}`, "success"); onClose(); }}><NIcon.check s={16}/> Mark coaching complete</button>}
        </div>
      </div>
    </div>
  );
};

// one selectable MOM value with an inline note field
const MomSelectRow = ({ cat, tone, selected, note, onToggle, onNote }) => {
  const up = tone === "up";
  const accent = up ? "var(--reference-green-500)" : "var(--reference-yellow-500)";
  return (
    <div style={{ border: selected ? `1.5px solid ${accent}` : "1px solid var(--border-subtle)", borderRadius: 10, background: selected ? (up ? "var(--background-success-subtle)" : "var(--background-warning-subtle)") : "var(--canvas-default)", overflow: "hidden" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "12px 14px", cursor: "pointer" }}>
        <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, border: selected ? "none" : "1.5px solid var(--border-default)", background: selected ? accent : "transparent", color: "#fff", display: "grid", placeItems: "center" }}>
          {selected && <NIcon.check s={14}/>}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{cat.label}</div>
          <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", marginTop: 2 }}>{cat.desc}</div>
        </div>
      </div>
      {selected && (
        <div style={{ padding: "0 14px 12px 45px" }}>
          <textarea value={note} onChange={(e) => onNote(e.target.value)} placeholder={`What did you discuss about ${cat.label.toLowerCase()}?`} rows={2}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-default)", font: "var(--body-regular-sm)", lineHeight: 1.45, outline: "none", resize: "vertical", boxSizing: "border-box", background: "var(--canvas-default)" }}/>
        </div>
      )}
    </div>
  );
};

const cBadgeDone = { display: "inline-flex", alignItems: "center", gap: 5, font: "var(--label-xs)", fontWeight: 700, color: "var(--text-success)", background: "var(--background-success-subtle)", borderRadius: 999, padding: "4px 10px", whiteSpace: "nowrap" };
const cBadgeOpen = { display: "inline-flex", alignItems: "center", font: "var(--label-xs)", fontWeight: 700, color: "var(--text-warning)", background: "var(--background-warning-subtle)", borderRadius: 999, padding: "4px 10px" };
const cBadgePriority = { display: "inline-flex", alignItems: "center", gap: 5, font: "var(--label-xs)", fontWeight: 700, color: "#fff", background: "var(--reference-pink-500)", borderRadius: 999, padding: "4px 10px", whiteSpace: "nowrap" };
const cGhostBtn = { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, height: 38, padding: "0 14px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-sm)", cursor: "pointer" };
const cPrimaryBtn = { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, height: 38, padding: "0 14px", borderRadius: 999, border: "none", background: "var(--background-primary)", color: "#fff", font: "var(--label-sm)", cursor: "pointer" };
const lScrim = { position: "fixed", inset: 0, background: "var(--canvas-overlay, rgba(20,40,60,.55))", display: "flex", justifyContent: "flex-end", zIndex: 70, animation: "cdFade .18s ease" };
const lDrawer = { width: 480, maxWidth: "94vw", height: "100%", background: "var(--canvas-muted)", display: "flex", flexDirection: "column", boxShadow: "-12px 0 40px rgba(13,55,94,.18)", animation: "cdSlide .26s cubic-bezier(.2,.7,.3,1)" };
const lClose = { width: 36, height: 36, borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--icon-default)", display: "grid", placeItems: "center", cursor: "pointer" };
const lLabel = { font: "var(--label-sm)", color: "var(--text-strong)", fontWeight: 600 };
const lGhost = { height: 42, padding: "0 18px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer" };
const lComplete = { display: "inline-flex", alignItems: "center", gap: 7, height: 42, padding: "0 20px", borderRadius: 999, border: "none", background: "var(--background-success)", color: "#fff", font: "var(--label-md)", fontWeight: 700, cursor: "pointer" };

Object.assign(window, { CoachingBoard, LogCoachingPanel, buildCoachingList });
