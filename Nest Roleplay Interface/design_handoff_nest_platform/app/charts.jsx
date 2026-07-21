// Nest Readiness — SVG visualization primitives.
// Exports (to window): GradePill, ReadinessDonut, DistBar, Sparkline,
// TrendChart, CatBars, HeatCell, ProgressRing, WeekDots, gradeColor.

const gradeColor = (letter) => (window.NEST.GRADES[letter] || window.NEST.GRADES.D);

// score → continuous color across the A–D ramp (0–100, for readiness heatmaps)
function scoreColor(n) {
  if (n >= 90) return "var(--reference-green-500)";
  if (n >= 85) return "var(--reference-green-400)";
  if (n >= 80) return "var(--reference-blue-400)";
  if (n >= 75) return "var(--reference-yellow-400)";
  if (n >= 70) return "var(--reference-yellow-500)";
  if (n >= 65) return "var(--reference-orange-500)";
  return "var(--reference-red-500)";
}

// MOM score → color on the 1–5 rubric scale
function momColor(v) {
  if (v >= 4.5) return "var(--reference-green-500)";
  if (v >= 4.0) return "var(--reference-green-400)";
  if (v >= 3.5) return "var(--reference-blue-400)";
  if (v >= 3.0) return "var(--reference-yellow-400)";
  if (v >= 2.5) return "var(--reference-yellow-500)";
  if (v >= 2.0) return "var(--reference-orange-500)";
  return "var(--reference-red-500)";
}
const momFmt = (v) => Number(v).toFixed(1);

// -- GradePill: the letter chip --
const GradePill = ({ letter, size = 40, showLabel = false }) => {
  const g = gradeColor(letter);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: 10, flexShrink: 0,
        background: g.subtle, color: g.text,
        display: "grid", placeItems: "center",
        font: "var(--heading-md)", fontWeight: 800,
        fontSize: size * 0.5, lineHeight: 1,
        border: `1.5px solid ${g.fill}`,
      }}>{letter}</div>
      {showLabel && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{g.label}</span>
          <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>{g.range}</span>
        </div>
      )}
    </div>
  );
};

// -- ReadinessDonut: composite score in a ring --
const ReadinessDonut = ({ value, size = 168, stroke = 16, grade }) => {
  const g = grade || window.NEST.gradeOf(value);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = value / 100;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--reference-slate-150)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={g.fill} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div style={{ font: "var(--heading-3xl)", fontWeight: 800, color: "var(--text-strong)", lineHeight: 1 }}>{value}</div>
          <div style={{ font: "var(--label-sm)", color: g.text, fontWeight: 700, marginTop: 4 }}>{g.letter} · {g.label}</div>
        </div>
      </div>
    </div>
  );
};

// -- DistBar: stacked A/B/C/D distribution --
const DistBar = ({ dist, total, height = 12, showCounts = false, inBarCounts = false, gap = 2 }) => {
  const order = ["A", "B", "C", "D"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <div style={{ display: "flex", gap, height, borderRadius: inBarCounts ? 8 : 999, overflow: "hidden", background: "var(--reference-slate-100)" }}>
        {order.map(l => {
          const v = dist[l] || 0;
          if (!v) return null;
          const light = l === "C"; // yellow needs dark text
          return (
            <div key={l} title={`${l}: ${v}`} style={{ flex: v, background: gradeColor(l).fill, display: inBarCounts ? "flex" : "block", alignItems: "center", justifyContent: "center", gap: 4, minWidth: inBarCounts ? 22 : 0 }}>
              {inBarCounts && (
                <span style={{ font: "var(--label-sm)", fontWeight: 800, color: light ? "var(--reference-slate-800)" : "rgba(255,255,255,.98)", lineHeight: 1, whiteSpace: "nowrap" }}>{v}</span>
              )}
            </div>
          );
        })}
      </div>
      {showCounts && (
        <div style={{ display: "flex", gap: 14 }}>
          {order.map(l => (
            <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "var(--body-regular-xs)", color: "var(--text-weak)", whiteSpace: "nowrap" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: gradeColor(l).fill }}/>
              {l}&nbsp;{dist[l] || 0}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// -- Sparkline --
const Sparkline = ({ data, width = 96, height = 30, color = "var(--brand-primary)" }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data) - 2, max = Math.max(...data) + 2;
  const x = (i) => (i / (data.length - 1)) * width;
  const y = (v) => height - ((v - min) / (max - min)) * height;
  const d = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${d} L${width} ${height} L0 ${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <path d={area} fill={color} opacity="0.08"/>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="2.6" fill={color}/>
    </svg>
  );
};

// -- TrendChart: line chart with optional comparison + target --
const TrendChart = ({ series, target, width = 520, height = 200, labels }) => {
  const pad = { t: 16, r: 16, b: 28, l: 30 };
  const w = width - pad.l - pad.r, h = height - pad.t - pad.b;
  const all = series.flatMap(s => s.data);
  const min = Math.min(...all, target || Infinity) - 4;
  const max = Math.max(...all, target || -Infinity) + 4;
  const n = series[0].data.length;
  const x = (i) => pad.l + (i / (n - 1)) * w;
  const y = (v) => pad.t + h - ((v - min) / (max - min)) * h;
  const yTicks = [min, (min + max) / 2, max].map(Math.round);
  return (
    <svg width={width} height={height} style={{ display: "block", maxWidth: "100%" }}>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="var(--reference-slate-100)" strokeWidth="1"/>
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" style={{ font: "var(--body-regular-xs)", fill: "var(--text-weak)" }}>{t}</text>
        </g>
      ))}
      {target != null && (
        <line x1={pad.l} x2={width - pad.r} y1={y(target)} y2={y(target)} stroke="var(--reference-green-500)" strokeWidth="1.5" strokeDasharray="4 4"/>
      )}
      {series.map((s, si) => {
        const d = s.data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
        return (
          <g key={si}>
            {s.fill && <path d={`${d} L${x(n-1)} ${pad.t+h} L${x(0)} ${pad.t+h} Z`} fill={s.color} opacity="0.07"/>}
            <path d={d} fill="none" stroke={s.color} strokeWidth={s.dashed ? 2 : 2.5} strokeDasharray={s.dashed ? "5 5" : undefined} strokeLinecap="round" strokeLinejoin="round"/>
            {!s.dashed && s.data.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="var(--canvas-default)" stroke={s.color} strokeWidth="2"/>)}
          </g>
        );
      })}
      {labels && labels.map((l, i) => (
        <text key={i} x={x(i)} y={height - 8} textAnchor="middle" style={{ font: "var(--body-regular-xs)", fill: "var(--text-weak)" }}>{l}</text>
      ))}
    </svg>
  );
};

// -- CatBars: horizontal category score bars. max=5 → MOM scale, max=100 → percent --
const CatBars = ({ cats, width, max = 5, labelCol = 148 }) => {
  const isMom = max === 5;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: width || "100%" }}>
      {cats.map(cat => {
        const pct = (cat.val / max) * 100;
        return (
          <div key={cat.key} style={{ display: "grid", gridTemplateColumns: `${labelCol}px 1fr 40px`, alignItems: "center", gap: 12 }}>
            <span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cat.label}</span>
            <div style={{ height: 8, borderRadius: 999, background: "var(--reference-slate-100)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: isMom ? momColor(cat.val) : scoreColor(cat.val), borderRadius: 999 }}/>
            </div>
            <span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)", textAlign: "right" }}>{isMom ? momFmt(cat.val) : cat.val}</span>
          </div>
        );
      })}
    </div>
  );
};

// -- ContextBar: stacked categorical distribution (customer/situation difficulty, sentiment) --
const ContextBar = ({ label, levels, height = 10 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{label}</span>
    </div>
    <div style={{ display: "flex", gap: 2, height, borderRadius: 999, overflow: "hidden", background: "var(--reference-slate-100)" }}>
      {levels.map(l => l.pct > 0 && <div key={l.key} title={`${l.label}: ${l.pct}%`} style={{ flex: l.pct, background: l.color }}/>)}
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {levels.map(l => (
        <span key={l.key} style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color }}/>{l.label}&nbsp;{l.pct}%
        </span>
      ))}
    </div>
  </div>
);

// -- HeatCell: a colored tile for grids/matrices --
const HeatCell = ({ value, size = 30, radius = 6, label, title, onColorText }) => {
  const bg = scoreColor(value);
  return (
    <div title={title} style={{
      width: size, height: size, borderRadius: radius, background: bg,
      display: "grid", placeItems: "center", cursor: "default",
      font: "var(--label-xs)", fontWeight: 700,
      color: value >= 78 ? "rgba(255,255,255,.96)" : "var(--reference-slate-800)",
    }}>{label}</div>
  );
};

// -- ProgressRing: small week-progress ring --
const WeekDots = ({ current, total }) => (
  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} style={{
        width: i < current ? 18 : 8, height: 8, borderRadius: 999,
        background: i < current ? "var(--brand-primary)" : "var(--reference-slate-200)",
        transition: "all .2s",
      }}/>
    ))}
  </div>
);

Object.assign(window, {
  GradePill, ReadinessDonut, DistBar, Sparkline, TrendChart, CatBars, ContextBar, HeatCell, WeekDots,
  gradeColor, scoreColor, momColor, momFmt,
});
