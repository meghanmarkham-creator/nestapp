// Dashboard B — "Cohort cards": readiness hero + per-class cards.
const DashB = () => {
  const N = window.NEST;

  const statusTone = (s) => s === "Graduating" ? "success" : s === "Onboarding" ? "informational" : "muted";

  return (
    <NestShell
      active="dash"
      title="Class readiness"
      subtitle={N.period}
      actions={<>
        <button style={segB}>This period <NIcon.chevDown s={15}/></button>
        <button style={btnPrimaryB}>Export report</button>
      </>}
    >
      {/* Hero band */}
      <section style={{
        background: "var(--brand-secondary)", borderRadius: "var(--border-radius-xl)",
        padding: "28px 32px", color: "#fff",
        display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 36, alignItems: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -40, top: -60, width: 280, height: 280, borderRadius: 999, background: "radial-gradient(circle, rgba(34,139,230,.28), transparent 70%)" }}/>
        <div style={{ display: "grid", placeItems: "center" }}>
          <DonutInverse value={N.programAvg} grade={N.programGrade}/>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ font: "var(--label-sm)", color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".08em" }}>Program readiness</div>
          <div style={{ font: "var(--heading-xl)", fontWeight: 800, margin: "6px 0 10px", letterSpacing: "-.01em", lineHeight: 1.2, maxWidth: 540 }}>
            {N.pctReady}% on track to graduate ready
          </div>
          <p style={{ font: "var(--body-regular-md)", color: "rgba(255,255,255,.78)", margin: 0, maxWidth: 520 }}>
            Readiness is up <strong style={{ color: "#fff" }}>+2.4 pts</strong> week-over-week across {N.cohorts.length} active classes. <strong style={{ color: "#fff" }}>{N.dist.D} advocates</strong> need coaching support before their next assessment.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <HeroChip k="On track" v={`${N.dist.A + N.dist.B}`} dot="var(--reference-green-400)"/>
            <HeroChip k="Needs support" v={`${N.dist.C}`} dot="var(--reference-yellow-400)"/>
            <HeroChip k="At risk" v={`${N.dist.D}`} dot="var(--reference-red-400)"/>
            <HeroChip k="Graduating wk" v={`${N.graduating.size}`} dot="var(--brand-tertiary)"/>
          </div>
        </div>
        <div style={{ position: "relative", width: 220, display: "flex", flexDirection: "column", gap: 14, borderLeft: "1px solid rgba(255,255,255,.16)", paddingLeft: 28 }}>
          <div style={{ font: "var(--label-xs)", color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: ".06em" }}>Top opportunity</div>
          <div>
            <div style={{ font: "var(--heading-sm)", fontWeight: 700 }}>{N.opportunities[0].label}</div>
            <div style={{ font: "var(--body-regular-sm)", color: "rgba(255,255,255,.7)", marginTop: 2 }}>Program avg {N.opportunities[0].val} · lowest rubric category</div>
          </div>
          <div style={{ font: "var(--label-xs)", color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 6 }}>Strongest</div>
          <div>
            <div style={{ font: "var(--heading-sm)", fontWeight: 700 }}>{N.strengths[0].label}</div>
            <div style={{ font: "var(--body-regular-sm)", color: "rgba(255,255,255,.7)", marginTop: 2 }}>Program avg {N.strengths[0].val}</div>
          </div>
        </div>
      </section>

      {/* Cohort cards */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ font: "var(--heading-sm)", color: "var(--text-strong)", margin: 0 }}>Active classes</h2>
        <div style={{ display: "flex", gap: 10 }}>
          {["All locations","Tempe","Phoenix","Remote"].map((f, i) => (
            <Chip key={f} shape="pill" selected={i === 0}>{f}</Chip>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {N.cohorts.map(c => (
          <article key={c.id} style={cardB}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ font: "var(--heading-sm)", color: "var(--text-strong)" }}>{c.name}</div>
                <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", marginTop: 3 }}>{c.loc} · {c.mode}</div>
              </div>
              <TextBadge priority={statusTone(c.status)} variant="subtle">{c.status}</TextBadge>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
              <GradePill letter={c.grade.letter} size={46}/>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ font: "var(--heading-lg)", fontWeight: 800, color: "var(--text-strong)", lineHeight: 1 }}>{c.avg}</span>
                  <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>/ 100</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, font: "var(--body-strong-xs)", color: "var(--text-success)", marginTop: 4 }}>
                  <NIcon.up s={13}/> +{c.advocates[0] ? Math.max(1, Math.round(c.avg - c.trend[Math.max(0, c.trend.length - 2)])) : 1} pts this week
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}><Sparkline data={c.trend} width={70} height={32} color={c.grade.fill}/></div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", font: "var(--body-regular-xs)", color: "var(--text-weak)", marginBottom: 7 }}>
                <span>Week {c.weekOf} of {c.weeks}</span><span>{c.size} advocates</span>
              </div>
              <DistBar dist={c.dist} total={c.size} showCounts height={10}/>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 4 }}>
              <MiniStat tone="up" label="Strength" value={c.strength.label} score={c.strength.val}/>
              <MiniStat tone="down" label="Focus" value={c.opportunity.label} score={c.opportunity.val}/>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: 14, marginTop: 2 }}>
              <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>Coach: {c.lead}</span>
              <a style={{ font: "var(--body-link-sm)", color: "var(--text-primary)", display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" }}>View class <NIcon.chevDown s={14} style={{ transform: "rotate(-90deg)" }}/></a>
            </div>
          </article>
        ))}
      </div>
    </NestShell>
  );
};

const DonutInverse = ({ value, grade }) => {
  const size = 152, stroke = 15, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={grade.fill} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div style={{ font: "var(--heading-3xl)", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{value}</div>
          <div style={{ font: "var(--label-sm)", color: "rgba(255,255,255,.85)", fontWeight: 700, marginTop: 4 }}>Grade {grade.letter}</div>
        </div>
      </div>
    </div>
  );
};

const HeroChip = ({ k, v, dot }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.08)", borderRadius: 999, padding: "7px 14px" }}>
    <span style={{ width: 9, height: 9, borderRadius: 999, background: dot }}/>
    <span style={{ font: "var(--body-strong-sm)", color: "#fff" }}>{v}</span>
    <span style={{ font: "var(--body-regular-sm)", color: "rgba(255,255,255,.7)" }}>{k}</span>
  </div>
);

const MiniStat = ({ tone, label, value, score }) => (
  <div style={{ background: "var(--canvas-muted)", borderRadius: 10, padding: "10px 12px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5, font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".04em" }}>
      <span style={{ color: tone === "up" ? "var(--text-success)" : "var(--text-warning)" }}>{tone === "up" ? <NIcon.up s={12}/> : <NIcon.down s={12}/>}</span>{label}
    </div>
    <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
    <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>avg {score}</div>
  </div>
);

const cardB = { background: "var(--canvas-default)", border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-lg)", padding: 20, display: "flex", flexDirection: "column", gap: 16 };
const segB = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer" };
const btnPrimaryB = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 20px", borderRadius: 999, border: "none", background: "var(--background-primary)", color: "var(--text-inverse)", font: "var(--label-md)", cursor: "pointer" };

window.DashB = DashB;
