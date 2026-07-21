"use client";

// AI Efficiency tab — AI/scoring health, cut-off transcripts, omit-with-reason,
// ACS transcript preview (ported from app/ai_efficiency.jsx).
// Props: { onNav, onOpenAdvocate, search, onSearch }.

import { useState } from "react";
import {
  CATEGORIES, advocateById, avgCallLen, calls, cohortById, cutoffCalls,
  failedCalls, fmtDur, scoredCount, transcriptFor,
} from "@/lib/nest-data";
import { useStore } from "@/lib/store";
import { nestToast } from "@/lib/toast";
import { NestShell, Panel, StatTile } from "@/components/shell";
import { NIcon } from "@/components/icons";
import { Segmented, Avatar, EmptyState } from "@/components/ui";
import { CatBars, momColor } from "@/components/charts";
import type { Call } from "@/lib/types";

const OMIT_REASONS = [
  "Call cut off — below 3-min scoring threshold",
  "Customer disconnected / dropped",
  "System or audio error",
  "Not a scorable interaction (wrong queue)",
  "Duplicate of another scored call",
  "Trainer override — practice call",
];

interface ViewProps {
  onNav: (key: string) => void;
  onOpenAdvocate: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
}

export const AIEfficiencyView = ({ onNav, onOpenAdvocate, search, onSearch }: ViewProps) => {
  const store = useStore();
  const S = store.get();
  const [acsCall, setAcsCall] = useState<Call | null>(null);
  const [omitFor, setOmitFor] = useState<Call | null>(null);
  const [tab, setTab] = useState("cutoff");

  const omittedIds = Object.keys(S.omits);
  const cutoff = cutoffCalls;
  const failed = failedCalls;
  const pctOmitted = Math.round((omittedIds.length / calls.length) * 1000) / 10;

  const list = tab === "cutoff" ? cutoff : tab === "failed" ? failed : calls.filter((c) => S.omits[c.id]);

  return (
    <NestShell active="aieff" title="AI Efficiency" subtitle="AI scoring health across roleplay and production calls" onNav={onNav} searchValue={search} onSearch={onSearch}>
      {/* health metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16 }}>
        <StatTile label="Cut off < 3 min" value={cutoff.length} sub="transcripts" accent="var(--reference-red-500)" />
        <StatTile label="% omitted from scoring" value={`${pctOmitted}%`} sub={`${omittedIds.length} of ${calls.length}`} accent="var(--reference-orange-500)" />
        <StatTile label="Avg call length" value={fmtDur(avgCallLen)} sub="min:sec" accent="var(--brand-primary)" />
        <StatTile label="Calls scored" value={scoredCount} sub={`of ${calls.length}`} accent="var(--reference-green-500)" />
        <StatTile label="Missing / failed MOM" value={failed.length} sub="need review" accent="var(--reference-yellow-500)" />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <Segmented value={tab} onChange={setTab} options={[
          { value: "cutoff", label: "Cut off < 3 min", count: cutoff.length },
          { value: "failed", label: "Missing MOM", count: failed.length },
          { value: "omitted", label: "Omitted", count: omittedIds.length },
        ]} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>
          <NIcon.alert s={15} /> Omitting a call removes it from that advocate&apos;s official MOM average.
        </span>
      </div>

      <Panel pad={0} style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr style={{ background: "var(--canvas-muted)" }}>
                {["Advocate", "Scenario", "Duration", "End reason", "MOM", "ACS record", "Date", ""].map((h, i) => (
                  <th key={i} style={{ font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", textAlign: i === 4 ? "center" : "left", padding: "13px 16px", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((call) => {
                const a = advocateById(call.advId)!;
                const c = cohortById(a.cohort)!;
                const omitted = !!S.omits[call.id];
                return (
                  <tr key={call.id} className="nest-row" style={{ borderTop: "1px solid var(--border-subtle)", opacity: omitted ? 0.6 : 1 }}>
                    <td style={tdE}>
                      <div onClick={() => onOpenAdvocate(a.id)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                        <Avatar name={a.name} size={30} grade={a.grade} />
                        <div><div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)" }}>{a.name}</div><div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>{c.name}</div></div>
                      </div>
                    </td>
                    <td style={tdE}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{call.scenario}</span></td>
                    <td style={tdE}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--body-strong-sm)", color: call.cutoff ? "var(--text-critical)" : "var(--text-default)" }}>
                        <NIcon.clock s={14} />{fmtDur(call.durationSec)}
                      </span>
                    </td>
                    <td style={tdE}><span style={{ font: "var(--body-regular-sm)", color: call.cutoff ? "var(--text-critical)" : "var(--text-weak)" }}>{call.endReason}</span></td>
                    <td style={{ ...tdE, textAlign: "center" }}>
                      {call.mom != null ? <span style={{ font: "var(--body-strong-sm)", color: momColor(call.mom) }}>{call.mom.toFixed(1)}</span>
                        : <span style={{ font: "var(--label-xs)", fontWeight: 700, color: "var(--text-warning)", background: "var(--background-warning-subtle)", borderRadius: 999, padding: "3px 9px" }}>Failed</span>}
                    </td>
                    <td style={tdE}><a onClick={() => setAcsCall(call)} style={eLink}>{call.acsId} <NIcon.ext s={13} /></a></td>
                    <td style={tdE}><span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{call.date}</span></td>
                    <td style={{ ...tdE, textAlign: "right", whiteSpace: "nowrap" }}>
                      {omitted
                        ? <button style={eRestoreBtn} onClick={() => store.restoreCall(call.id)}>Restore</button>
                        : <button style={eOmitBtn} onClick={() => setOmitFor(call)}>Omit call</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <EmptyState title="Nothing here" sub={tab === "omitted" ? "No calls have been omitted yet." : "No calls in this bucket."} />}
      </Panel>

      {acsCall && <ACSModal call={acsCall} onClose={() => setAcsCall(null)} />}
      {omitFor && <OmitModal call={omitFor} onClose={() => setOmitFor(null)} onConfirm={(reason) => { store.omitCall(omitFor.id, reason); const a = advocateById(omitFor.advId)!; nestToast(`Call omitted from ${a.name.split(" ")[0]}'s scoring`, "success"); setOmitFor(null); }} />}
    </NestShell>
  );
};

// ---- ACS transcript / MOM preview modal ----
const ACSModal = ({ call, onClose }: { call: Call; onClose: () => void }) => {
  const a = advocateById(call.advId)!;
  const lines = transcriptFor(call);
  return (
    <div style={eScrim} onClick={onClose}>
      <div style={eModal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <div style={{ font: "var(--heading-sm)", color: "var(--text-strong)" }}>{call.acsId}</div>
            <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>{a.name} · {call.scenario} · {fmtDur(call.durationSec)} · {call.date}</div>
          </div>
          <button style={eClose} onClick={onClose}><NIcon.x s={18} /></button>
        </div>
        <div style={{ padding: 22, overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div style={eSectionLabel}>Transcript</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              {lines.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <span style={{ font: "var(--label-xs)", fontWeight: 700, color: l.who === "Advocate" ? "var(--text-primary)" : l.who === "System" ? "var(--text-critical)" : "var(--text-weak)", width: 72, flexShrink: 0, textTransform: "uppercase", letterSpacing: ".03em", paddingTop: 2 }}>{l.who}</span>
                  <span style={{ font: "var(--body-regular-sm)", color: l.who === "System" ? "var(--text-critical)" : "var(--text-default)", fontStyle: l.who === "System" ? "italic" : "normal" }}>{l.t}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={eSectionLabel}>MOM score</div>
            {call.mom != null ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ font: "var(--heading-md)", fontWeight: 800, color: momColor(call.mom) }}>{call.mom.toFixed(1)}</span>
                  <span style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>/ 5 overall</span>
                </div>
                <CatBars cats={CATEGORIES.map((cat) => ({ ...cat, val: a.cats[cat.key] }))} max={5} labelCol={150} />
              </div>
            ) : (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 9, font: "var(--body-regular-sm)", color: "var(--text-critical)" }}>
                <NIcon.alert s={16} /> {call.cutoff ? "Call ended below the 3-minute scoring threshold — no MOM score generated." : "MOM scoring failed for this call — flagged for review."}
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button style={eGhost} onClick={onClose}>Close</button>
          <a style={eGhost} onClick={() => nestToast("Opening full record in ACS…")}><NIcon.ext s={15} /> Open in ACS</a>
        </div>
      </div>
    </div>
  );
};

// ---- Omit-with-reason modal ----
const OmitModal = ({ call, onClose, onConfirm }: { call: Call; onClose: () => void; onConfirm: (reason: string) => void }) => {
  const a = advocateById(call.advId)!;
  const [reason, setReason] = useState(OMIT_REASONS[0]);
  const [note, setNote] = useState("");
  return (
    <div style={eScrim} onClick={onClose}>
      <div style={{ ...eModal, maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "20px 22px 0" }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--background-warning-subtle)", color: "var(--text-warning)", display: "grid", placeItems: "center", border: "1.5px solid var(--reference-yellow-500)" }}><NIcon.alert s={22} /></div>
          <h3 style={{ margin: "14px 0 6px", font: "var(--heading-sm)", color: "var(--text-strong)" }}>Omit this call from scoring?</h3>
          <p style={{ margin: 0, font: "var(--body-regular-sm)", color: "var(--text-weak)", lineHeight: 1.5 }}>
            {call.acsId} · {a.name}. This removes the call from their official MOM average. Choose a reason:
          </p>
        </div>
        <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
          {OMIT_REASONS.map((r) => (
            <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", border: `1px solid ${reason === r ? "var(--brand-primary)" : "var(--border-subtle)"}`, background: reason === r ? "var(--background-primary-subtle)" : "var(--canvas-default)" }}>
              <input type="radio" name="omit-reason" checked={reason === r} onChange={() => setReason(r)} style={{ accentColor: "var(--brand-primary)" }} />
              <span style={{ font: "var(--body-regular-sm)", color: "var(--text-default)" }}>{r}</span>
            </label>
          ))}
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (optional)" style={{ marginTop: 4, height: 40, padding: "0 14px", borderRadius: 8, border: "1px solid var(--border-default)", font: "var(--body-regular-sm)", outline: "none" }} />
        </div>
        <div style={{ padding: "0 22px 20px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button style={eGhost} onClick={onClose}>Cancel</button>
          <button style={eOmitConfirm} onClick={() => onConfirm(note ? `${reason} — ${note}` : reason)}>Omit call</button>
        </div>
      </div>
    </div>
  );
};

const tdE: React.CSSProperties = { padding: "12px 16px", verticalAlign: "middle" };
const eLink: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, font: "var(--body-link-sm)", color: "var(--text-primary)", cursor: "pointer", whiteSpace: "nowrap" };
const eOmitBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 14px", borderRadius: 999, border: "1px solid var(--reference-yellow-500)", background: "var(--background-warning-subtle)", color: "var(--text-warning)", font: "var(--label-sm)", cursor: "pointer" };
const eRestoreBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 14px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-sm)", cursor: "pointer" };
const eScrim: React.CSSProperties = { position: "fixed", inset: 0, background: "var(--canvas-overlay, rgba(20,40,60,.55))", display: "grid", placeItems: "center", zIndex: 70, padding: 20 };
const eModal: React.CSSProperties = { background: "var(--canvas-default)", borderRadius: "var(--border-radius-xl)", width: "100%", maxWidth: 620, maxHeight: "86vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(13,55,94,.3)", overflow: "hidden" };
const eClose: React.CSSProperties = { width: 36, height: 36, borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--icon-default)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
const eSectionLabel: React.CSSProperties = { font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 };
const eGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, height: 40, padding: "0 18px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer" };
const eOmitConfirm: React.CSSProperties = { height: 40, padding: "0 20px", borderRadius: 999, border: "none", background: "var(--background-warning)", color: "var(--brand-secondary)", font: "var(--label-md)", fontWeight: 700, cursor: "pointer" };
