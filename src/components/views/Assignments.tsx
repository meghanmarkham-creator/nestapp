"use client";

// Class Assignments (admin) — advocate pool, create class, drag-and-drop
// advocates + trainers into classes. Ported from app/assignments.jsx.
// Props: { onNav, search, onSearch }.

import { useState, type ReactNode } from "react";
import { LEVELS, TRAINERS, advocateById, allAdvocates, trainerById } from "@/lib/nest-data";
import { NestShell, Panel } from "@/components/shell";
import { NIcon } from "@/components/icons";
import { Avatar, EmptyState, LevelTag, TrainerChip } from "@/components/ui";
import { useStore } from "@/lib/store";
import { nestToast } from "@/lib/toast";

interface ViewProps {
  onNav: (key: string) => void;
  search: string;
  onSearch: (v: string) => void;
}

export const ClassAssignmentsView = ({ onNav, search, onSearch }: ViewProps) => {
  const store = useStore();
  const S = store.get();
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [dragAdv, setDragAdv] = useState<string | null>(null);
  const [overClass, setOverClass] = useState<string | null>(null);

  // Advocate pool = org-query advocates not yet assigned to a custom class + manual adds.
  // (Represents the Workday org pull the user described.)
  const assignedIds = new Set(Object.keys(S.assignments));
  const manual = S.manualAdvocates.map((m) => ({ ...m, manual: true, grade: null }));
  const orgPool = allAdvocates.filter((a) => !assignedIds.has(a.id) && !store.isGraduated(a.id));
  const pool: any[] = [...manual.filter((m) => !assignedIds.has(m.id)), ...orgPool]
    .filter((a: any) => !q || a.name.toLowerCase().includes(q.toLowerCase()) || (a.email || "").toLowerCase().includes(q.toLowerCase()));

  const advName = (id: string): string => (advocateById(id) || S.manualAdvocates.find((m) => m.id === id) || ({} as any)).name || id;
  const advObj = (id: string): any => advocateById(id) || S.manualAdvocates.find((m) => m.id === id);

  const drop = (classId: string) => {
    if (dragAdv) { store.assignAdvocate(dragAdv, classId); nestToast(`${advName(dragAdv).split(" ")[0]} added to class`, "success"); }
    setDragAdv(null); setOverClass(null);
  };

  return (
    <NestShell active="assign" title="Class Assignments" subtitle="Build cohorts from the org roster — drag advocates and a trainer into a class" onNav={onNav} searchValue={search} onSearch={onSearch}
      actions={<>
        <button style={aGhost} onClick={() => setAdding(true)}><NIcon.plus s={16} /> Add student</button>
        <button style={aPrimary} onClick={() => setCreating(true)}><NIcon.plus s={16} /> Create new class</button>
      </>}>

      <div style={{ display: "grid", gridTemplateColumns: "320px minmax(0,1fr)", gap: 24, alignItems: "start" }}>
        {/* Advocate pool */}
        <div style={{ position: "sticky", top: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel title="Advocate pool" subtitle="From Workday org query — unassigned" pad={16}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 12px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)" }}>
              <NIcon.search s={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" style={{ border: "none", outline: "none", background: "transparent", font: "var(--body-regular-sm)", width: "100%" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 560, overflowY: "auto", paddingRight: 2 }}>
              {pool.map((a) => (
                <div key={a.id} draggable onDragStart={() => setDragAdv(a.id)} onDragEnd={() => { setDragAdv(null); setOverClass(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, border: "1px solid var(--border-subtle)", background: dragAdv === a.id ? "var(--background-primary-subtle)" : "var(--canvas-default)", cursor: "grab" }}>
                  <span style={{ color: "var(--icon-subtle)", display: "inline-flex" }}><NIcon.grip s={16} /></span>
                  <Avatar name={a.name} size={30} grade={a.grade} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ font: "var(--body-strong-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                    <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.email || `${a.name.toLowerCase().replace(/[^a-z]/g, ".")}@carvana.com`}</div>
                  </div>
                  {a.manual && <span style={{ font: "var(--label-xs)", fontWeight: 700, color: "var(--text-informational)", background: "var(--background-informational-subtle)", borderRadius: 999, padding: "2px 8px" }}>New</span>}
                </div>
              ))}
              {pool.length === 0 && <div style={{ padding: "24px 8px", textAlign: "center", font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>Everyone&apos;s assigned. Nice.</div>}
            </div>
          </Panel>
          <div style={{ display: "flex", alignItems: "center", gap: 8, font: "var(--body-regular-xs)", color: "var(--text-weak)", padding: "0 4px" }}>
            <NIcon.grip s={14} /> Drag a card onto a class card to assign.
          </div>
        </div>

        {/* Classes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* trainer rail */}
          <Panel title="Nest trainers" subtitle="Drag a trainer onto a class to assign them as coach" pad={16}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {TRAINERS.filter((t) => !t.role).map((t) => (
                <div key={t.id} draggable onDragStart={(e: React.DragEvent) => { e.dataTransfer.setData("trainer", t.id); setDragAdv(null); }}>
                  <TrainerChip trainer={t} draggable />
                </div>
              ))}
            </div>
          </Panel>

          {/* custom classes */}
          {S.customClasses.length === 0 && (
            <Panel><EmptyState title="No classes created yet" sub="Create a class like “New Hire 7/6”, then drag advocates and a trainer into it. It'll appear on the Readiness tab filtered by its cohort start date." /></Panel>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {S.customClasses.map((cls) => {
              const trainer = cls.trainerId ? trainerById(cls.trainerId) : null;
              const isOver = overClass === cls.id;
              return (
                <div key={cls.id}
                  onDragOver={(e) => { e.preventDefault(); setOverClass(cls.id); }}
                  onDragLeave={() => setOverClass((o) => (o === cls.id ? null : o))}
                  onDrop={(e) => { const tid = e.dataTransfer.getData("trainer"); if (tid) { store.assignTrainer(cls.id, tid); nestToast(`${trainerById(tid)?.name} assigned to ${cls.name}`, "success"); setOverClass(null); } else drop(cls.id); }}
                  style={{ background: "var(--canvas-default)", border: `1.5px ${isOver ? "dashed" : "solid"} ${isOver ? "var(--brand-primary)" : "var(--border-subtle)"}`, borderRadius: "var(--border-radius-lg)", padding: 18, display: "flex", flexDirection: "column", gap: 14, transition: "border-color .12s" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ font: "var(--heading-sm)", color: "var(--text-strong)" }}>{cls.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                        <LevelTag level={cls.level} />
                        <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>· Starts {cls.startLabel}</span>
                      </div>
                    </div>
                    <button style={aTrash} onClick={() => { store.deleteClass(cls.id); nestToast("Class deleted"); }} title="Delete class"><NIcon.x s={15} /></button>
                  </div>

                  {/* trainer slot */}
                  <div>
                    <div style={aSlotLabel}>Trainer</div>
                    {trainer ? (
                      <div style={{ marginTop: 6 }}><TrainerChip trainer={trainer} compact onRemove={() => store.assignTrainer(cls.id, null as any)} /></div>
                    ) : (
                      <div style={{ marginTop: 6, border: "1.5px dashed var(--border-default)", borderRadius: 10, padding: "10px 12px", font: "var(--body-regular-sm)", color: "var(--text-weak)", textAlign: "center" }}>Drop a trainer here</div>
                    )}
                  </div>

                  {/* advocate slot */}
                  <div>
                    <div style={aSlotLabel}>Advocates · {cls.advocateIds.length}</div>
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6, minHeight: 44 }}>
                      {cls.advocateIds.map((id) => {
                        const a = advObj(id);
                        if (!a) return null;
                        return (
                          <div key={id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 8, background: "var(--canvas-muted)" }}>
                            <Avatar name={a.name} size={26} grade={a.grade} />
                            <span style={{ flex: 1, font: "var(--body-strong-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</span>
                            <span onClick={() => store.unassignAdvocate(id)} style={{ display: "inline-flex", cursor: "pointer", color: "var(--icon-subtle)" }}><NIcon.x s={14} /></span>
                          </div>
                        );
                      })}
                      {cls.advocateIds.length === 0 && (
                        <div style={{ border: "1.5px dashed var(--border-default)", borderRadius: 10, padding: "12px", font: "var(--body-regular-sm)", color: "var(--text-weak)", textAlign: "center" }}>Drag advocates here</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {creating && <CreateClassModal onClose={() => setCreating(false)} onCreate={(payload) => { store.createClass(payload); nestToast(`Class “${payload.name}” created`, "success"); setCreating(false); }} />}
      {adding && <AddStudentModal onClose={() => setAdding(false)} onAdd={(payload) => { store.addManualAdvocate(payload); nestToast(`${payload.name} added to the pool`, "success"); setAdding(false); }} />}
    </NestShell>
  );
};

// ---- Create class modal ----
interface CreateClassPayload { name: string; level: string; startKey: string; startLabel: string }
export const CreateClassModal = ({ onClose, onCreate }: { onClose: () => void; onCreate: (payload: CreateClassPayload) => void }) => {
  const [level, setLevel] = useState("New Hire");
  const [date, setDate] = useState("2026-07-06");
  const autoName = () => { const d = new Date(date + "T00:00:00"); return `${level} ${d.getMonth() + 1}/${d.getDate()}`; };
  const [name, setName] = useState("");
  const finalName = name.trim() || autoName();
  return (
    <div style={eScrim2} onClick={onClose}>
      <div style={aModal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 4px", font: "var(--heading-sm)", color: "var(--text-strong)" }}>Create new class</h3>
        <p style={{ margin: "0 0 18px", font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>It'll show on the Readiness tab under its cohort start date.</p>
        <Field label="Class level">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)} style={{ font: "var(--label-md)", padding: "7px 14px", borderRadius: 999, cursor: "pointer", border: level === l ? "1px solid var(--brand-primary)" : "1px solid var(--border-default)", background: level === l ? "var(--background-primary-subtle)" : "var(--canvas-default)", color: level === l ? "var(--text-primary)" : "var(--text-default)" }}>{l}</button>
            ))}
          </div>
        </Field>
        <Field label="Cohort start date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={aInput} />
        </Field>
        <Field label="Class name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={autoName()} style={aInput} />
          <div style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)", marginTop: 6 }}>Leave blank to use “{autoName()}”.</div>
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button style={aGhost} onClick={onClose}>Cancel</button>
          <button style={aPrimary} onClick={() => { const d = new Date(date + "T00:00:00"); onCreate({ name: finalName, level, startKey: date, startLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }); }}>Create class</button>
        </div>
      </div>
    </div>
  );
};

// ---- Add student modal ----
interface AddStudentPayload { name: string; email: string; level: string }
export const AddStudentModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (payload: AddStudentPayload) => void }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("New Hire");
  const valid = name.trim() && email.trim();
  return (
    <div style={eScrim2} onClick={onClose}>
      <div style={aModal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 4px", font: "var(--heading-sm)", color: "var(--text-strong)" }}>Add student</h3>
        <p style={{ margin: "0 0 18px", font: "var(--body-regular-sm)", color: "var(--text-weak)" }}>Manually add someone not in the org query. They'll join the advocate pool.</p>
        <Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Ellis" style={aInput} /></Field>
        <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan.ellis@carvana.com" style={aInput} /></Field>
        <Field label="Level">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)} style={{ font: "var(--label-md)", padding: "7px 14px", borderRadius: 999, cursor: "pointer", border: level === l ? "1px solid var(--brand-primary)" : "1px solid var(--border-default)", background: level === l ? "var(--background-primary-subtle)" : "var(--canvas-default)", color: level === l ? "var(--text-primary)" : "var(--text-default)" }}>{l}</button>
            ))}
          </div>
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button style={aGhost} onClick={onClose}>Cancel</button>
          <button style={{ ...aPrimary, opacity: valid ? 1 : 0.5, pointerEvents: valid ? "auto" : "none" }} onClick={() => onAdd({ name: name.trim(), email: email.trim(), level })}>Add student</button>
        </div>
      </div>
    </div>
  );
};

export const Field = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ font: "var(--label-sm)", color: "var(--text-strong)", fontWeight: 600, marginBottom: 8 }}>{label}</div>
    {children}
  </div>
);

const aGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px", borderRadius: 999, border: "1px solid var(--border-default)", background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer" };
const aPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 18px", borderRadius: 999, border: "none", background: "var(--background-primary)", color: "#fff", font: "var(--label-md)", cursor: "pointer" };
const aTrash: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--canvas-default)", color: "var(--icon-subtle)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
const aSlotLabel: React.CSSProperties = { font: "var(--label-xs)", color: "var(--text-weak)", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 };
const aInput: React.CSSProperties = { width: "100%", height: 42, padding: "0 14px", borderRadius: 8, border: "1px solid var(--border-default)", font: "var(--body-regular-md)", outline: "none", boxSizing: "border-box" };
const eScrim2: React.CSSProperties = { position: "fixed", inset: 0, background: "var(--canvas-overlay, rgba(20,40,60,.55))", display: "grid", placeItems: "center", zIndex: 70, padding: 20 };
const aModal: React.CSSProperties = { background: "var(--canvas-default)", borderRadius: "var(--border-radius-xl)", padding: 26, width: "100%", maxWidth: 460, boxShadow: "0 24px 60px rgba(13,55,94,.3)" };
