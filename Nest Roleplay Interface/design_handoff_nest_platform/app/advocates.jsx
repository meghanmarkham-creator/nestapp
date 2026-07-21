// Advocates roster + individual drill-down.
// Exports (to window): AdvocatesView, AdvocateDetail.

const _af1 = (v) => Number(v).toFixed(1);

const AdvocatesView = ({ onNav, onOpenAdvocate, onOpenPlan, search, onSearch }) => {
  const N = window.NEST;
  const [grade, setGrade] = React.useState("all");
  const [level, setLevel] = React.useState("all");

  const gradeOpts = [{ value: "all", label: "All grades" }, ...["A","B","C","D"].map(g => ({ value: g, label: `${g} · ${N.GRADES[g].label}` }))];
  const levelOpts = [{ value: "all", label: "All levels" }, ...N.LEVELS.map(l => ({ value: l, label: l }))];

  const q = (search || "").trim().toLowerCase();
  const rows = N.allAdvocates.filter(a => {
    const c = N.cohortById(a.cohort);
    if (grade !== "all" && a.grade !== grade) return false;
    if (level !== "all" && c.level !== level) return false;
    if (q && !(a.name.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.level.toLowerCase().includes(q))) return false;
    return true;
  }).sort((a, b) => b.composite - a.composite);

  return (
    <NestShell active="advocate" title="Advocates" subtitle={`${N.totalAdv} advocates across ${N.cohorts.length} classes`} onNav={onNav} searchValue={search} onSearch={onSearch}
      actions={<>
        <Dropdown value={level} onChange={setLevel} options={levelOpts} width={150} align="right"/>
        <Dropdown value={grade} onChange={setGrade} options={gradeOpts} width={168} align="right"/>
      </>}>
      <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>
        {rows.length} {rows.length === 1 ? "advocate" : "advocates"}{q ? ` matching “${search}”` : ""}
      </div>
      <Panel pad={0} style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: "var(--canvas-muted)" }}>
                {["Advocate","Class","Level","Readiness","Roleplay MOM","Production MOM","Focus area",""].map((h, i) => (
                  <th key={i} style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", textAlign: i === 3 || (i >= 4 && i <= 5) ? "center" : "left", padding: "13px 16px", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(a => {
                const c = N.cohortById(a.cohort);
                return (
                  <tr key={a.id} className="nest-row" onClick={() => onOpenAdvocate(a.id)} style={{ borderTop: "1px solid var(--border-subtle)", cursor: "pointer" }}>
                    <td style={tdA2}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={a.name} size={32} grade={a.grade}/><span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{a.name}</span></div></td>
                    <td style={tdA2}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{c.name}</span></td>
                    <td style={tdA2}><LevelTag level={c.level}/></td>
                    <td style={{ ...tdA2, textAlign: "center" }}><div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><GradePill letter={a.grade} size={26}/><span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{a.composite}</span></div></td>
                    <td style={{ ...tdA2, textAlign: "center" }}><span style={{ font: "var(--body-strong-sm)", color: window.momColor(a.roleplayMom) }}>{_af1(a.roleplayMom)}</span></td>
                    <td style={{ ...tdA2, textAlign: "center" }}><span style={{ font: "var(--body-strong-sm)", color: window.momColor(a.productionMom) }}>{_af1(a.productionMom)}</span></td>
                    <td style={tdA2}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{a.opportunity.label}</span></td>
                    <td style={{ ...tdA2, textAlign: "right", whiteSpace: "nowrap" }}>
                      {a.composite < N.READINESS_THRESHOLD && <button style={aPlanBtn} onClick={(e) => { e.stopPropagation(); onOpenPlan(a.id); }}><NIcon.coaching s={14}/> Plan</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <EmptyState title="No advocates found" sub="Adjust your search or filters."/>}
      </Panel>
    </NestShell>
  );
};

// ---- individual detail ----
const AdvocateDetail = ({ advId, onNav, onBack, onOpenPlan, onOpenClass }) => {
  const N = window.NEST;
  const a = N.advocateById(advId);
  if (!a) return null;
  const c = N.cohortById(a.cohort);
  const g = N.GRADES[a.grade];
  const components = [
    { label: "Roleplay MOM", val: a.roleplay, weight: 30, mom: a.roleplayMom },
    { label: "Production MOM", val: a.production, weight: 30, mom: a.productionMom },
    { label: "Assessment", val: a.assessment, weight: 25 },
    { label: "Attendance", val: a.attendance, weight: 15 },
  ];

  return (
    <NestShell active="advocate" title={a.name} subtitle={`${c.name} · ${c.level} · started ${c.cohortLabel}`} onNav={onNav}
      actions={<>
        <button style={cBtnGhost} onClick={() => onOpenClass(c.id)}>View class</button>
        <button style={aDetailPrimary} onClick={() => onOpenPlan(a.id)}><NIcon.coaching s={16}/> Generate coaching plan</button>
      </>}>
      <BackBar onBack={onBack} label="Advocates"/>

      <div className="nest-lower" style={{ gap: 24, alignItems: "start" }}>
        {/* left: readiness + breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Panel>
            <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
              <ReadinessDonut value={a.composite} grade={g} size={150} stroke={15}/>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={a.name} size={44} grade={a.grade}/>
                  <div>
                    <div style={{ font: "var(--heading-sm)", color: "var(--text-strong)" }}>{a.name}</div>
                    <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>Readiness grade {a.grade} · {g.label}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                  <KV label="Strength" value={a.strength.label} tone="up"/>
                  <KV label="Opportunity" value={a.opportunity.label} tone="down"/>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Readiness breakdown" subtitle="How the composite score is built">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {components.map(comp => (
                <div key={comp.label} style={{ display: "grid", gridTemplateColumns: "170px 1fr 92px", alignItems: "center", gap: 12 }}>
                  <span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{comp.label} <span style={{ color: "var(--text-weak)" }}>· {comp.weight}%</span></span>
                  <div style={{ height: 8, borderRadius: 999, background: "var(--reference-slate-100)", overflow: "hidden" }}>
                    <div style={{ width: `${comp.val}%`, height: "100%", background: window.scoreColor(comp.val), borderRadius: 999 }}/>
                  </div>
                  <span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)", textAlign: "right" }}>{comp.val}{comp.mom ? ` · ${_af1(comp.mom)}/5` : "%"}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: 12, marginTop: 2 }}>
                <span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>Composite readiness</span>
                <span style={{ font: "var(--body-strong-md)", color: g.text }}>{a.composite} · {a.grade}</span>
              </div>
            </div>
          </Panel>
        </div>

        {/* right: MOM detail + note + activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Panel title="MOM rubric detail" subtitle="Coaching criteria · 1–5">
            <CatBars cats={N.CATEGORIES.map(cat => ({ ...cat, val: a.cats[cat.key] }))} max={5} labelCol={150}/>
          </Panel>
          <Panel title="Activity">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <KV label="Roleplay sessions" value={a.sessions}/>
              <KV label="Live calls scored" value={a.liveCalls}/>
              <KV label="Attendance" value={`${a.attendance}%`}/>
              <KV label="Sessions missed" value={a.missed}/>
            </div>
          </Panel>
          <Panel title="Trainer notes" right={<span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>Auto-summary</span>}>
            <p style={{ margin: 0, font: "var(--body-regular-md)", color: "var(--text-default)", lineHeight: 1.55 }}>{a.note}</p>
          </Panel>
        </div>
      </div>
    </NestShell>
  );
};

const KV = ({ label, value, tone }) => (
  <div style={{ background: "var(--canvas-muted)", borderRadius: 10, padding: "10px 13px", minWidth: 130, flex: 1 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5, font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".04em" }}>
      {tone && <span style={{ color: tone === "up" ? "var(--text-success)" : "var(--text-warning)", display: "inline-flex" }}>{tone === "up" ? <NIcon.up s={12}/> : <NIcon.down s={12}/>}</span>}{label}
    </div>
    <div style={{ font: "var(--body-strong-md)", color: "var(--text-strong)", marginTop: 4 }}>{value}</div>
  </div>
);

const tdA2 = { padding: "12px 16px", verticalAlign: "middle" };
const aPlanBtn = { display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 13px", borderRadius: 999, border: "1px solid var(--brand-primary)", background: "var(--background-primary-subtle)", color: "var(--text-primary)", font: "var(--label-sm)", cursor: "pointer" };
const aDetailPrimary = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 18px", borderRadius: 999, border: "none", background: "var(--background-primary)", color: "#fff", font: "var(--label-md)", cursor: "pointer" };

Object.assign(window, { AdvocatesView, AdvocateDetail, KV });
