// Dashboard A — "Operations table": dense, table-led admin view.
const DashA = () => {
  const N = window.NEST;
  const cohortName = (id) => N.cohorts.find(c => c.id === id)?.name || id;

  const Th = ({ children, style }) => (
    <th style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", textAlign: "left", padding: "0 14px 10px", fontWeight: 600, ...style }}>{children}</th>
  );

  return (
    <NestShell
      active="dash"
      title="Readiness dashboard"
      subtitle={N.period}
      actions={<>
        <button style={btnGhostA}><NIcon.filter s={16}/> Filters</button>
        <button style={btnPrimaryA}>Export</button>
      </>}
    >
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        <StatTile label="In training" value={N.totalAdv} sub="advocates" accent="var(--brand-primary)"/>
        <StatTile label="Program readiness" value={N.programAvg} sub={`/ 100 · ${N.programGrade.letter}`} delta="+2.4" deltaDir="up" accent="var(--reference-blue-500)"/>
        <StatTile label="On track (A–B)" value={`${N.pctReady}%`} delta="+5 pts" deltaDir="up" accent="var(--reference-green-500)"/>
        <StatTile label="At risk (D)" value={N.dist.D} sub="advocates" delta="-2" deltaDir="up" accent="var(--reference-red-500)"/>
        <StatTile label="Graduating" value={N.graduating.size} sub="this week" accent="var(--brand-tertiary)"/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.62fr) minmax(0,1fr)", gap: 24, alignItems: "start" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Panel title="Cohort readiness" subtitle="Composite of roleplay + production MOM, assessments and attendance" right={<GradeLegend/>}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <Th>Class</Th>
                  <Th>Program week</Th>
                  <Th>Readiness</Th>
                  <Th style={{ minWidth: 150 }}>Grade mix</Th>
                  <Th style={{ textAlign: "right" }}>6-wk trend</Th>
                </tr>
              </thead>
              <tbody>
                {N.cohorts.map((c, i) => (
                  <tr key={c.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td style={tdA}>
                      <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{c.name}</div>
                      <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", marginTop: 2 }}>{c.loc} · {c.mode}</div>
                    </td>
                    <td style={tdA}>
                      <WeekDots current={c.weekOf} total={c.weeks}/>
                      <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", marginTop: 6 }}>Week {c.weekOf} of {c.weeks} · {c.status}</div>
                    </td>
                    <td style={tdA}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <GradePill letter={c.grade.letter} size={34}/>
                        <span style={{ font: "var(--heading-sm)", fontWeight: 800, color: "var(--text-strong)" }}>{c.avg}</span>
                      </div>
                    </td>
                    <td style={{ ...tdA, minWidth: 150 }}>
                      <DistBar dist={c.dist} total={c.size}/>
                      <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", marginTop: 7 }}>{c.size} advocates</div>
                    </td>
                    <td style={{ ...tdA, textAlign: "right" }}>
                      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <Sparkline data={c.trend} color={c.grade.fill}/>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Program readiness trend" subtitle="Blended weekly average vs. prior class · target 85"
            right={<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Legend swatch="var(--brand-primary)" label="This period"/>
              <Legend swatch="var(--reference-slate-400)" label="Prior period" dashed/>
              <Legend swatch="var(--reference-green-500)" label="Target" dashed/>
            </div>}>
            <TrendChart
              width={632} height={216}
              target={85}
              labels={["W1","W2","W3","W4","W5","W6"]}
              series={[
                { data: N.priorTrend, color: "var(--reference-slate-400)", dashed: true },
                { data: N.programTrend, color: "var(--brand-primary)", fill: true },
              ]}
            />
          </Panel>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Panel title="Trending opportunities" subtitle="Lowest MOM rubric categories across all classes"
            right={<span style={pillTagA}><NIcon.spark s={13}/> Bubble-up</span>}>
            <CatBars cats={N.opportunities.slice(0, 4)}/>
            <div style={{ height: 1, background: "var(--border-subtle)", margin: "2px 0" }}/>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <span style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em" }}>Holding strong</span>
              {N.strengths.slice(0, 2).map(s => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, font: "var(--body-regular-sm)", color: "var(--text-default)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--reference-green-500)" }}/>{s.label}
                  </span>
                  <span style={{ font: "var(--body-strong-sm)", color: "var(--text-success)" }}>{s.val}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="At-risk advocates" subtitle={`${N.atRisk.length} below readiness threshold`}
            right={<a style={linkA}>View all</a>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {N.atRisk.slice(0, 5).map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid var(--border-subtle)" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 999, background: "var(--reference-slate-100)", color: "var(--text-strong)", display: "grid", placeItems: "center", font: "var(--label-xs)", fontWeight: 700, flexShrink: 0 }}>{a.name.split(" ").map(x => x[0]).join("")}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                    <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>{cohortName(a.cohort)} · score {a.composite}</div>
                  </div>
                  <GradePill letter={a.grade} size={26}/>
                  <a style={{ ...linkA, whiteSpace: "nowrap" }}>Coaching plan</a>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </NestShell>
  );
};

const GradeLegend = () => (
  <div style={{ display: "flex", gap: 12 }}>
    {["A","B","C","D"].map(l => (
      <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>
        <span style={{ width: 9, height: 9, borderRadius: 3, background: window.NEST.GRADES[l].fill }}/>
        {l} · {window.NEST.GRADES[l].label}
      </span>
    ))}
  </div>
);
const Legend = ({ swatch, label, dashed }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>
    <span style={{ width: 16, height: 0, borderTop: `2px ${dashed ? "dashed" : "solid"} ${swatch}` }}/>{label}
  </span>
);

const tdA = { padding: "14px 14px", verticalAlign: "middle" };
const btnGhostA = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer" };
const btnPrimaryA = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 20px", borderRadius: 999, border: "none", background: "var(--background-primary)", color: "var(--text-inverse)", font: "var(--label-md)", cursor: "pointer" };
const linkA = { font: "var(--body-link-sm)", color: "var(--text-primary)", cursor: "pointer", textDecoration: "none" };
const pillTagA = { display: "inline-flex", alignItems: "center", gap: 5, font: "var(--label-xs)", fontWeight: 600, color: "var(--text-primary)", background: "var(--background-primary-subtle)", borderRadius: 999, padding: "4px 10px" };

window.DashA = DashA;
