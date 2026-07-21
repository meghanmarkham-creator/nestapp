"use client";

// Report Cards — celebratory landing + search, full advocate record, and the
// graduate / release / set-a-meeting actions. Plus the admin-only Archive.
// Ported from app/reportcards.jsx. Exports: ReportCardsView, ArchiveView, FullReportCard.

import { useMemo, useState, type ReactNode } from "react";
import {
  CATEGORIES, GRADES, advocateById, allAdvocates, calls, cohortById, cohorts, fmtDur,
} from "@/lib/nest-data";
import { useStore } from "@/lib/store";
import { nestToast } from "@/lib/toast";
import { CatBars, GradePill, ReadinessDonut, momColor, scoreColor } from "@/components/charts";
import { Avatar, EmptyState } from "@/components/ui";
import { NestShell, Panel } from "@/components/shell";
import { NIcon } from "@/components/icons";
import { BackBar } from "./Classes";
import { buildCoachingList } from "./CoachingBoard";
import { KV } from "./Advocates";
import type { Advocate, Call } from "@/lib/types";

const _pf1 = (v: number) => Number(v).toFixed(1);

// team-lead assignment for handoff (deterministic)
const HANDOFF_LEADS = ["Priya Nandakumar", "Marcus Webb", "Dana Holt", "Eli Brooks", "Sofia Cruz"];
const leadFor = (a: Advocate) => HANDOFF_LEADS[(a.name.charCodeAt(0) + a.composite) % HANDOFF_LEADS.length];

interface ReportCardsViewProps {
  onNav: (key: string) => void;
  onOpenAdvocate: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
}

export const ReportCardsView = ({ onNav, onOpenAdvocate, search, onSearch }: ReportCardsViewProps) => {
  const store = useStore();
  const S = store.get();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);

  if (sel) return <FullReportCard advId={sel} onBack={() => setSel(null)} onNav={onNav} onOpenAdvocate={onOpenAdvocate} search={search} onSearch={onSearch} />;

  const matches = q.trim()
    ? allAdvocates.filter((a) => a.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : [];
  const gradCount = Object.keys(S.graduated).length;

  return (
    <NestShell active="report" title="Report cards" subtitle="Search an advocate to open their full record" onNav={onNav} searchValue={search} onSearch={onSearch}
      actions={<button style={rGhost} onClick={() => onNav("archive")}><NIcon.archive s={16} /> Archive{gradCount ? ` · ${gradCount}` : ""}</button>}>

      {/* YAY celebration hero */}
      <section style={{ position: "relative", overflow: "hidden", background: "var(--brand-secondary)", borderRadius: "var(--border-radius-xl)", padding: "44px 40px 40px", textAlign: "center" }}>
        <Confetti />
        <div style={{ position: "relative" }}>
          <div style={{ width: 68, height: 68, borderRadius: 999, background: "var(--brand-tertiary)", color: "var(--brand-secondary)", display: "grid", placeItems: "center", margin: "0 auto 18px", boxShadow: "0 8px 24px rgba(250,176,5,.4)" }}>
            <NIcon.trophy s={34} />
          </div>
          <div style={{ fontFamily: "'BrandonforCarvana','Inter',sans-serif", fontWeight: 900, fontSize: 44, letterSpacing: ".02em", color: "#fff", textTransform: "uppercase", lineHeight: 1 }}>Time to graduate!</div>
          <p style={{ font: "var(--body-regular-lg)", color: "rgba(255,255,255,.8)", margin: "14px auto 0", maxWidth: 520 }}>
            Pull up any advocate to celebrate their progress, review their full record, and hand them off to their new team leader.
          </p>

          {/* search */}
          <div style={{ position: "relative", maxWidth: 460, margin: "26px auto 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, height: 52, padding: "0 18px", borderRadius: 999, background: "#fff", boxShadow: "0 8px 24px rgba(13,55,94,.24)" }}>
              <NIcon.search s={20} />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for an advocate by name…" style={{ border: "none", outline: "none", background: "transparent", font: "var(--body-regular-md)", width: "100%", color: "var(--text-strong)" }} />
            </div>
            {matches.length > 0 && (
              <div style={{ position: "absolute", top: 58, left: 0, right: 0, background: "var(--canvas-default)", borderRadius: "var(--border-radius-md)", boxShadow: "0 16px 40px rgba(13,55,94,.24)", padding: 6, zIndex: 20, textAlign: "left", maxHeight: 340, overflowY: "auto" }}>
                {matches.map((a) => {
                  const c = cohortById(a.cohort)!;
                  return (
                    <div key={a.id} onClick={() => setSel(a.id)} className="nest-row" style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 8, cursor: "pointer" }}>
                      <Avatar name={a.name} size={34} grade={a.grade} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{a.name}</div>
                        <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>{c.name} · {c.level}</div>
                      </div>
                      <GradePill letter={a.grade} size={28} />
                      {store.isGraduated(a.id) && <span style={{ font: "var(--label-xs)", fontWeight: 700, color: "var(--text-success)", background: "var(--background-success-subtle)", borderRadius: 999, padding: "2px 9px" }}>Graduated</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* graduating classes quick access */}
      <div>
        <h2 style={{ font: "var(--heading-sm)", color: "var(--text-strong)", margin: "0 0 4px" }}>Graduating now</h2>
        <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", marginBottom: 14 }}>Classes in their final week — open an advocate to graduate or release them.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16 }}>
          {cohorts.filter((c) => c.status === "Graduating").flatMap((c) => c.advocates.slice(0, 6).map((a) => ({ a, c }))).map(({ a, c }) => (
            <div key={a.id} onClick={() => setSel(a.id)} className="nest-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "var(--canvas-default)", border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-lg)", cursor: "pointer" }}>
              <Avatar name={a.name} size={40} grade={a.grade} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{a.name}</div>
                <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>{c.name} · readiness {a.composite}</div>
              </div>
              {store.isGraduated(a.id) ? <span style={{ font: "var(--label-xs)", fontWeight: 700, color: "var(--text-success)" }}>✓</span> : <GradePill letter={a.grade} size={30} />}
            </div>
          ))}
        </div>
      </div>
    </NestShell>
  );
};

// simple CSS confetti dots
const CONFETTI_COLORS = ["var(--brand-tertiary)", "var(--reference-blue-400)", "var(--reference-green-400)", "var(--reference-pink-500)", "#fff"];
const Confetti = () => {
  const bits = useMemo(() => Array.from({ length: 28 }).map((_, i) => ({
    left: (i * 37) % 100, top: (i * 53) % 90, size: 6 + (i % 3) * 3, c: CONFETTI_COLORS[i % CONFETTI_COLORS.length], r: (i * 47) % 360,
  })), []);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: .9 }}>
      {bits.map((b, i) => (
        <span key={i} style={{ position: "absolute", left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: b.size * 0.5, background: b.c, borderRadius: 2, transform: `rotate(${b.r}deg)`, opacity: .8 }} />
      ))}
    </div>
  );
};

// ---- Full advocate report card ----
interface FullReportCardProps {
  advId: string;
  onBack: () => void;
  onNav: (key: string) => void;
  onOpenAdvocate: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
}

export const FullReportCard = ({ advId, onBack, onNav, onOpenAdvocate, search, onSearch }: FullReportCardProps) => {
  const store = useStore();
  const S = store.get();
  const a = advocateById(advId);
  if (!a) return null;
  const c = cohortById(a.cohort)!;
  const g = GRADES[a.grade];
  const lead = leadFor(a);
  const graduated = store.isGraduated(advId);
  const released = store.isReleased(advId);
  const belowC = a.composite < 70; // below a C

  const myCalls = calls.filter((cl) => cl.advId === advId);
  const myCoachings = (buildCoachingList(S) as any[]).filter((r) => r.advId === advId);

  const metrics = [
    { label: "Average Roleplay MOM", value: _pf1(a.roleplayMom), unit: "/ 5", color: momColor(a.roleplayMom) },
    { label: "Average Production MOM", value: _pf1(a.productionMom), unit: "/ 5", color: momColor(a.productionMom) },
    { label: "Overall Assessment", value: a.assessment, unit: "/ 100", color: scoreColor(a.assessment) },
    { label: "Attendance", value: a.attendance, unit: "%", color: scoreColor(a.attendance) },
  ];

  const setMeeting = () => {
    const id = `handoff-${advId}`;
    store.addCoaching({ id, advId, kind: "Team Lead Handoff", focus: `Readiness ${a.composite} · grade ${a.grade}`, assignee: lead, source: "handoff", priority: false });
    nestToast(`Team Lead Handoff created for ${lead}`, "success");
  };
  const doGraduate = () => { store.graduate(advId, a.cohort); nestToast(`${a.name} graduated — moved to Archive`, "success"); };
  const doRelease = () => { store.release(advId); nestToast(`${a.name} released — priority coaching sent to Shelby Gary`, "success"); };

  return (
    <NestShell active="report" title="Report card" subtitle={`${a.name} · ${c.name}`} onNav={onNav} searchValue={search} onSearch={onSearch}
      actions={<button style={rGhost} onClick={() => window.print()}><NIcon.download s={16} /> Export PDF</button>}>
      <BackBar onBack={onBack} label="Back to search" />

      {/* status banners */}
      {graduated && <Banner tone="success" icon={<NIcon.trophy s={18} />} title={`${a.name.split(" ")[0]} has graduated`} body="Their record is stored in the admin Archive." />}
      {released && <Banner tone="pink" icon={<NIcon.flag s={18} />} title={`${a.name.split(" ")[0]} was released`} body="A priority coaching was auto-assigned to Shelby Gary." />}

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={rCard}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, paddingBottom: 20, borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo-horizontal-default.svg" alt="Carvana" style={{ height: 22 }} />
              <div style={{ font: "var(--label-sm)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".12em", marginTop: 12 }}>The Nest · Advocate Report Card</div>
            </div>
            <div style={{ textAlign: "right", font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>
              <div><strong style={{ color: "var(--text-strong)" }}>{c.name}</strong></div>
              <div>{c.level} · {c.cohortLabel}</div>
            </div>
          </div>

          {/* identity + readiness donut */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "22px 0", flexWrap: "wrap" }}>
            <ReadinessDonut value={a.composite} grade={g} size={132} stroke={14} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar name={a.name} size={52} grade={a.grade} />
                <div>
                  <div style={{ font: "var(--heading-lg)", fontWeight: 800, color: "var(--text-strong)" }}>{a.name}</div>
                  <div style={{ font: "var(--body-regular-md)", color: "var(--text-weak)" }}>Customer Advocate · {c.level}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <KV label="Overall readiness" value={`${a.composite} · ${a.grade}`} />
                <KV label="Strongest skill" value={a.strength.label} tone="up" />
                <KV label="Top opportunity" value={a.opportunity.label} tone="down" />
              </div>
            </div>
          </div>

          {/* metric grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 14 }}>
            {metrics.map((m) => (
              <div key={m.label} style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-md)", padding: "14px 16px" }}>
                <div style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".03em", minHeight: 28 }}>{m.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
                  <span style={{ font: "var(--heading-lg)", fontWeight: 800, color: m.color }}>{m.value}</span>
                  <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{m.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* MOM rubric breakdown */}
          <div style={{ marginTop: 22 }}>
            <SectionH>MOM rubric breakdown</SectionH>
            <CatBars cats={CATEGORIES.map((cat) => ({ ...cat, val: a.cats[cat.key] }))} max={5} labelCol={150} />
          </div>

          {/* individual scores received */}
          <div style={{ marginTop: 22 }}>
            <SectionH>Individual scores received <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>· {myCalls.length} calls</span></SectionH>
            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-md)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {myCalls.map((cl: Call, i) => (
                    <tr key={cl.id} style={{ borderTop: i ? "1px solid var(--border-subtle)" : "none" }}>
                      <td style={{ padding: "10px 14px", font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{cl.scenario}</td>
                      <td style={{ padding: "10px 14px", font: "var(--body-regular-xs)", color: "var(--text-weak)", whiteSpace: "nowrap" }}>{fmtDur(cl.durationSec)}</td>
                      <td style={{ padding: "10px 14px", font: "var(--body-regular-xs)", color: "var(--text-weak)", whiteSpace: "nowrap" }}>{cl.date}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        {cl.mom != null ? <span style={{ font: "var(--body-strong-sm)", color: momColor(cl.mom) }}>{cl.mom.toFixed(1)}</span>
                          : <span style={{ font: "var(--label-xs)", fontWeight: 700, color: cl.cutoff ? "var(--text-critical)" : "var(--text-warning)" }}>{cl.cutoff ? "Cut off" : "Failed"}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* coachings & notes */}
          <div style={{ marginTop: 22 }}>
            <SectionH>Coachings &amp; notes <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>· {myCoachings.length}</span></SectionH>
            {myCoachings.length === 0 ? (
              <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>No coaching sessions logged yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myCoachings.map((r) => (
                  <div key={r.id} style={{ border: `1px solid ${r.status === "complete" ? "var(--reference-green-500)" : r.priority ? "var(--reference-pink-500)" : "var(--border-subtle)"}`, borderRadius: "var(--border-radius-md)", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{r.kind} · {r.focus}</span>
                      <span style={{ font: "var(--label-xs)", fontWeight: 700, color: r.status === "complete" ? "var(--text-success)" : "var(--text-warning)" }}>{r.status === "complete" ? "Complete" : "Open"}</span>
                    </div>
                    {r.notes && <p style={{ margin: "8px 0 0", font: "var(--body-regular-sm)", color: "var(--text-weak)", lineHeight: 1.5 }}>{r.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* trainer note */}
          <div style={{ marginTop: 22 }}>
            <SectionH>Notes for team leader</SectionH>
            <p style={{ margin: 0, font: "var(--body-regular-md)", color: "var(--text-default)", lineHeight: 1.55 }}>{a.note}</p>
            <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", marginTop: 10 }}>Handoff to <strong style={{ color: "var(--text-strong)" }}>{lead}</strong> · prepared by Coach {c.lead}</div>
          </div>

          {/* below-C meeting prompt */}
          {belowC && !graduated && (
            <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 14, background: "var(--background-warning-subtle)", border: "1px solid var(--reference-yellow-500)", borderRadius: "var(--border-radius-lg)", padding: "16px 18px", flexWrap: "wrap" }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--canvas-default)", color: "var(--text-warning)", display: "grid", placeItems: "center", flexShrink: 0 }}><NIcon.alert s={20} /></span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>Readiness is below a C</div>
                <div style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>Set up a Team Lead Handoff so {lead} and Coach {c.lead} can align on whether {a.name.split(" ")[0]} can graduate.</div>
              </div>
              <button style={rMeeting} onClick={setMeeting}><NIcon.calendar s={16} /> Set a meeting</button>
            </div>
          )}
        </div>
      </div>

      {/* action bar */}
      {!graduated && (
        <div style={{ position: "sticky", bottom: 0, display: "flex", justifyContent: "center", gap: 12, padding: "14px", background: "linear-gradient(to top, var(--canvas-muted) 60%, transparent)" }} className="no-print">
          <button style={rRelease} onClick={doRelease} disabled={released}><NIcon.flag s={16} /> {released ? "Released" : "Release"}</button>
          <button style={rGraduate} onClick={doGraduate}><NIcon.trophy s={16} /> Graduate</button>
        </div>
      )}
    </NestShell>
  );
};

// ---- Admin-only Archive ----
interface ArchiveViewProps {
  onNav: (key: string) => void;
  search: string;
  onSearch: (v: string) => void;
}

export const ArchiveView = ({ onNav, search, onSearch }: ArchiveViewProps) => {
  const store = useStore();
  const S = store.get();
  const [q, setQ] = useState("");
  let rows = Object.entries(S.graduated)
    .map(([advId, meta]) => ({ a: advocateById(advId), meta }))
    .filter((r): r is { a: Advocate; meta: { at: string; classId: string } } => !!r.a);
  if (q) rows = rows.filter((r) => r.a.name.toLowerCase().includes(q.toLowerCase()));
  rows.sort((x, y) => new Date(y.meta.at).getTime() - new Date(x.meta.at).getTime());

  return (
    <NestShell active="report" title="Archive" subtitle="Graduated advocates · admin only" onNav={onNav} searchValue={search} onSearch={onSearch}
      actions={<button style={rGhost} onClick={() => onNav("report")}><NIcon.back s={16} /> Report cards</button>}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--background-informational-subtle)", border: "1px solid var(--reference-blue-400)", borderRadius: "var(--border-radius-lg)", padding: "12px 16px", font: "var(--body-regular-sm)", color: "var(--text-default)" }}>
        <NIcon.archive s={18} /> This area is restricted to admins. Graduated advocates are stored here with their final report card.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", width: 300, maxWidth: "100%" }}>
        <NIcon.search s={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search archived advocates" style={{ border: "none", outline: "none", background: "transparent", font: "var(--body-regular-sm)", width: "100%" }} />
      </div>
      <Panel pad={0} style={{ overflow: "hidden" }}>
        {rows.length === 0 ? <EmptyState title="No graduates yet" sub="When you graduate an advocate from their report card, they'll land here." /> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--canvas-muted)" }}>
                {["Advocate", "Class", "Final readiness", "Strength", "Opportunity", "Graduated"].map((h, i) => (
                  <th key={i} style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", textAlign: "left", padding: "13px 16px", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ a, meta }) => {
                const c = cohortById(a.cohort)!;
                return (
                  <tr key={a.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={a.name} size={32} grade={a.grade} /><span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{a.name}</span></div></td>
                    <td style={{ padding: "12px 16px", font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{c.name}</td>
                    <td style={{ padding: "12px 16px" }}><div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><GradePill letter={a.grade} size={26} /><span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{a.composite}</span></div></td>
                    <td style={{ padding: "12px 16px", font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{a.strength.label}</td>
                    <td style={{ padding: "12px 16px", font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{a.opportunity.label}</td>
                    <td style={{ padding: "12px 16px", font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{new Date(meta.at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </NestShell>
  );
};

const Banner = ({ tone, icon, title, body }: { tone: "success" | "pink"; icon: ReactNode; title: string; body: string }) => {
  const map = { success: ["var(--background-success-subtle)", "var(--reference-green-500)", "var(--text-success)"], pink: ["var(--background-critical-subtle)", "var(--reference-pink-500)", "var(--reference-pink-500)"] }[tone];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: map[0], border: `1px solid ${map[1]}`, borderRadius: "var(--border-radius-lg)", padding: "14px 18px" }}>
      <span style={{ width: 34, height: 34, borderRadius: 999, background: map[1], color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>{icon}</span>
      <div><div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{title}</div><div style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{body}</div></div>
    </div>
  );
};

const SectionH = ({ children }: { children: ReactNode }) => <div style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600, marginBottom: 12 }}>{children}</div>;

const rGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer" };
const rCard: React.CSSProperties = { width: "100%", maxWidth: 880, background: "var(--canvas-default)", border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-xl)", padding: 34 };
const rMeeting: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 18px", borderRadius: 999, border: "none", background: "var(--background-warning)", color: "var(--brand-secondary)", font: "var(--label-md)", fontWeight: 700, cursor: "pointer" };
const rGraduate: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, height: 46, padding: "0 28px", borderRadius: 999, border: "none", background: "var(--background-success)", color: "#fff", font: "var(--label-lg)", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 18px rgba(31,138,91,.3)" };
const rRelease: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, height: 46, padding: "0 24px", borderRadius: 999, border: "1.5px solid var(--reference-yellow-500)", background: "var(--background-warning-subtle)", color: "var(--brand-secondary)", font: "var(--label-lg)", fontWeight: 700, cursor: "pointer" };
