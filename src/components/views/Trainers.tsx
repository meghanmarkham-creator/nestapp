"use client";

// Trainers tab — roster at top, selected trainer's classes below with AI trend
// analysis, plus a self-service status selector (ported from app/trainers.jsx).
// Props: { onNav, onOpenClass, onOpenAdvocate, search, onSearch }.

import { useState, type ReactNode } from "react";
import {
  TRAINERS, TRAINER_STATUSES, classesOfTrainer, defaultTrainerStatus,
  programAvg, trainerById, trainerInsights, trainerRanking,
} from "@/lib/nest-data";
import { useStore } from "@/lib/store";
import { NestShell, Panel } from "@/components/shell";
import { NIcon } from "@/components/icons";
import { TrainerAvatar, LevelTag } from "@/components/ui";
import { GradePill, DistBar, CatBars } from "@/components/charts";
import { KV } from "./Advocates";

interface ViewProps {
  onNav: (key: string) => void;
  onOpenClass: (id: string) => void;
  onOpenAdvocate: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
}

export const TrainersView = ({ onNav, onOpenClass, onOpenAdvocate, search, onSearch }: ViewProps) => {
  const store = useStore();
  const S = store.get();
  const roster = TRAINERS.filter((t) => classesOfTrainer(t.id).length > 0);
  const [selId, setSelId] = useState<string | undefined>(roster[0]?.id);
  const trainer = selId ? trainerById(selId) : null;
  const insight = selId ? trainerInsights(selId) : null;
  const classes = selId ? classesOfTrainer(selId) : [];
  const ranking = trainerRanking();
  const rank = ranking.findIndex((r) => r.trainer.id === selId) + 1;
  const statusKey = selId ? (S.trainerStatus[selId] || defaultTrainerStatus(selId)) : "";

  return (
    <NestShell active="trainers" title="Trainers" subtitle={`${roster.length} Nest trainers · class performance and trends`} onNav={onNav} searchValue={search} onSearch={onSearch}>
      {/* roster rail */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {roster.map((t) => {
          const on = t.id === selId;
          const ti = trainerInsights(t.id)!;
          return (
            <button key={t.id} onClick={() => setSelId(t.id)} style={{
              display: "flex", alignItems: "center", gap: 11, padding: "10px 16px 10px 10px", borderRadius: 14, cursor: "pointer",
              border: on ? "1.5px solid var(--brand-primary)" : "1px solid var(--border-subtle)",
              background: on ? "var(--background-primary-subtle)" : "var(--canvas-default)",
            }}>
              <TrainerAvatar name={t.name} size={40} />
              <div style={{ textAlign: "left" }}>
                <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{t.name}</div>
                <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>{ti.classes} classes · avg {ti.avg}</div>
              </div>
            </button>
          );
        })}
      </div>

      {trainer && insight && (
        <>
          {/* header card */}
          <Panel>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
              <TrainerAvatar name={trainer.name} size={64} />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ font: "var(--heading-md)", color: "var(--text-strong)" }}>{trainer.name}</span>
                  <span style={{ font: "var(--label-xs)", fontWeight: 700, color: "var(--brand-secondary)", background: "var(--background-warning-subtle)", borderRadius: 999, padding: "3px 10px", boxShadow: "inset 0 0 0 1px var(--brand-tertiary)" }}>Nest Trainer</span>
                </div>
                <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", marginTop: 4 }}>{trainer.email} · {trainer.home} · {trainer.tenure} tenure</div>
                <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <KV label="Classes led" value={insight.classes} />
                  <KV label="Advocates" value={insight.advocates} />
                  <KV label="Avg readiness" value={insight.avg} />
                  <KV label="Rank" value={`#${rank} of ${ranking.length}`} />
                </div>
              </div>
              {/* status selector */}
              <div style={{ minWidth: 210 }}>
                <div style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600, marginBottom: 8 }}>My status</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {TRAINER_STATUSES.map((s) => {
                    const on = s.key === statusKey;
                    return (
                      <button key={s.key} onClick={() => store.setTrainerStatus(selId!, s.key)} style={{
                        display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", borderRadius: 999, cursor: "pointer",
                        border: on ? `1.5px solid ${s.color}` : "1px solid var(--border-subtle)",
                        background: on ? "var(--canvas-muted)" : "var(--canvas-default)", font: on ? "var(--body-strong-sm)" : "var(--body-regular-sm)", color: "var(--text-default)",
                      }}>
                        <span style={{ width: 9, height: 9, borderRadius: 999, background: s.color }} />{s.label}
                        {on && <span style={{ marginLeft: "auto", color: s.color, display: "inline-flex" }}><NIcon.check s={15} /></span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Panel>

          {/* AI trends */}
          <Panel title="AI trend analysis" subtitle={`Patterns across ${trainer.name.split(" ")[0]}'s classes`}
            right={<span style={trTag}><NIcon.trend s={13} /> AI insight</span>}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 14 }}>
              <InsightCard
                icon={<NIcon.alert s={16} />} tone="warning"
                title={`Recurring focus: ${insight.weakest.label}`}
                body={`${insight.weakest.label} is the lowest MOM category in ${insight.weakInHowMany} of ${insight.classes} classes (avg ${insight.weakest.val.toFixed(1)}/5). This is a consistent pattern worth addressing in ${trainer.name.split(" ")[0]}'s delivery.`} />
              <InsightCard
                icon={insight.gap >= 0 ? <NIcon.up s={16} /> : <NIcon.down s={16} />} tone={insight.gap >= 0 ? "success" : "critical"}
                title={insight.gap >= 0 ? "Above program average" : "Below program average"}
                body={`Classes average ${insight.avg} readiness — ${Math.abs(insight.gap)} pts ${insight.gap >= 0 ? "above" : "below"} the program average of ${programAvg}. ${trainer.name.split(" ")[0]} ranks #${rank} of ${ranking.length} trainers.`} />
              <InsightCard
                icon={<NIcon.trophy s={16} />} tone="informational"
                title="Strongest category"
                body={`${[...insight.catAvgs].sort((a, b) => b.val - a.val)[0].label} is consistently strong (avg ${[...insight.catAvgs].sort((a, b) => b.val - a.val)[0].val.toFixed(1)}/5) — a delivery strength to share with peers.`} />
            </div>
            <div style={{ height: 1, background: "var(--border-subtle)" }} />
            <div style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>MOM category averages across their classes</div>
            <CatBars cats={insight.catAvgs} max={5} labelCol={150} />
          </Panel>

          {/* their classes */}
          <Panel title="Classes" subtitle="Snapshot of each class this trainer owns" pad={0} style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                <thead>
                  <tr style={{ background: "var(--canvas-muted)" }}>
                    {["Class", "Level", "Cohort", "Week", "Readiness", "Grade mix", "Focus", ""].map((h, i) => (
                      <th key={i} style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", textAlign: "left", padding: "13px 16px", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c) => (
                    <tr key={c.id} className="nest-row" onClick={() => onOpenClass(c.id)} style={{ borderTop: "1px solid var(--border-subtle)", cursor: "pointer" }}>
                      <td style={tdT}><span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{c.name}</span></td>
                      <td style={tdT}><LevelTag level={c.level} /></td>
                      <td style={tdT}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{c.cohortLabel}</span></td>
                      <td style={tdT}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{c.weekOf}/{c.weeks}</span></td>
                      <td style={tdT}><div style={{ display: "flex", alignItems: "center", gap: 9 }}><GradePill letter={c.grade.letter} size={28} /><span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{c.avg}</span></div></td>
                      <td style={{ ...tdT, minWidth: 120 }}><DistBar dist={c.dist} total={c.size} /></td>
                      <td style={tdT}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{c.opportunity.label}</span></td>
                      <td style={{ ...tdT, textAlign: "right" }}><span style={{ color: "var(--icon-default)", display: "inline-flex" }}><NIcon.chevRight s={18} /></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </NestShell>
  );
};

type InsightTone = "warning" | "success" | "critical" | "informational";

const InsightCard = ({ icon, tone, title, body }: { icon: ReactNode; tone: InsightTone; title: string; body: string }) => {
  const map: Record<InsightTone, [string, string, string]> = {
    warning: ["var(--background-warning-subtle)", "var(--text-warning)", "var(--reference-yellow-500)"],
    success: ["var(--background-success-subtle)", "var(--text-success)", "var(--reference-green-500)"],
    critical: ["var(--background-critical-subtle)", "var(--text-critical)", "var(--reference-red-500)"],
    informational: ["var(--background-informational-subtle)", "var(--text-informational)", "var(--reference-indigo-500)"],
  };
  const c = map[tone];
  return (
    <div style={{ background: "var(--canvas-default)", border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-lg)", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: c[0], color: c[1], display: "grid", placeItems: "center", flexShrink: 0 }}>{icon}</span>
        <span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{title}</span>
      </div>
      <p style={{ margin: 0, font: "var(--body-regular-sm)", color: "var(--text-weak)", lineHeight: 1.5 }}>{body}</p>
    </div>
  );
};

const tdT: React.CSSProperties = { padding: "12px 16px", verticalAlign: "middle" };
const trTag: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, font: "var(--label-xs)", fontWeight: 600, color: "var(--text-primary)", background: "var(--background-primary-subtle)", borderRadius: 999, padding: "4px 10px" };
