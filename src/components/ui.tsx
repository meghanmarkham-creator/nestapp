"use client";

// The Nest — shared UI atoms (ported from app/ui.jsx).
// Dropdown, Segmented, Avatar, StatusBadge, LevelTag, EmptyState, TrainerAvatar,
// TrainerChip, StatusDot, ToastHost, initials.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GRADES, TRAINER_STATUSES } from "@/lib/nest-data";
import type { GradeLetter, Trainer } from "@/lib/types";
import { registerToast, type ToastTone } from "@/lib/toast";
import { NIcon } from "./icons";

export const initials = (name: string) =>
  name.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

export interface Option<T = string> { value: T; label: string; hint?: string; count?: number }

export function Dropdown<T extends string = string>({ value, options, onChange, placeholder = "Select", icon, width = 220, align = "left" }: { value: T; options: Option<T>[]; onChange: (v: T) => void; placeholder?: string; icon?: ReactNode; width?: number; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const current = options.find((o) => o.value === value);
  return (
    <div ref={ref} style={{ position: "relative", width }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", height: 40, padding: "0 12px 0 14px", borderRadius: 999, border: `1px solid ${open ? "var(--brand-primary)" : "var(--border-default)"}`, background: "var(--canvas-default)", color: "var(--text-strong)", font: "var(--label-md)", cursor: "pointer" }}>
        {icon && <span style={{ color: "var(--icon-default)", display: "inline-flex" }}>{icon}</span>}
        <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{current ? current.label : placeholder}</span>
        <span style={{ color: "var(--icon-default)", display: "inline-flex", transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}><NIcon.chevDown s={16} /></span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: 46, [align]: 0, minWidth: "100%", zIndex: 30, background: "var(--canvas-default)", border: "1px solid var(--border-subtle)", borderRadius: "var(--border-radius-md)", boxShadow: "0 12px 32px rgba(13,55,94,.16)", padding: 6, maxHeight: 320, overflowY: "auto" }}>
          {options.map((o) => {
            const sel = o.value === value;
            return (
              <div key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", background: sel ? "var(--background-primary-subtle)" : "transparent", color: sel ? "var(--text-primary)" : "var(--text-default)", font: sel ? "var(--body-strong-sm)" : "var(--body-regular-sm)" }}
                onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = "var(--canvas-muted)"; }}
                onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ flex: 1 }}>{o.label}</span>
                {o.hint && <span style={{ font: "var(--body-regular-xs)", color: "var(--text-weak)" }}>{o.hint}</span>}
                {sel && <span style={{ color: "var(--text-primary)", display: "inline-flex" }}><NIcon.check s={15} /></span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Segmented<T extends string = string>({ value, options, onChange }: { value: T; options: Option<T>[]; onChange: (v: T) => void }) {
  return (
    <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{ font: "var(--label-md)", padding: "7px 15px", borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap", border: on ? "1px solid var(--brand-primary)" : "1px solid var(--border-default)", background: on ? "var(--background-primary-subtle)" : "var(--canvas-default)", color: on ? "var(--text-primary)" : "var(--text-default)" }}>
            {o.label}{o.count != null && <span style={{ marginLeft: 7, opacity: 0.7 }}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export const Avatar = ({ name, size = 36, grade }: { name: string; size?: number; grade?: GradeLetter }) => {
  const g = grade ? GRADES[grade] : null;
  return (
    <div style={{ width: size, height: size, borderRadius: 999, flexShrink: 0, background: g ? g.subtle : "var(--reference-slate-100)", color: g ? g.text : "var(--text-strong)", border: g ? `1.5px solid ${g.fill}` : "none", display: "grid", placeItems: "center", font: "var(--label-xs)", fontWeight: 700, fontSize: size * 0.34 }}>{initials(name)}</div>
  );
};

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  Graduating: { background: "var(--background-success-subtle)", color: "var(--text-success)" },
  "In training": { background: "var(--background-informational-subtle)", color: "var(--text-informational)" },
  Onboarding: { background: "var(--reference-slate-100)", color: "var(--text-default)" },
  Graduated: { background: "var(--background-success-subtle)", color: "var(--text-success)" },
};
export const StatusBadge = ({ status }: { status: string }) => (
  <span style={{ font: "var(--label-xs)", fontWeight: 700, borderRadius: 999, padding: "4px 10px", whiteSpace: "nowrap", ...(STATUS_STYLE[status] || STATUS_STYLE.Onboarding) }}>{status}</span>
);

export const LEVEL_COLOR: Record<string, string> = {
  "New Hire": "var(--reference-blue-500)",
  CAII: "var(--reference-indigo-500)",
  Senior: "var(--reference-green-500)",
  Digi: "var(--reference-orange-500)",
  "Exec Res": "var(--reference-violet-500)",
};
export const LevelTag = ({ level }: { level: string }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--label-xs)", fontWeight: 600, color: "var(--text-default)", whiteSpace: "nowrap" }}>
    <span style={{ width: 7, height: 7, borderRadius: 2, background: LEVEL_COLOR[level] || "var(--reference-slate-400)" }} />{level}
  </span>
);

export const EmptyState = ({ title, sub }: { title: string; sub?: string }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 20px", textAlign: "center" }}>
    <div style={{ font: "var(--body-strong-md)", color: "var(--text-strong)" }}>{title}</div>
    {sub && <div style={{ font: "var(--body-regular-sm)", color: "var(--text-weak)", marginTop: 6, maxWidth: 360 }}>{sub}</div>}
  </div>
);

export const TrainerAvatar = ({ name, size = 36 }: { name: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: 10, flexShrink: 0, background: "var(--brand-secondary)", color: "#fff", display: "grid", placeItems: "center", font: "var(--label-xs)", fontWeight: 800, fontSize: size * 0.34, boxShadow: "inset 0 0 0 1.5px var(--brand-tertiary)" }}>{initials(name)}</div>
);

export const TrainerChip = ({ trainer, onRemove, draggable, onDragStart, compact }: { trainer: Trainer; onRemove?: () => void; draggable?: boolean; onDragStart?: (e: React.DragEvent) => void; compact?: boolean }) => (
  <div draggable={draggable} onDragStart={onDragStart} style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: compact ? "5px 10px 5px 6px" : "7px 12px 7px 7px", borderRadius: 999, background: "var(--brand-secondary)", color: "#fff", boxShadow: "inset 0 0 0 1.5px var(--brand-tertiary)", cursor: draggable ? "grab" : "default", whiteSpace: "nowrap" }}>
    <TrainerAvatar name={trainer.name} size={compact ? 22 : 26} />
    <span style={{ font: "var(--body-strong-sm)" }}>{trainer.name}</span>
    {trainer.role && <span style={{ font: "var(--label-xs)", color: "var(--brand-tertiary)", fontWeight: 700 }}>{trainer.role}</span>}
    {onRemove && <span onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ display: "inline-flex", cursor: "pointer", opacity: 0.7 }}><NIcon.x s={14} /></span>}
  </div>
);

export const StatusDot = ({ statusKey }: { statusKey: string }) => {
  const s = TRAINER_STATUSES.find((x) => x.key === statusKey) || TRAINER_STATUSES[0];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, font: "var(--label-sm)", fontWeight: 600, color: "var(--text-default)", background: "var(--canvas-muted)", borderRadius: 999, padding: "5px 12px", whiteSpace: "nowrap" }}>
      <span style={{ width: 9, height: 9, borderRadius: 999, background: s.color }} />{s.label}
    </span>
  );
};

export const ToastHost = () => {
  const [toasts, setToasts] = useState<{ id: string; msg: string; tone: ToastTone }[]>([]);
  useEffect(() => {
    registerToast((msg, tone = "default") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, msg, tone }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    });
  }, []);
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", gap: 8, zIndex: 90, alignItems: "center" }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 18px", borderRadius: 999, background: t.tone === "success" ? "var(--background-success)" : "var(--brand-secondary)", color: "#fff", font: "var(--body-strong-sm)", boxShadow: "0 8px 24px rgba(13,55,94,.28)", animation: "cdFade .18s ease" }}>
          {t.tone === "success" && <NIcon.check s={16} />}{t.msg}
        </div>
      ))}
    </div>
  );
};
