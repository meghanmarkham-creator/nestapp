// Nest Readiness — app shell (sidebar + top bar) and nav iconography.
// Exports (to window): NestShell, NIcon, StatTile, Panel, SectionTitle.

const NIcon = {
  dash: (p) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  roleplay: (p) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 10h8M8 14h5"/><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>,
  classes: (p) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  advocate: (p) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/></svg>,
  coaching: (p) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  report: (p) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  bell: (p) => <svg width={p.s||20} height={p.s||20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  search: (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  chevDown: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  up: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>,
  down: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7 17 17M17 9v8H9"/></svg>,
  filter: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  flag: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  spark: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M21 7v6h-6"/></svg>,
  dot: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>,
  back: (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  chevRight: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  calendar: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  mail: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>,
  check: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  play: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  mic: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 0 1-14 0M12 19v3"/></svg>,
  download: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  ext: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>,
  x: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  gauge: (p) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 14 8 10"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none"/></svg>,
  assign: (p) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  whistle: (p) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="14" r="6"/><path d="M9 10V8h7l4-3v6a3 3 0 0 1-3 3h-3"/><path d="M9 14h.01"/></svg>,
  archive: (p) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/></svg>,
  plus: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  grip: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>,
  clock: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  alert: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>,
  search2: (p) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  trend: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M21 7v6h-6"/></svg>,
  trophy: (p) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
};

const NAV = [
  { key: "dash", label: "Readiness", icon: "dash" },
  { key: "aieff", label: "AI Efficiency", icon: "gauge" },
  { key: "assign", label: "Class Assignments", icon: "assign" },
  { key: "trainers", label: "Trainers", icon: "whistle" },
  { key: "coaching", label: "Coaching", icon: "coaching" },
  { key: "report", label: "Report cards", icon: "report" },
];

const NestShell = ({ active = "dash", title, subtitle, actions, children, onNav, searchValue = "", onSearch, minHeight = 1000 }) => {
  const reportCount = (window.NEST?.cohorts || []).filter(c => c.status === "Graduating").length;
  return (
    <div style={{ display: "flex", minHeight, background: "var(--canvas-muted)", font: "var(--body-regular-md)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 244, flexShrink: 0, background: "var(--brand-secondary)",
        display: "flex", flexDirection: "column", padding: "24px 16px",
        position: "sticky", top: 0, alignSelf: "flex-start", height: "100vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 24px" }}>
          <img src="assets/logo-horizontal-inverse.svg" alt="Carvana" style={{ height: 24 }}/>
        </div>
        <div style={{ font: "var(--label-xs)", color: "rgba(255,255,255,.5)", letterSpacing: ".1em", textTransform: "uppercase", padding: "0 12px 10px" }}>The Nest · L&amp;E</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(item => {
            const on = item.key === active;
            const Ic = NIcon[item.icon];
            return (
              <div key={item.key} className="nest-nav-item" onClick={() => onNav && onNav(item.key)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
                borderRadius: 10, cursor: "pointer",
                background: on ? "rgba(255,255,255,.12)" : "transparent",
                color: on ? "#fff" : "rgba(255,255,255,.72)",
                font: on ? "var(--body-strong-sm)" : "var(--body-regular-sm)",
              }}>
                <Ic s={20}/>
                <span>{item.label}</span>
                {item.key === "report" && reportCount > 0 && (
                  <span style={{ marginLeft: "auto", background: "var(--brand-tertiary)", color: "var(--brand-secondary)", font: "var(--label-xs)", fontWeight: 700, borderRadius: 999, padding: "1px 7px" }}>{reportCount}</span>
                )}
              </div>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ height: 1, background: "rgba(255,255,255,.12)" }}/>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: "var(--brand-tertiary)", color: "var(--brand-secondary)", display: "grid", placeItems: "center", font: "var(--label-sm)", fontWeight: 800 }}>DR</div>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ font: "var(--body-strong-sm)", color: "#fff" }}>Dana Reyes</div>
              <div style={{ font: "var(--body-regular-xs)", color: "rgba(255,255,255,.55)" }}>Enablement lead</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <header style={{
          height: 76, flexShrink: 0, background: "var(--canvas-default)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", gap: 20, padding: "0 32px",
        }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ font: "var(--heading-md)", color: "var(--text-strong)", margin: 0, letterSpacing: "-.01em" }}>{title}</h1>
            {subtitle && <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", marginTop: 2 }}>{subtitle}</div>}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", borderRadius: 999, border: "1px solid var(--border-default)", color: "var(--text-weak)", background: "var(--canvas-default)", width: 248 }}>
              <NIcon.search s={18}/>
              <input
                value={searchValue}
                onChange={(e) => onSearch && onSearch(e.target.value)}
                placeholder="Search advocates, classes…"
                style={{ border: "none", outline: "none", background: "transparent", font: "var(--body-regular-sm)", color: "var(--text-strong)", width: "100%" }}
              />
            </div>
            <button style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--icon-default)", display: "grid", placeItems: "center", cursor: "pointer", position: "relative" }}>
              <NIcon.bell s={20}/>
              <span style={{ position: "absolute", top: 8, right: 9, width: 8, height: 8, borderRadius: 999, background: "var(--background-critical)", border: "2px solid var(--canvas-default)" }}/>
            </button>
            {actions}
          </div>
        </header>

        {/* Body */}
        <main style={{ flex: 1, padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// White card panel
const Panel = ({ title, subtitle, right, children, pad = 20, style }) => (
  <section style={{
    background: "var(--canvas-default)", border: "1px solid var(--border-subtle)",
    borderRadius: "var(--border-radius-lg)", padding: pad,
    display: "flex", flexDirection: "column", gap: 16, ...style,
  }}>
    {(title || right) && (
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          {title && <h3 style={{ font: "var(--heading-sm)", color: "var(--text-strong)", margin: 0 }}>{title}</h3>}
          {subtitle && <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", marginTop: 3 }}>{subtitle}</div>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

// KPI stat tile
const StatTile = ({ label, value, sub, delta, deltaDir, accent }) => (
  <div style={{
    background: "var(--canvas-default)", border: "1px solid var(--border-subtle)",
    borderRadius: "var(--border-radius-lg)", padding: "18px 20px",
    display: "flex", flexDirection: "column", gap: 8, position: "relative", overflow: "hidden",
  }}>
    {accent && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: accent }}/>}
    <span style={{ font: "var(--label-sm)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ font: "var(--heading-xl)", fontWeight: 800, color: "var(--text-strong)", lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{sub}</span>}
    </div>
    {delta != null && (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "var(--body-strong-xs)", color: deltaDir === "down" ? "var(--text-critical)" : "var(--text-success)" }}>
        {deltaDir === "down" ? <NIcon.down s={14}/> : <NIcon.up s={14}/>}
        {delta}
        <span style={{ color: "var(--text-weak)", fontWeight: 400 }}>vs last week</span>
      </div>
    )}
  </div>
);

Object.assign(window, { NestShell, NIcon, Panel, StatTile, NAV });
