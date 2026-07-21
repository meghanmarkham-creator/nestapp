// Dashboard C — "Readiness map": advocate tile grid + rubric heatmap matrix.
const DashC = () => {
  const N = window.NEST;
  const shortName = (n) => n.replace("Nest ", "");

  return (
    <NestShell
      active="dash"
      title="Readiness map"
      subtitle={N.period}
      actions={<>
        <button style={segC}><NIcon.filter s={16}/> All classes <NIcon.chevDown s={15}/></button>
        <button style={btnPrimaryC}>Export</button>
      </>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "296px minmax(0,1fr)", gap: 24, alignItems: "start" }}>
        {/* Left rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 0 }}>
          <Panel title="Readiness index">
            <div style={{ display: "grid", placeItems: "center", paddingTop: 4 }}>
              <ReadinessDonut value={N.programAvg} grade={N.programGrade} size={172} stroke={16}/>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, font: "var(--body-strong-sm)", color: "var(--text-success)" }}>
              <NIcon.up s={15}/> +2.4 pts <span style={{ color: "var(--text-weak)", fontWeight: 400 }}>vs last week</span>
            </div>
            <div style={{ height: 1, background: "var(--border-subtle)" }}/>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["A","B","C","D"].map(l => {
                const g = N.GRADES[l], count = N.dist[l], pct = Math.round((count / N.totalAdv) * 100);
                return (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, background: g.subtle, border: `1.5px solid ${g.fill}`, color: g.text, display: "grid", placeItems: "center", font: "var(--label-sm)", fontWeight: 800, flexShrink: 0 }}>{l}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", font: "var(--body-regular-sm)" }}>
                        <span style={{ color: "var(--text-default)" }}>{g.label}</span>
                        <span style={{ color: "var(--text-strong)", fontWeight: 600 }}>{count}</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 999, background: "var(--reference-slate-100)", marginTop: 5, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: g.fill, borderRadius: 999 }}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Momentum" subtitle="Most-improved advocates" right={<NIcon.spark s={16}/>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {N.momentum.map((a, i) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? "1px solid var(--border-subtle)" : "none" }}>
                  <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", width: 16 }}>{i + 1}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                    <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>{shortName(N.cohorts.find(c => c.id === a.cohort).name)}</div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, font: "var(--body-strong-xs)", color: "var(--text-success)" }}><NIcon.up s={12}/>+{a.delta}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Panel title="Advocate readiness map" subtitle="Each tile is one advocate · color shows readiness score" right={<ScaleLegend/>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {N.cohorts.map(c => (
                <div key={c.id} style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 16, alignItems: "center" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <GradePill letter={c.grade.letter} size={18}/>
                      <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>avg {c.avg} · {c.size}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {c.advocates.map(a => (
                      <HeatCell key={a.id} value={a.composite} label={a.grade} size={28} radius={6}
                        title={`${a.name} · ${a.composite} (${a.grade})`}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Rubric performance by class" subtitle="Average MOM category score · spot where coaching moves the needle"
            right={<span style={pillTagC}><NIcon.spark s={13}/> Trend bubble-up</span>}>
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: `186px repeat(${N.cohorts.length}, minmax(78px,1fr)) 92px`, gap: 6, minWidth: 640 }}>
                {/* header */}
                <div/>
                {N.cohorts.map(c => (
                  <div key={c.id} style={{ textAlign: "center", font: "var(--label-xs)", color: "var(--text-weak)", fontWeight: 600, paddingBottom: 4 }}>{shortName(c.name)}</div>
                ))}
                <div style={{ textAlign: "center", font: "var(--label-xs)", color: "var(--text-strong)", fontWeight: 700, paddingBottom: 4 }}>Program</div>

                {/* rows */}
                {N.CATEGORIES.map(cat => {
                  const prog = N.catProgram.find(x => x.key === cat.key).val;
                  return (
                    <React.Fragment key={cat.key}>
                      <div style={{ display: "flex", alignItems: "center", font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{cat.label}</div>
                      {N.cohorts.map(c => {
                        const v = c.cats[cat.key];
                        return <MatrixCell key={c.id} value={v}/>;
                      })}
                      <MatrixCell value={prog} strong/>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </NestShell>
  );
};

const MatrixCell = ({ value, strong }) => (
  <div style={{
    height: 42, borderRadius: 7, background: window.scoreColor(value),
    display: "grid", placeItems: "center",
    font: strong ? "var(--body-strong-sm)" : "var(--body-regular-sm)", fontWeight: strong ? 800 : 600,
    color: value >= 78 ? "rgba(255,255,255,.96)" : "var(--reference-slate-800)",
    outline: strong ? "2px solid var(--brand-secondary)" : "none", outlineOffset: -2,
  }}>{value}</div>
);

const ScaleLegend = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>At risk</span>
    <div style={{ display: "flex", borderRadius: 999, overflow: "hidden", height: 8, width: 120 }}>
      {["var(--reference-red-500)","var(--reference-orange-500)","var(--reference-yellow-500)","var(--reference-blue-400)","var(--reference-green-500)"].map((c, i) => (
        <span key={i} style={{ flex: 1, background: c }}/>
      ))}
    </div>
    <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>Ready</span>
  </div>
);

const segC = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer" };
const btnPrimaryC = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 20px", borderRadius: 999, border: "none", background: "var(--background-primary)", color: "var(--text-inverse)", font: "var(--label-md)", cursor: "pointer" };
const pillTagC = { display: "inline-flex", alignItems: "center", gap: 5, font: "var(--label-xs)", fontWeight: 600, color: "var(--text-primary)", background: "var(--background-primary-subtle)", borderRadius: 999, padding: "4px 10px" };

window.DashC = DashC;
