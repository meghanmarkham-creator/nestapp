"use client";

// Coaching plan drawer — generated from an advocate's MOM scores (ported from app/coaching.jsx).
// Props: { advId, onClose }.

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, GRADES, cohortName, makePlan } from "@/lib/nest-data";
import { momColor } from "@/components/charts";

interface CoachingDrawerProps {
  advId: string | null;
  onClose: () => void;
}

export const CoachingDrawer = ({ advId, onClose }: CoachingDrawerProps) => {
  const [phase, setPhase] = useState<"loading" | "ready">("loading"); // loading | ready
  const [delivered, setDelivered] = useState(false);
  const plan = useMemo(() => (advId ? makePlan(advId) : null), [advId]);

  useEffect(() => {
    if (!advId) return;
    setPhase("loading");
    setDelivered(false);
    const t = setTimeout(() => setPhase("ready"), 1150);
    return () => clearTimeout(t);
  }, [advId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!advId || !plan) return null;
  const a = plan.advocate, g = GRADES[a.grade];

  return (
    <div style={cdScrim} onClick={onClose}>
      <div style={cdDrawer} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div style={cdHead}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ ...cdAvatar, background: g.subtle, color: g.text, border: `1.5px solid ${g.fill}` }}>
              {a.name.split(" ").map((x) => x[0]).join("")}
            </span>
            <div>
              <div style={{ font: "var(--heading-sm)", color: "var(--text-strong)" }}>{a.name}</div>
              <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{cohortName(a.cohort)} · readiness {a.composite} · grade {a.grade}</div>
            </div>
          </div>
          <button style={cdClose} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {phase === "loading" ? (
          <div style={cdLoading}>
            <div style={cdSpinner} />
            <div style={{ font: "var(--body-strong-md)", color: "var(--text-strong)", marginTop: 18 }}>Generating coaching plan…</div>
            <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", marginTop: 6, textAlign: "center", maxWidth: 320 }}>
              Analyzing {a.name.split(" ")[0]}&apos;s MOM scores across roleplay and production calls.
            </div>
          </div>
        ) : (
          <div style={cdBody}>
            {/* AI summary */}
            <div style={cdSummary}>
              <div style={cdSummaryLabel}>
                <Sparkle /> AI-generated from MOM scores
              </div>
              <p style={{ margin: "10px 0 0", font: "var(--body-regular-md)", color: "var(--text-default)", lineHeight: 1.55 }}>{plan.summary}</p>
            </div>

            {/* score strip */}
            <div style={cdScores}>
              {CATEGORIES.map((cat) => {
                const v = a.cats[cat.key];
                const isFocus = plan.focusAreas.some((f) => f.key === cat.key);
                return (
                  <div key={cat.key} style={{ ...cdScoreCell, border: isFocus ? "1.5px solid var(--brand-primary)" : "1px solid var(--border-subtle)", background: isFocus ? "var(--background-primary-subtle)" : "var(--canvas-default)" }}>
                    <div style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".03em" }}>{cat.short}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginTop: 6 }}>
                      <span style={{ font: "var(--heading-md)", fontWeight: 800, color: momColor(v) }}>{v.toFixed(1)}</span>
                      <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>/5</span>
                    </div>
                    {isFocus && <div style={cdFocusTag}>Focus</div>}
                  </div>
                );
              })}
            </div>

            {/* focus areas */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {plan.focusAreas.map((f, i) => (
                <div key={f.key} style={cdFocusCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={cdFocusNum}>{i + 1}</span>
                    <h4 style={{ margin: 0, font: "var(--body-strong-md)", color: "var(--text-strong)" }}>{f.focus}</h4>
                  </div>
                  <p style={{ margin: "10px 0 0", font: "var(--body-regular-sm)", color: "var(--text-weak)", lineHeight: 1.5 }}>{f.why}</p>

                  <div style={cdSubLabel}>Recommended drills</div>
                  <ul style={cdList}>
                    {f.drills.map((d, j) => <li key={j} style={cdLi}><span style={cdBullet} />{d}</li>)}
                  </ul>

                  <div style={cdSubLabel}>Roleplay scenarios to assign</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {f.scenarios.map((s, j) => <span key={j} style={cdChip}>{s}</span>)}
                  </div>

                  <div style={{ ...cdTalking }}>
                    <span style={{ font: "var(--label-xs)", color: "var(--text-informational)", textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 700 }}>Manager talking point</span>
                    <div style={{ font: "var(--body-regular-sm)", color: "var(--text-default)", marginTop: 5, fontStyle: "italic" }}>&quot;{f.talking}&quot;</div>
                  </div>
                </div>
              ))}
            </div>

            {/* check-in cadence */}
            <div style={cdFocusCard}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 style={{ margin: 0, font: "var(--body-strong-md)", color: "var(--text-strong)" }}>Check-in cadence</h4>
                <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{plan.horizon}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
                {plan.checkins.map((ci, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 14, padding: "10px 0", borderTop: i ? "1px solid var(--border-subtle)" : "none" }}>
                    <span style={{ font: "var(--body-strong-sm)", color: "var(--text-primary)" }}>{ci.when}</span>
                    <span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{ci.what}</span>
                  </div>
                ))}
              </div>
              <div style={cdTarget}>
                <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>Target readiness by end of plan</span>
                <span style={{ font: "var(--heading-sm)", fontWeight: 800, color: "var(--text-success)" }}>{plan.target} <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", fontWeight: 400 }}>(from {a.composite})</span></span>
              </div>
            </div>
          </div>
        )}

        {/* footer actions */}
        {phase === "ready" && (
          <div style={cdFooter}>
            <button style={cdBtnGhost} onClick={onClose}>Close</button>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={cdBtnGhost}>Save to coaching log</button>
              <button style={{ ...cdBtnPrimary, ...(delivered ? cdBtnDone : {}) }} onClick={() => setDelivered(true)}>
                {delivered ? (<><Check /> Plan assigned</>) : "Assign to advocate"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Sparkle = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.6L19.5 9l-4.6 2.1L12 17l-2.9-5.9L4.5 9l5.6-1.4z" /></svg>;
const Check = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>;

const cdScrim: React.CSSProperties = { position: "fixed", inset: 0, background: "var(--canvas-overlay, rgba(20,40,60,.55))", display: "flex", justifyContent: "flex-end", zIndex: 60, backdropFilter: "blur(1px)", animation: "cdFade .18s ease" };
const cdDrawer: React.CSSProperties = { width: 560, maxWidth: "94vw", height: "100%", background: "var(--canvas-muted)", display: "flex", flexDirection: "column", boxShadow: "-12px 0 40px rgba(13,55,94,.18)", animation: "cdSlide .26s cubic-bezier(.2,.7,.3,1)" };
const cdHead: React.CSSProperties = { flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "20px 24px", background: "var(--canvas-default)", borderBottom: "1px solid var(--border-subtle)" };
const cdAvatar: React.CSSProperties = { width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", font: "var(--body-strong-sm)", fontWeight: 800, flexShrink: 0 };
const cdClose: React.CSSProperties = { width: 38, height: 38, borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--icon-default)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
const cdLoading: React.CSSProperties = { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 };
const cdSpinner: React.CSSProperties = { width: 40, height: 40, borderRadius: 999, border: "3px solid var(--reference-slate-150)", borderTopColor: "var(--brand-primary)", animation: "cdSpin .8s linear infinite" };
const cdBody: React.CSSProperties = { flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 };
const cdSummary: React.CSSProperties = { background: "var(--brand-secondary)", borderRadius: "var(--border-radius-lg)", padding: "18px 20px", color: "#fff" };
const cdSummaryLabel: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, font: "var(--label-xs)", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--brand-tertiary)" };
const cdScores: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 };
const cdScoreCell: React.CSSProperties = { position: "relative", borderRadius: 10, padding: "12px 14px" };
const cdFocusTag: React.CSSProperties = { position: "absolute", top: 10, right: 10, font: "var(--label-xs)", fontWeight: 700, color: "var(--text-primary)" };
const cdFocusCard: React.CSSProperties = { background: "var(--canvas-default)", border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-lg)", padding: 20 };
const cdFocusNum: React.CSSProperties = { width: 26, height: 26, borderRadius: 999, background: "var(--background-primary)", color: "#fff", display: "grid", placeItems: "center", font: "var(--label-sm)", fontWeight: 800, flexShrink: 0 };
const cdSubLabel: React.CSSProperties = { font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600, marginTop: 16 };
const cdList: React.CSSProperties = { margin: "8px 0 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 };
const cdLi: React.CSSProperties = { position: "relative", paddingLeft: 22, font: "var(--body-regular-sm)", color: "var(--text-default)", lineHeight: 1.45 };
const cdBullet: React.CSSProperties = { position: "absolute", left: 6, top: 7, width: 6, height: 6, borderRadius: 999, background: "var(--brand-primary)" };
const cdChip: React.CSSProperties = { font: "var(--body-regular-sm)", color: "var(--text-default)", background: "var(--canvas-muted)", border: "1px solid var(--border-subtle)", borderRadius: 999, padding: "5px 12px" };
const cdTalking: React.CSSProperties = { marginTop: 16, background: "var(--background-informational-subtle)", borderRadius: 10, padding: "12px 14px" };
const cdTarget: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-subtle)" };
const cdFooter: React.CSSProperties = { flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 24px", background: "var(--canvas-default)", borderTop: "1px solid var(--border-subtle)" };
const cdBtnGhost: React.CSSProperties = { height: 42, padding: "0 18px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer" };
const cdBtnPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 42, padding: "0 22px", borderRadius: 999, border: "none", background: "var(--background-primary)", color: "#fff", font: "var(--label-md)", cursor: "pointer" };
const cdBtnDone: React.CSSProperties = { background: "var(--background-success)" };
