"use client";

// Readiness dashboard (ported from app/dashboard.jsx).
// Props: { onOpenPlan, onOpenClass, onNav, search, onSearch }.

import { useState } from "react";
import {
  CATEGORIES, LEVELS, READINESS_THRESHOLD, allAdvocates, atRisk, cohortName, cohorts,
  gradeOf, opportunities, strengths, trainerById,
} from "@/lib/nest-data";
import { deriveStats, resolveAdv } from "@/lib/derive";
import { NestShell, Panel } from "@/components/shell";
import { NIcon } from "@/components/icons";
import { Dropdown, Segmented, LevelTag, Avatar, EmptyState } from "@/components/ui";
import { GradePill, DistBar, CatBars, momColor } from "@/components/charts";
import { PENDING_LABELS } from "@/lib/momScale";
import { useStore } from "@/lib/store";
import type { Advocate, CatScore, Grade } from "@/lib/types";
import { StakeholderEmailModal } from "./EmailReport";

const f1 = (v: number) => Number(v).toFixed(1);

interface ViewProps {
  onOpenPlan: (id: string) => void;
  onOpenClass: (id: string) => void;
  onOpenAdvocate: (id: string) => void;
  onNav: (key: string) => void;
  search: string;
  onSearch: (v: string) => void;
}

export const Dashboard = ({ onOpenPlan, onOpenClass, onOpenAdvocate, onNav, search, onSearch }: ViewProps) => {
  const store = useStore();
  const S = store.get();
  const [cohort, setCohort] = useState("all");
  const [level, setLevel] = useState("all");
  const [emailOpen, setEmailOpen] = useState(false);

  const reassignedSet = new Set(Object.keys(S.assignments || {}));

  const realClasses = cohorts.map((c) => {
    const advs = c.advocates.filter((a) => !reassignedSet.has(a.id));
    return { ...c, isCustom: false, scoredCount: advs.length, advocates: advs, ...deriveStats(advs) };
  });
  const customClasses = S.customClasses.map((cc) => {
    const resolved = cc.advocateIds.map((id) => resolveAdv(id, S)).filter(Boolean) as any[];
    const scored = resolved.filter((a) => typeof a.composite === "number") as Advocate[];
    return {
      id: cc.id, name: cc.name, level: cc.level, cohortLabel: cc.startLabel,
      lead: cc.trainerId ? trainerById(cc.trainerId)?.short || "—" : "Unassigned",
      size: resolved.length, scoredCount: scored.length, advocates: scored,
      isCustom: true, ...deriveStats(scored),
    };
  });
  const allClasses = [...realClasses, ...customClasses] as any[];

  const classOpts = [
    { value: "all", label: "All cohorts", hint: `${allClasses.length} classes` },
    ...[...allClasses]
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map((c) => ({ value: c.id, label: c.name, hint: c.level })),
  ];
  // Default view: no classes yet → show the advocate pool as a whole; once classes
  // exist → show by class.
  const noClasses = allClasses.length === 0;

  const levelOpts = [
    { value: "all", label: "All levels" },
    ...LEVELS.map((l) => ({
      value: l, label: l,
      count: noClasses ? allAdvocates.filter((a) => a.level === l).length : allClasses.filter((c) => c.level === l).length,
    })).filter((o) => o.count > 0),
  ];

  const shown = allClasses
    .filter((c) => (cohort === "all" || c.id === cohort) && (level === "all" || c.level === level))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  // roster (pool) advocates when there are no classes
  const poolAdvs = allAdvocates
    .filter((a) => level === "all" || a.level === level)
    .sort((a, b) => b.composite - a.composite);

  const scopeAdvs = (noClasses
    ? poolAdvs
    : allClasses.filter((c) => level === "all" || c.level === level).flatMap((c) => c.advocates)) as Advocate[];
  const scopeN = scopeAdvs.length || 1;
  const scopeAvg = Math.round(scopeAdvs.reduce((s, a) => s + a.composite, 0) / scopeN);
  const scopeGrade = gradeOf(scopeAvg);
  const scopeDist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  scopeAdvs.forEach((a) => scopeDist[a.grade]++);
  const scopeReady = Math.round(((scopeDist.A + scopeDist.B) / scopeN) * 100);
  const scopeAtRisk = scopeAdvs.filter((a) => a.grade === "D").length;
  const scopeCats: CatScore[] = CATEGORIES.map((cat) => ({ ...cat, val: scopeAdvs.reduce((s, a) => s + a.cats[cat.key], 0) / scopeN }));
  const scopeSorted = [...scopeCats].sort((a, b) => b.val - a.val);
  const scopeStrength = scopeSorted[0];
  const scopeOpportunity = scopeSorted[scopeSorted.length - 1];
  const scopeClassCount = allClasses.filter((c) => level === "all" || c.level === level).length;
  const scopeLabel = level === "all" ? "Program" : level;

  return (
    <NestShell active="dash" title="Class readiness" subtitle="Current · live snapshot as of today" onNav={onNav} searchValue={search} onSearch={onSearch}
      actions={<button style={dbBtnPrimary} onClick={() => setEmailOpen(true)}>Export report</button>}>
      {/* Hero band */}
      <section className="nest-hero" style={dbHero}>
        <div style={{ position: "absolute", right: -40, top: -60, width: 280, height: 280, borderRadius: 999, background: "radial-gradient(circle, rgba(34,139,230,.28), transparent 70%)" }} />
        <div style={{ display: "grid", placeItems: "center" }}>
          <DonutInv value={scopeAvg} grade={scopeGrade} />
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ font: "var(--label-sm)", color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".08em" }}>{scopeLabel} readiness</div>
          <div style={{ font: "var(--heading-xl)", fontWeight: 800, margin: "6px 0 8px", letterSpacing: "-.01em", lineHeight: 1.2, maxWidth: 540 }}>{scopeReady}% on track to graduate ready</div>
          <p style={{ font: "var(--body-regular-md)", color: "rgba(255,255,255,.78)", margin: 0, maxWidth: 520 }}>
            {noClasses ? (
              <>Across a pool of <strong style={{ color: "#fff" }}>{scopeAdvs.length} {scopeAdvs.length === 1 ? "advocate" : "advocates"}</strong> with roleplay scores. <strong style={{ color: "#fff" }}>{scopeAtRisk} {scopeAtRisk === 1 ? "is" : "are"}</strong> below the roleplay readiness threshold. Build cohorts on Class Assignments to track by class.</>
            ) : (
              <>{level === "all" ? "Across" : `${level} advocates across`} <strong style={{ color: "#fff" }}>{scopeClassCount} {scopeClassCount === 1 ? "class" : "classes"}</strong>. <strong style={{ color: "#fff" }}>{scopeAtRisk} {scopeAtRisk === 1 ? "advocate is" : "advocates are"}</strong> below the readiness threshold and need coaching support.</>
            )}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <HeroChip v={scopeDist.A + scopeDist.B} k="On track" def="grades A–B" dot="var(--reference-green-400)" />
            <HeroChip v={scopeDist.C} k="Needs support" def="grade C" dot="var(--reference-yellow-400)" />
            <HeroChip v={scopeDist.D} k="At risk" def="grade D" dot="var(--reference-red-400)" />
          </div>
        </div>
        <div style={{ position: "relative", width: 220, display: "flex", flexDirection: "column", gap: 16, borderLeft: "1px solid rgba(255,255,255,.16)", paddingLeft: 28 }}>
          <div>
            <div style={{ font: "var(--label-xs)", color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Top opportunity</div>
            <div style={{ font: "var(--heading-md)", fontWeight: 800, lineHeight: 1.1 }}>{scopeOpportunity.label}</div>
            <div style={{ font: "var(--body-regular-sm)", color: "rgba(255,255,255,.7)", marginTop: 4 }}>{scopeLabel} avg {f1(scopeOpportunity.val)}/5 · lowest category</div>
          </div>
          <div>
            <div style={{ font: "var(--label-xs)", color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Strongest</div>
            <div style={{ font: "var(--heading-md)", fontWeight: 800, lineHeight: 1.1 }}>{scopeStrength.label}</div>
            <div style={{ font: "var(--body-regular-sm)", color: "rgba(255,255,255,.7)", marginTop: 4 }}>{scopeLabel} avg {f1(scopeStrength.val)}/5</div>
          </div>
        </div>
      </section>

      {/* Active classes */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ font: "var(--heading-sm)", color: "var(--text-strong)", margin: 0 }}>{noClasses ? "Advocate pool" : "Active classes"}</h2>
          <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", marginTop: 2 }}>
            {noClasses
              ? `${poolAdvs.length} advocates · no classes yet — build cohorts on Class Assignments`
              : `${shown.length} of ${allClasses.length} classes shown`}
          </div>
        </div>
        {!noClasses && <Dropdown value={cohort} onChange={setCohort} options={classOpts} width={236} align="right" icon={<NIcon.calendar s={16} />} />}
      </div>
      <Segmented value={level} onChange={setLevel} options={levelOpts} />

      {noClasses ? (
        <div className="nest-cards" style={{ gap: 16 }}>
          {poolAdvs.map((a) => (
            <RosterCard key={a.id} a={a} onOpen={() => onOpenAdvocate(a.id)} onPlan={() => onOpenPlan(a.id)} />
          ))}
          {poolAdvs.length === 0 && <EmptyState title="No advocates match this level" sub="Try a different level." />}
        </div>
      ) : (
      <div className="nest-cards" style={{ gap: 20 }}>
        {shown.map((c) =>
          c.isCustom && !c.scoredCount ? (
            <article key={c.id} style={{ ...dbCard, borderStyle: "dashed" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ font: "var(--heading-sm)", color: "var(--text-strong)" }}>{c.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                    <LevelTag level={c.level} />
                    <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>· Starts {c.cohortLabel}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "18px 0", textAlign: "center" }}>
                <span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>Newly created class</span>
                <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", maxWidth: 240 }}>{c.size} {c.size === 1 ? "advocate" : "advocates"} assigned · scores populate once training begins.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: 14, marginTop: "auto" }}>
                <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>Trainer: {c.lead}</span>
                <a onClick={() => onNav && onNav("assign")} style={dbLinkArrow}>Manage <span style={{ display: "inline-flex" }}><NIcon.chevRight s={14} /></span></a>
              </div>
            </article>
          ) : (
            <article key={c.id} style={{ ...dbCard, border: `2px solid ${c.grade.fill}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ font: "var(--heading-sm)", color: "var(--text-strong)" }}>{c.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                    <LevelTag level={c.level} />
                    <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>· Started {c.cohortLabel}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <GradePill letter={c.grade.letter} size={40} />
                  <span style={{ font: "var(--heading-md)", fontWeight: 800, color: "var(--text-strong)" }}>{f1(c.avg / 20)}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 2 }}>
                <MomBar label="Production" value={prodAvg(c) ?? undefined} pending={prodAvg(c) == null ? PENDING_LABELS.production : undefined} />
                <MomBar label="AI Roleplay" value={momAvg(c, "roleplayMom")} />
                <MomBar label="AI Assessments" pending={PENDING_LABELS.assessment} />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "var(--body-regular-xs)", color: "var(--text-weak)", marginBottom: 8 }}>
                  <span>Readiness grade mix</span><span>{c.advocates.length} advocates</span>
                </div>
                <DistBar dist={c.dist} total={c.advocates.length} inBarCounts height={22} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 4 }}>
                <MiniStat tone="up" label="Strength" value={c.strength.label} score={`${f1(c.strength.val)}/5`} />
                <MiniStat tone="down" label="Focus" value={c.opportunity.label} score={`${f1(c.opportunity.val)}/5`} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: 14, marginTop: 2 }}>
                <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>Trainer: {c.lead}</span>
                {c.isCustom ? (
                  <a onClick={() => onNav && onNav("assign")} style={dbLinkArrow}>Manage <span style={{ display: "inline-flex" }}><NIcon.chevRight s={14} /></span></a>
                ) : (
                  <a onClick={() => onOpenClass && onOpenClass(c.id)} style={dbLinkArrow}>View class <span style={{ display: "inline-flex" }}><NIcon.chevRight s={14} /></span></a>
                )}
              </div>
            </article>
          ),
        )}
        {shown.length === 0 && <EmptyState title="No classes match these filters" sub="Try a different cohort or level." />}
      </div>
      )}

      {/* Lower row */}
      <div className="nest-lower" style={{ gap: 24, alignItems: "start" }}>
        <Panel title="At-risk advocates" subtitle={`${atRisk.length} below the readiness threshold (${READINESS_THRESHOLD}) · generate a coaching plan from their MOM scores`} right={<span style={dbFlag}><NIcon.flag s={13} /> Needs action</span>}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {atRisk.slice(0, 7).map((a, i) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderTop: i ? "1px solid var(--border-subtle)" : "none" }}>
                <div style={dbAvatar}>{a.name.split(" ").map((x) => x[0]).join("")}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                  <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cohortName(a.cohort)} · readiness {a.composite} · focus: {a.opportunity.label}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, width: 40 }}>
                  <GradePill letter={a.grade} size={26} />
                </div>
                <button style={dbPlanBtn} onClick={() => onOpenPlan(a.id)}>
                  <NIcon.coaching s={15} /> Coaching plan
                </button>
              </div>
            ))}
          </div>
          {atRisk.length > 7 && (
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
              <a onClick={() => onNav && onNav("advocate")} style={dbLinkArrow}>View all {atRisk.length} at-risk advocates <span style={{ display: "inline-flex" }}><NIcon.chevRight s={14} /></span></a>
            </div>
          )}
        </Panel>

        <Panel title="Trending opportunities" subtitle="Lowest MOM rubric categories across all classes · 1–5" right={<span style={dbSparkTag}><NIcon.spark s={13} /> Bubble-up</span>}>
          <CatBars cats={opportunities} max={5} labelCol={148} />
          <div style={{ height: 1, background: "var(--border-subtle)", margin: "2px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <span style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em" }}>Holding strong</span>
            {strengths.slice(0, 2).map((s) => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, font: "var(--body-regular-sm)", color: "var(--text-default)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--reference-green-500)" }} />{s.label}
                </span>
                <span style={{ font: "var(--body-strong-sm)", color: "var(--text-success)" }}>{f1(s.val)}/5</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {emailOpen && (
        <StakeholderEmailModal onClose={() => setEmailOpen(false)}
          scope={{ label: scopeLabel, level, avg: scopeAvg, grade: scopeGrade, ready: scopeReady, atRisk: scopeAtRisk, dist: scopeDist, classCount: scopeClassCount, total: scopeN, strength: scopeStrength, opportunity: scopeOpportunity, classes: shown }} />
      )}
    </NestShell>
  );
};

const DonutInv = ({ value, grade }: { value: number; grade: Grade }) => {
  const size = 152, stroke = 15, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={grade.fill} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
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

const HeroChip = ({ k, v, def, dot }: { k: string; v: number; def: string; dot: string }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,.08)", borderRadius: 12, padding: "8px 14px" }}>
    <span style={{ width: 9, height: 9, borderRadius: 999, background: dot, flexShrink: 0 }} />
    <span style={{ font: "var(--heading-sm)", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{v}</span>
    <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
      <span style={{ font: "var(--body-strong-sm)", color: "#fff" }}>{k}</span>
      <span style={{ font: "var(--body-regular-xs)", color: "rgba(255,255,255,.6)" }}>{def}</span>
    </span>
  </div>
);

const momAvg = (c: { advocates: Advocate[] }, key: "roleplayMom") =>
  c.advocates.reduce((s, a) => s + a[key], 0) / c.advocates.length;
// class-level production average over advocates that have production data (null if none)
const prodAvg = (c: { advocates: Advocate[] }): number | null => {
  const vals = c.advocates.map((a) => a.productionMom).filter((v): v is number => v != null);
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
};

const MomBar = ({ label, value, pending }: { label: string; value?: number | null; pending?: string }) => {
  if (pending != null || value == null || Number.isNaN(value)) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "116px 1fr", alignItems: "center", gap: 10 }}>
        <span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{label}</span>
        <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", textAlign: "right", fontStyle: "italic" }}>{pending ?? "—"}</span>
      </div>
    );
  }
  const v = Number(value);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "116px 1fr 34px", alignItems: "center", gap: 10 }}>
      <span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{label}</span>
      <div style={{ height: 8, borderRadius: 999, background: "var(--reference-slate-100)", overflow: "hidden" }}>
        <div style={{ width: `${(v / 5) * 100}%`, height: "100%", background: momColor(v), borderRadius: 999 }} />
      </div>
      <span style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)", textAlign: "right" }}>{v.toFixed(1)}</span>
    </div>
  );
};

// Advocate roster card — shown on the dashboard when no classes exist yet.
const RosterCard = ({ a, onOpen, onPlan }: { a: Advocate; onOpen: () => void; onPlan: () => void }) => (
  <article style={{ ...dbCard, gap: 12, cursor: "pointer" }} onClick={onOpen}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar name={a.name} size={40} grade={a.grade} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ font: "var(--body-strong-md)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
        <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>{a.leader ? `Leader: ${a.leader}` : "Unassigned"}</div>
      </div>
      <GradePill letter={a.grade} size={34} />
    </div>
    <MomBar label="AI Roleplay" value={a.roleplayMom} />
    <MomBar label="Production" value={a.productionMom ?? undefined} pending={a.productionMom == null ? PENDING_LABELS.production : undefined} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <MiniStat tone="up" label="Strength" value={a.strength.label} score={`${f1(a.strength.val)}/5`} />
      <MiniStat tone="down" label="Focus" value={a.opportunity.label} score={`${f1(a.opportunity.val)}/5`} />
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: 12, marginTop: "auto" }}>
      <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>{a.sims ?? 0} sims · roleplay {f1(a.roleplayMom)}/5</span>
      {a.composite < READINESS_THRESHOLD && (
        <a onClick={(e) => { e.stopPropagation(); onPlan(); }} style={dbLinkArrow}>Coaching plan <span style={{ display: "inline-flex" }}><NIcon.chevRight s={14} /></span></a>
      )}
    </div>
  </article>
);

const MiniStat = ({ tone, label, value, score }: { tone: "up" | "down"; label: string; value: string; score: string }) => {
  const strong = tone === "up";
  return (
    <div style={{ background: strong ? "var(--background-success-subtle)" : "var(--background-warning-subtle)", borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ font: "var(--label-sm)", color: strong ? "var(--text-success)" : "var(--text-warning)", textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 700 }}>{label}</div>
      <div style={{ font: "var(--heading-sm)", fontWeight: 800, color: "var(--text-strong)", marginTop: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
      <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", marginTop: 2 }}>avg {score}</div>
    </div>
  );
};

const dbHero: React.CSSProperties = { background: "var(--brand-secondary)", borderRadius: "var(--border-radius-xl)", padding: "28px 32px", color: "#fff", gap: 36, alignItems: "center", position: "relative", overflow: "hidden" };
const dbCard: React.CSSProperties = { background: "var(--canvas-default)", border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-lg)", padding: 20, display: "flex", flexDirection: "column", gap: 16 };
const dbBtnPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 20px", borderRadius: 999, border: "none", background: "var(--background-primary)", color: "var(--text-inverse)", font: "var(--label-md)", cursor: "pointer" };
const dbLinkArrow: React.CSSProperties = { font: "var(--body-link-sm)", color: "var(--text-primary)", display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" };
const dbAvatar: React.CSSProperties = { width: 38, height: 38, borderRadius: 999, background: "var(--reference-slate-100)", color: "var(--text-strong)", display: "grid", placeItems: "center", font: "var(--label-xs)", fontWeight: 700, flexShrink: 0 };
const dbPlanBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 38, padding: "0 16px", borderRadius: 999, border: "1px solid var(--brand-primary)", background: "var(--background-primary-subtle)", color: "var(--text-primary)", font: "var(--label-md)", cursor: "pointer", whiteSpace: "nowrap" };
const dbFlag: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, font: "var(--label-xs)", fontWeight: 600, color: "var(--text-critical)", background: "var(--background-critical-subtle)", borderRadius: 999, padding: "4px 10px" };
const dbSparkTag: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, font: "var(--label-xs)", fontWeight: 600, color: "var(--text-primary)", background: "var(--background-primary-subtle)", borderRadius: 999, padding: "4px 10px" };
