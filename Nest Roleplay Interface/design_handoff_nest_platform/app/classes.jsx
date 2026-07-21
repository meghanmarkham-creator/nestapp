// Classes view + class drill-down (roster).
// Exports (to window): ClassesView, ClassDetail.

const _f1 = (v) => Number(v).toFixed(1);

const BackBar = ({ onBack, label }) => (
  <button onClick={onBack} className="no-print" style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 34, padding: "0 14px 0 10px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer", alignSelf: "flex-start" }}>
    <NIcon.back s={16}/> {label}
  </button>
);

// ---- Classes list ----
const ClassesView = ({ onNav, onOpenClass, search, onSearch }) => {
  const N = window.NEST;
  const [cohort, setCohort] = React.useState("all");
  const [level, setLevel] = React.useState("all");

  const cohortOpts = [{ value: "all", label: "All cohorts", hint: `${N.cohorts.length} classes` },
    ...N.cohortGroups.map(g => ({ value: g.key, label: `Cohort · ${g.label}`, hint: `${g.count} ${g.count > 1 ? "classes" : "class"}` }))];
  const levelOpts = [{ value: "all", label: "All levels" },
    ...N.LEVELS.map(l => ({ value: l, label: l, count: N.cohorts.filter(c => c.level === l).length })).filter(o => o.count > 0)];

  const shown = N.cohorts.filter(c => (cohort === "all" || c.cohortKey === cohort) && (level === "all" || c.level === level));

  return (
    <NestShell active="classes" title="Classes" subtitle={`${N.cohorts.length} active training classes`} onNav={onNav} searchValue={search} onSearch={onSearch}
      actions={<Dropdown value={cohort} onChange={setCohort} options={cohortOpts} width={232} align="right" icon={<NIcon.calendar s={16}/>}/>}>
      <Segmented value={level} onChange={setLevel} options={levelOpts}/>
      <Panel pad={0} style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--canvas-muted)" }}>
              {["Class","Level","Cohort start","Status","Week","Advocates","Readiness",""].map((h, i) => (
                <th key={i} style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", textAlign: i >= 4 && i <= 5 ? "center" : "left", padding: "13px 16px", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map(c => (
              <tr key={c.id} onClick={() => onOpenClass(c.id)} className="nest-row" style={{ borderTop: "1px solid var(--border-subtle)", cursor: "pointer" }}>
                <td style={tdC}><div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{c.name}</div><div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", marginTop: 2 }}>{c.loc} · {c.mode}</div></td>
                <td style={tdC}><LevelTag level={c.level}/></td>
                <td style={tdC}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{c.cohortLabel}</span></td>
                <td style={tdC}><StatusBadge status={c.status}/></td>
                <td style={{ ...tdC, textAlign: "center" }}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{c.weekOf}/{c.weeks}</span></td>
                <td style={{ ...tdC, textAlign: "center" }}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{c.size}</span></td>
                <td style={tdC}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><GradePill letter={c.grade.letter} size={30}/><span style={{ font: "var(--body-strong-md)", color: "var(--text-strong)" }}>{c.avg}</span></div></td>
                <td style={{ ...tdC, textAlign: "right" }}><span style={{ color: "var(--icon-default)", display: "inline-flex" }}><NIcon.chevRight s={18}/></span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <EmptyState title="No classes match these filters" sub="Try a different cohort or level."/>}
      </Panel>
    </NestShell>
  );
};

// ---- Class drill-down ----
const ClassDetail = ({ classId, onNav, onBack, onOpenPlan, onOpenAdvocate, onGraduate }) => {
  const N = window.NEST;
  const c = N.cohortById(classId);
  const [sort, setSort] = React.useState({ key: "composite", dir: "desc" });
  if (!c) return null;

  const cols = [
    { key: "composite", label: "Readiness", align: "left" },
    { key: "roleplayMom", label: "Roleplay MOM", align: "center" },
    { key: "productionMom", label: "Production MOM", align: "center" },
    { key: "assessment", label: "Assessment", align: "center" },
    { key: "attendance", label: "Attendance", align: "center" },
  ];
  const sorted = [...c.advocates].sort((a, b) => {
    const d = (a[sort.key] - b[sort.key]) * (sort.dir === "asc" ? 1 : -1);
    return d;
  });
  const toggle = (key) => setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" });

  return (
    <NestShell active="classes" title={c.name} subtitle={`${c.level} · started ${c.cohortLabel} · coach ${c.lead}`} onNav={onNav}
      actions={<>
        <button style={cBtnGhost} onClick={() => onGraduate(c.id)}><NIcon.report s={16}/> {c.status === "Graduating" ? "Graduate class" : "Report cards"}</button>
      </>}>
      <BackBar onBack={onBack} label="All classes"/>

      {/* summary tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
        <SummaryTile label="Class readiness" value={c.avg} sub={`/ 100 · ${c.grade.letter}`} accent={c.grade.fill}/>
        <SummaryTile label="Advocates" value={c.size} sub={`${c.dist.D} at risk`} accent="var(--brand-primary)"/>
        <SummaryTile label="Avg roleplay MOM" value={_f1(avgOf(c.advocates, "roleplayMom"))} sub="/ 5" accent="var(--reference-blue-500)"/>
        <SummaryTile label="Avg production MOM" value={_f1(avgOf(c.advocates, "productionMom"))} sub="/ 5" accent="var(--reference-indigo-500)"/>
        <SummaryTile label="Avg attendance" value={`${Math.round(avgOf(c.advocates, "attendance"))}%`} accent="var(--reference-green-500)"/>
      </div>

      <div className="nest-lower" style={{ gap: 24, alignItems: "start" }}>
        {/* roster */}
        <Panel title="Roster" subtitle="Click an advocate for their detail · sort by any score" pad={0} style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ background: "var(--canvas-muted)" }}>
                  <th style={{ ...thC, textAlign: "left" }}>Advocate</th>
                  {cols.map(col => (
                    <th key={col.key} onClick={() => toggle(col.key)} style={{ ...thC, textAlign: col.align, cursor: "pointer", whiteSpace: "nowrap" }}>
                      {col.label}{sort.key === col.key && <span style={{ marginLeft: 4 }}>{sort.dir === "asc" ? "▲" : "▼"}</span>}
                    </th>
                  ))}
                  <th style={thC}></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(a => (
                  <tr key={a.id} className="nest-row" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td style={tdC}>
                      <div onClick={() => onOpenAdvocate(a.id)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                        <Avatar name={a.name} size={32} grade={a.grade}/>
                        <span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{a.name}</span>
                      </div>
                    </td>
                    <td style={tdC}><div style={{ display: "flex", alignItems: "center", gap: 9 }}><GradePill letter={a.grade} size={26}/><span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{a.composite}</span></div></td>
                    <MomCell v={a.roleplayMom}/>
                    <MomCell v={a.productionMom}/>
                    <td style={{ ...tdC, textAlign: "center" }}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{a.assessment}</span></td>
                    <td style={{ ...tdC, textAlign: "center" }}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{a.attendance}%</span></td>
                    <td style={{ ...tdC, textAlign: "right", whiteSpace: "nowrap" }}>
                      {a.composite < N.READINESS_THRESHOLD
                        ? <button style={cPlanBtn} onClick={() => onOpenPlan(a.id)}><NIcon.coaching s={14}/> Plan</button>
                        : <button style={cViewBtn} onClick={() => onOpenAdvocate(a.id)}>View</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* class insight */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Panel title="Grade mix">
            <DistBar dist={c.dist} total={c.size} showCounts height={12}/>
            <Sparkline data={c.trend} width={220} height={44} color={c.grade.fill}/>
            <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>6-week readiness trend</div>
          </Panel>
          <Panel title="MOM rubric — class average" subtitle="1–5 across coaching criteria">
            <CatBars cats={N.CATEGORIES.map(cat => ({ ...cat, val: c.cats[cat.key] }))} max={5} labelCol={150}/>
          </Panel>
        </div>
      </div>
    </NestShell>
  );
};

const avgOf = (arr, key) => arr.reduce((s, a) => s + a[key], 0) / arr.length;

const MomCell = ({ v }) => (
  <td style={{ padding: "12px 16px", textAlign: "center" }}>
    <span style={{ font: "var(--body-strong-sm)", color: window.momColor(v) }}>{_f1(v)}</span>
  </td>
);

const SummaryTile = ({ label, value, sub, accent }) => (
  <div style={{ background: "var(--canvas-default)", border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-lg)", padding: "16px 18px", position: "relative", overflow: "hidden" }}>
    {accent && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: accent }}/>}
    <div style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
      <span style={{ font: "var(--heading-lg)", fontWeight: 800, color: "var(--text-strong)", lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{sub}</span>}
    </div>
  </div>
);

const tdC = { padding: "12px 16px", verticalAlign: "middle" };
const thC = { font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", padding: "13px 16px", fontWeight: 600 };
const cBtnGhost = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 18px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer" };
const cPlanBtn = { display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 13px", borderRadius: 999, border: "1px solid var(--brand-primary)", background: "var(--background-primary-subtle)", color: "var(--text-primary)", font: "var(--label-sm)", cursor: "pointer" };
const cViewBtn = { display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 15px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-sm)", cursor: "pointer" };

Object.assign(window, { ClassesView, ClassDetail, BackBar, SummaryTile, avgOf });
