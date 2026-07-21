"use client";

// The Nest — app shell (sidebar + top bar), Panel, StatTile (ported from app/shell.jsx).

import type { ReactNode } from "react";
import { cohorts } from "@/lib/nest-data";
import { NIcon } from "./icons";

export const NAV = [
  { key: "dash", label: "Readiness", icon: "dash" },
  { key: "aieff", label: "AI Efficiency", icon: "gauge" },
  { key: "assign", label: "Class Assignments", icon: "assign" },
  { key: "trainers", label: "Trainers", icon: "whistle" },
  { key: "coaching", label: "Coaching", icon: "coaching" },
  { key: "report", label: "Report cards", icon: "report" },
];

export const NestShell = ({ active = "dash", title, subtitle, actions, children, onNav, searchValue = "", onSearch, minHeight = 1000 }: {
  active?: string; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children?: ReactNode;
  onNav?: (key: string) => void; searchValue?: string; onSearch?: (v: string) => void; minHeight?: number;
}) => {
  const reportCount = cohorts.filter((c) => c.status === "Graduating").length;
  return (
    <div style={{ display: "flex", minHeight, background: "var(--canvas-muted)", font: "var(--body-regular-md)" }}>
      {/* Sidebar */}
      <aside style={{ width: 244, flexShrink: 0, background: "var(--brand-secondary)", display: "flex", flexDirection: "column", padding: "24px 16px", position: "sticky", top: 0, alignSelf: "flex-start", height: "100vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 24px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-horizontal-inverse.svg" alt="Carvana" style={{ height: 24 }} />
        </div>
        <div style={{ font: "var(--label-xs)", color: "rgba(255,255,255,.5)", letterSpacing: ".1em", textTransform: "uppercase", padding: "0 12px 10px" }}>The Nest · L&amp;E</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((item) => {
            const on = item.key === active;
            const Ic = NIcon[item.icon];
            return (
              <div key={item.key} className="nest-nav-item" onClick={() => onNav && onNav(item.key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, cursor: "pointer", background: on ? "rgba(255,255,255,.12)" : "transparent", color: on ? "#fff" : "rgba(255,255,255,.72)", font: on ? "var(--body-strong-sm)" : "var(--body-regular-sm)" }}>
                <Ic s={20} />
                <span>{item.label}</span>
                {item.key === "report" && reportCount > 0 && (
                  <span style={{ marginLeft: "auto", background: "var(--brand-tertiary)", color: "var(--brand-secondary)", font: "var(--label-xs)", fontWeight: 700, borderRadius: 999, padding: "1px 7px" }}>{reportCount}</span>
                )}
              </div>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ height: 1, background: "rgba(255,255,255,.12)" }} />
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
        <header style={{ height: 76, flexShrink: 0, background: "var(--canvas-default)", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 20, padding: "0 32px" }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ font: "var(--heading-md)", color: "var(--text-strong)", margin: 0, letterSpacing: "-.01em" }}>{title}</h1>
            {subtitle && <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", marginTop: 2 }}>{subtitle}</div>}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", borderRadius: 999, border: "1px solid var(--border-default)", color: "var(--text-weak)", background: "var(--canvas-default)", width: 248 }}>
              <NIcon.search s={18} />
              <input value={searchValue} onChange={(e) => onSearch && onSearch(e.target.value)} placeholder="Search advocates, classes…" style={{ border: "none", outline: "none", background: "transparent", font: "var(--body-regular-sm)", color: "var(--text-strong)", width: "100%" }} />
            </div>
            <button style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--icon-default)", display: "grid", placeItems: "center", cursor: "pointer", position: "relative" }}>
              <NIcon.bell s={20} />
              <span style={{ position: "absolute", top: 8, right: 9, width: 8, height: 8, borderRadius: 999, background: "var(--background-critical)", border: "2px solid var(--canvas-default)" }} />
            </button>
            {actions}
          </div>
        </header>
        <main style={{ flex: 1, padding: "28px 32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>{children}</main>
      </div>
    </div>
  );
};

export const Panel = ({ title, subtitle, right, children, pad = 20, style }: { title?: ReactNode; subtitle?: ReactNode; right?: ReactNode; children?: ReactNode; pad?: number; style?: React.CSSProperties }) => (
  <section style={{ background: "var(--canvas-default)", border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-lg)", padding: pad, display: "flex", flexDirection: "column", gap: 16, ...style }}>
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

export const StatTile = ({ label, value, sub, delta, deltaDir, accent }: { label: ReactNode; value: ReactNode; sub?: ReactNode; delta?: ReactNode; deltaDir?: "up" | "down"; accent?: string }) => (
  <div style={{ background: "var(--canvas-default)", border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-lg)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8, position: "relative", overflow: "hidden" }}>
    {accent && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: accent }} />}
    <span style={{ font: "var(--label-sm)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ font: "var(--heading-xl)", fontWeight: 800, color: "var(--text-strong)", lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{sub}</span>}
    </div>
    {delta != null && (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "var(--body-strong-xs)", color: deltaDir === "down" ? "var(--text-critical)" : "var(--text-success)" }}>
        {deltaDir === "down" ? <NIcon.down s={14} /> : <NIcon.up s={14} />}
        {delta}
        <span style={{ color: "var(--text-weak)", fontWeight: 400 }}>vs last week</span>
      </div>
    )}
  </div>
);
