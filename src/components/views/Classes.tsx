"use client";

// Classes view + class drill-down (roster). Ported from app/classes.jsx.
// Exports: ClassesView, ClassDetail (plus shared helpers BackBar, SummaryTile).

import { useState } from "react";
import {
  CATEGORIES, LEVELS, READINESS_THRESHOLD, cohortById, cohortGroups, cohorts, trainerById,
} from "@/lib/nest-data";
import { deriveStats, resolveAdv } from "@/lib/derive";
import { useStore, type StoreState } from "@/lib/store";
import { NestShell, Panel } from "@/components/shell";
import { NIcon } from "@/components/icons";
import { Dropdown, Segmented, Avatar, LevelTag, StatusBadge, EmptyState } from "@/components/ui";
import { GradePill, DistBar, Sparkline, CatBars, momColor } from "@/components/charts";
import { PENDING_LABELS } from "@/lib/momScale";
import type { Advocate, CatMap } from "@/lib/types";

const _f1 = (v: number) => Number(v).toFixed(1);

export const BackBar = ({ onBack, label }: { onBack: () => void; label: string }) => (
  <button onClick={onBack} className="no-print" style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 34, padding: "0 14px 0 10px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer", alignSelf: "flex-start" }}>
    <NIcon.back s={16} /> {label}
  </button>
);

interface ClassesViewProps {
  onNav: (key: string) => void;
  onOpenClass: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
}

// ---- Classes list ----
export const ClassesView = ({ onNav, onOpenClass, search, onSearch }: ClassesViewProps) => {
  const [cohort, setCohort] = useState("all");
  const [level, setLevel] = useState("all");

  const cohortOpts = [
    { value: "all", label: "All cohorts", hint: `${cohorts.length} classes` },
    ...cohortGroups.map((g) => ({ value: g.key, label: `Cohort · ${g.label}`, hint: `${g.count} ${g.count > 1 ? "classes" : "class"}` })),
  ];
  const levelOpts = [
    { value: "all", label: "All levels" },
    ...LEVELS.map((l) => ({ value: l, label: l, count: cohorts.filter((c) => c.level === l).length })).filter((o) => o.count > 0),
  ];

  const shown = cohorts.filter((c) => (cohort === "all" || c.cohortKey === cohort) && (level === "all" || c.level === level));

  return (
    <NestShell active="classes" title="Classes" subtitle={`${cohorts.length} active training classes`} onNav={onNav} searchValue={search} onSearch={onSearch}
      actions={<Dropdown value={cohort} onChange={setCohort} options={cohortOpts} width={232} align="right" icon={<NIcon.calendar s={16} />} />}>
      <Segmented value={level} onChange={setLevel} options={levelOpts} />
      <Panel pad={0} style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--canvas-muted)" }}>
              {["Class", "Level", "Cohort start", "Status", "Week", "Advocates", "Readiness", ""].map((h, i) => (
                <th key={i} style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", textAlign: i >= 4 && i <= 5 ? "center" : "left", padding: "13px 16px", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id} onClick={() => onOpenClass(c.id)} className="nest-row" style={{ borderTop: "1px solid var(--border-subtle)", cursor: "pointer" }}>
                <td style={tdC}><div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{c.name}</div><div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", marginTop: 2 }}>{c.loc} · {c.mode}</div></td>
                <td style={tdC}><LevelTag level={c.level} /></td>
                <td style={tdC}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{c.cohortLabel}</span></td>
                <td style={tdC}><StatusBadge status={c.status} /></td>
                <td style={{ ...tdC, textAlign: "center" }}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{c.weekOf}/{c.weeks}</span></td>
                <td style={{ ...tdC, textAlign: "center" }}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{c.size}</span></td>
                <td style={tdC}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><GradePill letter={c.grade.letter} size={30} /><span style={{ font: "var(--body-strong-md)", color: "var(--text-strong)" }}>{c.avg}</span></div></td>
                <td style={{ ...tdC, textAlign: "right" }}><span style={{ color: "var(--icon-default)", display: "inline-flex" }}><NIcon.chevRight s={18} /></span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && (cohorts.length === 0
          ? <EmptyState title="No classes yet" sub="Create classes on Class Assignments." />
          : <EmptyState title="No classes match these filters" sub="Try a different cohort or level." />)}
      </Panel>
    </NestShell>
  );
};

interface ClassDetailProps {
  classId: string;
  onNav: (key: string) => void;
  onBack: () => void;
  onOpenPlan: (id: string) => void;
  onOpenAdvocate: (id: string) => void;
  onGraduate: (id: string) => void;
}

interface DetailClass {
  id: string; name: string; level: string; cohortLabel: string; lead: string; status: string;
  size: number; advocates: Advocate[]; cats: CatMap; trend: number[] | null;
  avg: number; grade: { letter: "A" | "B" | "C" | "D"; fill: string }; dist: Record<string, number>;
}

/** Resolve a class id to a normalized detail shape — base cohort or user-created custom class. */
function resolveClass(classId: string, S: StoreState): DetailClass | null {
  const base = cohortById(classId);
  if (base) return { ...base, trend: base.trend } as unknown as DetailClass;
  const cc = S.customClasses.find((x) => x.id === classId);
  if (!cc) return null;
  const advs = cc.advocateIds
    .map((id) => resolveAdv(id, S))
    .filter((a): a is Advocate => !!a && typeof (a as Advocate).composite === "number");
  const ds = deriveStats(advs);
  const cats = {} as CatMap;
  CATEGORIES.forEach((cat) => {
    cats[cat.key] = advs.length ? advs.reduce((s, a) => s + a.cats[cat.key], 0) / advs.length : 0;
  });
  return {
    id: cc.id, name: cc.name, level: cc.level, cohortLabel: cc.startLabel,
    lead: cc.trainerId ? trainerById(cc.trainerId)?.short || "—" : "Unassigned",
    status: "In training", size: advs.length, advocates: advs, cats, trend: null,
    avg: ds.avg, grade: ds.grade, dist: ds.dist,
  };
}

// ---- Class drill-down ----
export const ClassDetail = ({ classId, onNav, onBack, onOpenPlan, onOpenAdvocate, onGraduate }: ClassDetailProps) => {
  const store = useStore();
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "composite", dir: "desc" });
  const c = resolveClass(classId, store.get());
  if (!c) return (
    <NestShell active="classes" title="Class" onNav={onNav}>
      <BackBar onBack={onBack} label="All classes" />
      <EmptyState title="Class not found" sub="This class may have been removed or is not available." />
    </NestShell>
  );

  const cols: { key: string; label: string; align: React.CSSProperties["textAlign"] }[] = [
    { key: "composite", label: "Readiness", align: "left" },
    { key: "roleplayMom", label: "Roleplay MOM", align: "center" },
    { key: "productionMom", label: "Production MOM", align: "center" },
    { key: "assessment", label: "Assessment", align: "center" },
    { key: "attendance", label: "Attendance", align: "center" },
  ];
  const sorted = [...c.advocates].sort((a, b) => {
    const d = ((a as any)[sort.key] - (b as any)[sort.key]) * (sort.dir === "asc" ? 1 : -1);
    return d;
  });
  const toggle = (key: string) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));

  return (
    <NestShell active="classes" title={c.name} subtitle={`${c.level} · started ${c.cohortLabel} · coach ${c.lead}`} onNav={onNav}
      actions={<>
        <button style={cBtnGhost} onClick={() => onGraduate(c.id)}><NIcon.report s={16} /> {c.status === "Graduating" ? "Graduate class" : "Report cards"}</button>
      </>}>
      <BackBar onBack={onBack} label="All classes" />

      {/* summary tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
        <SummaryTile label="Class readiness" value={c.avg} sub={`/ 100 · ${c.grade.letter}`} accent={c.grade.fill} />
        <SummaryTile label="Advocates" value={c.size} sub={`${c.dist.D} at risk`} accent="var(--brand-primary)" />
        {(() => { const v = avgN(c.advocates, "roleplayMom"); return <SummaryTile label="Avg roleplay MOM" value={v == null ? "—" : _f1(v)} sub={v == null ? "" : "/ 5"} accent="var(--reference-blue-500)" />; })()}
        {(() => { const v = avgN(c.advocates, "productionMom"); return <SummaryTile label="Avg production MOM" value={v == null ? "Coming Soon" : _f1(v)} sub={v == null ? "" : "/ 5"} accent="var(--reference-indigo-500)" />; })()}
        {(() => { const v = avgN(c.advocates, "attendance"); return <SummaryTile label="Avg attendance" value={v == null ? "—" : `${Math.round(v)}%`} accent="var(--reference-green-500)" />; })()}
      </div>

      <div className="nest-lower" style={{ gap: 24, alignItems: "start" }}>
        {/* roster */}
        <Panel title="Roster" subtitle="Click an advocate for their detail · sort by any score" pad={0} style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ background: "var(--canvas-muted)" }}>
                  <th style={{ ...thC, textAlign: "left" }}>Advocate</th>
                  {cols.map((col) => (
                    <th key={col.key} onClick={() => toggle(col.key)} style={{ ...thC, textAlign: col.align, cursor: "pointer", whiteSpace: "nowrap" }}>
                      {col.label}{sort.key === col.key && <span style={{ marginLeft: 4 }}>{sort.dir === "asc" ? "▲" : "▼"}</span>}
                    </th>
                  ))}
                  <th style={thC}></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((a) => (
                  <tr key={a.id} className="nest-row" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td style={tdC}>
                      <div onClick={() => onOpenAdvocate(a.id)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                        <Avatar name={a.name} size={32} grade={a.grade} />
                        <span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{a.name}</span>
                      </div>
                    </td>
                    <td style={tdC}><div style={{ display: "flex", alignItems: "center", gap: 9 }}><GradePill letter={a.grade} size={26} /><span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{a.composite}</span></div></td>
                    <MomCell v={a.roleplayMom} />
                    <MomCell v={a.productionMom} />
                    <td style={{ ...tdC, textAlign: "center" }}>{a.assessment == null
                      ? <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{PENDING_LABELS.assessment}</span>
                      : <span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{a.assessment}</span>}</td>
                    <td style={{ ...tdC, textAlign: "center" }}>{a.attendance == null
                      ? <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>—</span>
                      : <span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{a.attendance}%</span>}</td>
                    <td style={{ ...tdC, textAlign: "right", whiteSpace: "nowrap" }}>
                      {a.composite < READINESS_THRESHOLD
                        ? <button style={cPlanBtn} onClick={() => onOpenPlan(a.id)}><NIcon.coaching s={14} /> Plan</button>
                        : <button style={cViewBtn} onClick={() => onOpenAdvocate(a.id)}>View</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* class insight */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Panel title="Grade mix">
            <DistBar dist={c.dist} total={c.size} showCounts height={12} />
            {c.trend && <>
              <Sparkline data={c.trend} width={220} height={44} color={c.grade.fill} />
              <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>6-week readiness trend</div>
            </>}
          </Panel>
          <Panel title="MOM rubric — class average" subtitle="1–5 across coaching criteria">
            <CatBars cats={CATEGORIES.map((cat) => ({ ...cat, val: c.cats[cat.key] }))} max={5} labelCol={150} />
          </Panel>
        </div>
      </div>
    </NestShell>
  );
};

// null-safe average over a numeric advocate field (skips nulls; null if none)
const avgN = (arr: Advocate[], key: string): number | null => {
  const vals = arr.map((a) => (a as any)[key]).filter((v): v is number => typeof v === "number");
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
};

const MomCell = ({ v }: { v: number | null }) => (
  <td style={{ padding: "12px 16px", textAlign: "center" }}>
    {v == null
      ? <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{PENDING_LABELS.production}</span>
      : <span style={{ font: "var(--body-strong-sm)", color: momColor(v) }}>{_f1(v)}</span>}
  </td>
);

export const SummaryTile = ({ label, value, sub, accent }: { label: React.ReactNode; value: React.ReactNode; sub?: React.ReactNode; accent?: string }) => (
  <div style={{ background: "var(--canvas-default)", border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-lg)", padding: "16px 18px", position: "relative", overflow: "hidden" }}>
    {accent && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: accent }} />}
    <div style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
      <span style={{ font: "var(--heading-lg)", fontWeight: 800, color: "var(--text-strong)", lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{sub}</span>}
    </div>
  </div>
);

const tdC: React.CSSProperties = { padding: "12px 16px", verticalAlign: "middle" };
const thC: React.CSSProperties = { font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", padding: "13px 16px", fontWeight: 600 };
const cBtnGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 18px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer" };
const cPlanBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 13px", borderRadius: 999, border: "1px solid var(--brand-primary)", background: "var(--background-primary-subtle)", color: "var(--text-primary)", font: "var(--label-sm)", cursor: "pointer" };
const cViewBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 15px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-sm)", cursor: "pointer" };
