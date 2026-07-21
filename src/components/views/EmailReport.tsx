"use client";

// Stakeholder email report (ported from app/email_report.jsx) — a branded,
// copy-ready email template built from the current (filter-scoped) Readiness
// snapshot. Named export: StakeholderEmailModal.

import { useEffect, useRef, useState } from "react";
import { NIcon } from "@/components/icons";
import { nestToast } from "@/lib/toast";
import type { CatScore, Grade, GradeLetter } from "@/lib/types";

interface ScopeClass {
  id: string;
  name: string;
  level: string;
  avg: number;
  grade: Grade;
  lead: string;
  isCustom?: boolean;
  scoredCount?: number;
}

interface EmailScope {
  label: string;
  level: string;
  avg: number;
  grade: Grade;
  ready: number;
  atRisk: number;
  dist: Record<string, number>;
  classCount: number;
  total: number;
  strength: CatScore;
  opportunity: CatScore;
  classes: ScopeClass[];
}

interface StakeholderEmailModalProps {
  onClose: () => void;
  scope: EmailScope;
}

const f1 = (v: number) => Number(v).toFixed(1);

export const StakeholderEmailModal = ({ onClose, scope }: StakeholderEmailModalProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const g = scope.grade;
  const subject = `The Nest — ${scope.label} Readiness Snapshot (${today})`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // grade → hex (emails can't use CSS vars)
  const HEX: Record<GradeLetter, string> = { A: "#1f8a5b", B: "#228be6", C: "#fab005", D: "#e03131" };
  const GRADE_LABEL: Record<GradeLetter, string> = { A: "Ready", B: "On track", C: "Needs support", D: "At risk" };
  const gh = HEX[g.letter];

  const pct = (n: number) => Math.round((n / scope.total) * 100);
  const distSegs = (["A", "B", "C", "D"] as GradeLetter[]).filter((l) => scope.dist[l] > 0);

  const buildPlainText = () => {
    const lines = [
      `${scope.label} Readiness Snapshot — ${today}`,
      ``,
      `Overall readiness: ${scope.avg}/100 (Grade ${g.letter} — ${GRADE_LABEL[g.letter]})`,
      `${scope.ready}% of advocates on track to graduate ready across ${scope.classCount} classes.`,
      `${scope.atRisk} advocate(s) below the readiness threshold.`,
      ``,
      `Grade mix: A ${scope.dist.A} · B ${scope.dist.B} · C ${scope.dist.C} · D ${scope.dist.D}`,
      `Strongest skill: ${scope.strength.label} (${f1(scope.strength.val)}/5)`,
      `Top opportunity: ${scope.opportunity.label} (${f1(scope.opportunity.val)}/5)`,
      ``,
      `Classes:`,
      ...scope.classes.filter((c) => !c.isCustom || c.scoredCount).map((c) => `  • ${c.name} (${c.level}) — ${c.avg}/100, grade ${c.grade.letter}, trainer ${c.lead}`),
      ``,
      `Prepared by The Nest · Learning & Enablement`,
    ];
    return lines.join("\n");
  };

  const copyEmail = async () => {
    const el = previewRef.current;
    if (!el) return;
    const html = el.innerHTML;
    const plain = buildPlainText();
    try {
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plain], { type: "text/plain" }),
      })]);
      nestToast("Email copied — paste into Outlook or Gmail", "success");
    } catch {
      try { await navigator.clipboard.writeText(plain); nestToast("Copied as text", "success"); }
      catch { nestToast("Copy failed — select and copy manually"); }
    }
    setCopied(true); setTimeout(() => setCopied(false), 2400);
  };

  const openMailto = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildPlainText())}`;
  };

  const downloadHtml = () => {
    const el = previewRef.current;
    if (!el) return;
    const doc = `<!doctype html><html><body style="margin:0">${el.innerHTML}</body></html>`;
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Nest-Readiness-${scope.label.replace(/\s+/g, "-")}.html`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    nestToast("Downloaded email HTML");
  };

  // email-safe inline styles
  const cell: React.CSSProperties = { fontFamily: "Inter, Arial, sans-serif" };

  return (
    <div style={emScrim} onClick={onClose}>
      <div style={emModal} onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
          <div>
            <div style={{ font: "var(--heading-sm)", color: "var(--text-strong)" }}>Stakeholder email</div>
            <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>Copy this into Outlook or Gmail and send</div>
          </div>
          <button style={emClose} onClick={onClose}><NIcon.x s={18} /></button>
        </div>

        {/* subject line */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 22px", borderBottom: "1px solid var(--border-subtle)", background: "var(--canvas-muted)", flexShrink: 0 }}>
          <span style={{ font: "var(--label-sm)", color: "var(--text-weak)", fontWeight: 600 }}>Subject</span>
          <span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{subject}</span>
        </div>

        {/* scrollable email preview */}
        <div style={{ flex: 1, overflowY: "auto", background: "#eef1f4", padding: 22 }}>
          <div ref={previewRef} style={{ maxWidth: 640, margin: "0 auto", background: "#ffffff", borderRadius: 12, overflow: "hidden", border: "1px solid #e3e8ee" }}>
            {/* branded header */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ ...cell, background: "#0d375e", padding: "26px 32px" }}>
                    <table width="100%" cellPadding="0" cellSpacing="0"><tbody><tr>
                      <td style={{ ...cell }}>
                        <div style={{ color: "#ffffff", fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7 }}>The Nest · Learning &amp; Enablement</div>
                        <div style={{ color: "#ffffff", fontSize: 26, fontWeight: 800, marginTop: 8 }}>{scope.label} Readiness Snapshot</div>
                        <div style={{ color: "#9db8d4", fontSize: 14, marginTop: 4 }}>{today}</div>
                      </td>
                      <td align="right" style={{ ...cell, verticalAlign: "top" }}>
                        <div style={{ display: "inline-block", background: "#fab005", color: "#0d375e", fontSize: 12, fontWeight: 800, padding: "6px 12px", borderRadius: 999, letterSpacing: "0.04em" }}>CARVANA</div>
                      </td>
                    </tr></tbody></table>
                  </td>
                </tr>

                {/* headline readiness */}
                <tr>
                  <td style={{ ...cell, padding: "28px 32px 8px" }}>
                    <table width="100%" cellPadding="0" cellSpacing="0"><tbody><tr>
                      <td style={{ ...cell, verticalAlign: "middle", width: 120 }}>
                        <div style={{ width: 104, height: 104, borderRadius: 999, background: gh, textAlign: "center", lineHeight: "104px", color: "#ffffff", fontSize: 40, fontWeight: 800 }}>{scope.avg}</div>
                      </td>
                      <td style={{ ...cell, verticalAlign: "middle", paddingLeft: 22 }}>
                        <div style={{ fontSize: 15, color: gh, fontWeight: 700 }}>Grade {g.letter} · {GRADE_LABEL[g.letter]}</div>
                        <div style={{ fontSize: 22, color: "#12263a", fontWeight: 800, marginTop: 4, lineHeight: 1.25 }}>{scope.ready}% on track to graduate ready</div>
                        <div style={{ fontSize: 14, color: "#5b6b7a", marginTop: 6 }}>Across {scope.classCount} {scope.classCount === 1 ? "class" : "classes"} · {scope.total} advocates · <strong style={{ color: "#e03131" }}>{scope.atRisk} at risk</strong></div>
                      </td>
                    </tr></tbody></table>
                  </td>
                </tr>

                {/* grade mix bar */}
                <tr>
                  <td style={{ ...cell, padding: "16px 32px 6px" }}>
                    <div style={{ fontSize: 12, color: "#5b6b7a", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 8 }}>Readiness grade mix</div>
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", borderRadius: 8, overflow: "hidden" }}><tbody><tr>
                      {distSegs.map((l) => (
                        <td key={l} style={{ ...cell, background: HEX[l], color: l === "C" ? "#3a2c00" : "#ffffff", fontSize: 13, fontWeight: 800, textAlign: "center", padding: "9px 0", width: `${pct(scope.dist[l])}%` }}>{l} · {scope.dist[l]}</td>
                      ))}
                    </tr></tbody></table>
                    <div style={{ fontSize: 12, color: "#8595a6", marginTop: 6 }}>A Ready · B On track · C Needs support · D At risk</div>
                  </td>
                </tr>

                {/* strength / opportunity */}
                <tr>
                  <td style={{ ...cell, padding: "14px 32px 6px" }}>
                    <table width="100%" cellPadding="0" cellSpacing="0"><tbody><tr>
                      <td style={{ ...cell, width: "50%", verticalAlign: "top", paddingRight: 8 }}>
                        <div style={{ background: "#eafaf1", borderRadius: 10, padding: "14px 16px" }}>
                          <div style={{ fontSize: 12, color: "#1f8a5b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>Strongest skill</div>
                          <div style={{ fontSize: 17, color: "#12263a", fontWeight: 800, marginTop: 5 }}>{scope.strength.label}</div>
                          <div style={{ fontSize: 13, color: "#5b6b7a", marginTop: 2 }}>{f1(scope.strength.val)} / 5 average</div>
                        </div>
                      </td>
                      <td style={{ ...cell, width: "50%", verticalAlign: "top", paddingLeft: 8 }}>
                        <div style={{ background: "#fff8e6", borderRadius: 10, padding: "14px 16px" }}>
                          <div style={{ fontSize: 12, color: "#a5730a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>Top opportunity</div>
                          <div style={{ fontSize: 17, color: "#12263a", fontWeight: 800, marginTop: 5 }}>{scope.opportunity.label}</div>
                          <div style={{ fontSize: 13, color: "#5b6b7a", marginTop: 2 }}>{f1(scope.opportunity.val)} / 5 average</div>
                        </div>
                      </td>
                    </tr></tbody></table>
                  </td>
                </tr>

                {/* per-class table */}
                <tr>
                  <td style={{ ...cell, padding: "18px 32px 8px" }}>
                    <div style={{ fontSize: 12, color: "#5b6b7a", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 8 }}>By class</div>
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
                      <tbody>
                        <tr>
                          <td style={{ ...cell, fontSize: 12, color: "#8595a6", padding: "0 0 8px", fontWeight: 700 }}>Class</td>
                          <td style={{ ...cell, fontSize: 12, color: "#8595a6", padding: "0 0 8px", fontWeight: 700 }}>Level</td>
                          <td style={{ ...cell, fontSize: 12, color: "#8595a6", padding: "0 0 8px", fontWeight: 700 }}>Trainer</td>
                          <td align="right" style={{ ...cell, fontSize: 12, color: "#8595a6", padding: "0 0 8px", fontWeight: 700 }}>Readiness</td>
                        </tr>
                        {scope.classes.filter((c) => !c.isCustom || c.scoredCount).map((c) => (
                          <tr key={c.id}>
                            <td style={{ ...cell, fontSize: 14, color: "#12263a", fontWeight: 700, padding: "9px 0", borderTop: "1px solid #eef1f4" }}>{c.name}</td>
                            <td style={{ ...cell, fontSize: 14, color: "#5b6b7a", padding: "9px 0", borderTop: "1px solid #eef1f4" }}>{c.level}</td>
                            <td style={{ ...cell, fontSize: 14, color: "#5b6b7a", padding: "9px 0", borderTop: "1px solid #eef1f4" }}>{c.lead}</td>
                            <td align="right" style={{ ...cell, padding: "9px 0", borderTop: "1px solid #eef1f4" }}>
                              <span style={{ display: "inline-block", background: HEX[c.grade.letter], color: c.grade.letter === "C" ? "#3a2c00" : "#ffffff", fontSize: 13, fontWeight: 800, padding: "3px 10px", borderRadius: 999 }}>{c.avg} · {c.grade.letter}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>

                {/* footer */}
                <tr>
                  <td style={{ ...cell, padding: "20px 32px 28px" }}>
                    <div style={{ borderTop: "1px solid #eef1f4", paddingTop: 16, fontSize: 13, color: "#8595a6", lineHeight: 1.5 }}>
                      Prepared by <strong style={{ color: "#12263a" }}>The Nest · Learning &amp; Enablement</strong>. Readiness blends roleplay MOM, production MOM, assessments and attendance into an A–D grade. Reply to this email for a class-level or individual breakdown.
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, padding: "16px 22px", borderTop: "1px solid var(--border-subtle)", background: "var(--canvas-default)", flexShrink: 0 }}>
          <button style={emGhost} onClick={downloadHtml}><NIcon.download s={16} /> Download HTML</button>
          <button style={emGhost} onClick={openMailto}><NIcon.mail s={16} /> Open in email</button>
          <button style={emPrimary} onClick={copyEmail}>{copied ? <><NIcon.check s={16} /> Copied</> : <><NIcon.report s={16} /> Copy email</>}</button>
        </div>
      </div>
    </div>
  );
};

const emScrim: React.CSSProperties = { position: "fixed", inset: 0, background: "var(--canvas-overlay, rgba(20,40,60,.55))", display: "grid", placeItems: "center", zIndex: 80, padding: 20 };
const emModal: React.CSSProperties = { background: "var(--canvas-default)", borderRadius: "var(--border-radius-xl)", width: "100%", maxWidth: 760, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(13,55,94,.3)", overflow: "hidden" };
const emClose: React.CSSProperties = { width: 36, height: 36, borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--icon-default)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
const emGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer" };
const emPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 20px", borderRadius: 999, border: "none", background: "var(--background-primary)", color: "#fff", font: "var(--label-md)", cursor: "pointer" };
