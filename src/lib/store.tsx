"use client";

// The Nest — persistent action store (localStorage). Survives refresh.
// Ported from app/store.jsx. All user actions (omit calls, log/complete coaching,
// create classes, assign advocates/trainers, statuses, graduate, release) live here.
//
// PRODUCTION NOTE: this method surface is the mutation/API spec. In production these
// become server actions / API routes writing to Snowflake + the coaching backend.
// TODO: replace localStorage persistence with real API mutations.

import { useEffect, useReducer } from "react";
import { advocateById, fmt } from "./nest-data";
import type { CoachingLog } from "./types";

const KEY = "nest_store_v2";

export interface StoreState {
  omits: Record<string, { reason: string; at: string }>;
  logs: Record<string, CoachingLog>;
  extraCoachings: any[];
  customClasses: {
    id: string; name: string; level: string; startKey: string; startLabel: string;
    trainerId: string | null; advocateIds: string[];
  }[];
  assignments: Record<string, string>;
  manualAdvocates: { id: string; name: string; email: string; level: string }[];
  trainerStatus: Record<string, string>;
  trainerStatusAt: Record<string, string>;
  graduated: Record<string, { at: string; classId: string }>;
  released: Record<string, { at: string }>;
}

const DEFAULT: StoreState = {
  omits: {},
  logs: {},
  extraCoachings: [],
  customClasses: [],
  assignments: {},
  manualAdvocates: [],
  trainerStatus: {},
  trainerStatusAt: {},
  graduated: {},
  released: {},
};

const clone = <T,>(o: T): T =>
  typeof structuredClone === "function" ? structuredClone(o) : JSON.parse(JSON.stringify(o));

function load(): StoreState {
  if (typeof window === "undefined") return clone(DEFAULT);
  try {
    return { ...clone(DEFAULT), ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return clone(DEFAULT);
  }
}

let state: StoreState = clone(DEFAULT);
let hydrated = false;
const subs = new Set<() => void>();

function save() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}
function emit() {
  subs.forEach((f) => f());
}
function commit(next: StoreState) {
  state = next;
  save();
  emit();
}
const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export const Store = {
  get: () => state,
  subscribe(fn: () => void) {
    subs.add(fn);
    return () => {
      subs.delete(fn);
    };
  },
  /** Load persisted state from localStorage (client only, idempotent). */
  hydrate() {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    state = load();
    emit();
  },
  reset: () => commit(clone(DEFAULT)),

  // --- AI Efficiency ---
  omitCall(callId: string, reason: string) {
    commit({ ...state, omits: { ...state.omits, [callId]: { reason, at: now() } } });
  },
  restoreCall(callId: string) {
    const o = { ...state.omits };
    delete o[callId];
    commit({ ...state, omits: o });
  },
  isOmitted(callId: string) {
    return !!state.omits[callId];
  },

  // --- Coaching ---
  logKey: (id: string) => id,
  getLog(id: string): CoachingLog {
    return (
      state.logs[id] || {
        notes: "", coachId: null, strengths: [], opportunities: [],
        status: "incomplete", completedAt: null,
      }
    );
  },
  saveCoachingNotes(id: string, patch: Partial<CoachingLog>) {
    const prev = state.logs[id] || { notes: "", coachId: null, status: "incomplete", completedAt: null, strengths: [], opportunities: [] };
    commit({ ...state, logs: { ...state.logs, [id]: { ...prev, ...patch } } });
  },
  completeCoaching(id: string, patch: Partial<CoachingLog>) {
    const prev = state.logs[id] || { notes: "", coachId: null, strengths: [], opportunities: [], status: "incomplete", completedAt: null };
    commit({ ...state, logs: { ...state.logs, [id]: { ...prev, ...patch, status: "complete", completedAt: now() } } });
  },
  reopenCoaching(id: string) {
    const prev = state.logs[id] || ({} as CoachingLog);
    commit({ ...state, logs: { ...state.logs, [id]: { ...prev, status: "incomplete", completedAt: null } } });
  },
  addCoaching(rec: any) {
    const id = rec.id || uid("cx");
    commit({ ...state, extraCoachings: [{ id, date: fmt.fmtDate(new Date()), ...rec }, ...state.extraCoachings] });
    return id;
  },

  // --- Class Assignments ---
  createClass({ name, level, startKey, startLabel, trainerId }: { name: string; level: string; startKey: string; startLabel: string; trainerId?: string | null }) {
    const id = uid("cc");
    commit({ ...state, customClasses: [...state.customClasses, { id, name, level, startKey, startLabel, trainerId: trainerId || null, advocateIds: [] }] });
    return id;
  },
  deleteClass(id: string) {
    commit({ ...state, customClasses: state.customClasses.filter((c) => c.id !== id) });
  },
  assignTrainer(classId: string, trainerId: string) {
    commit({ ...state, customClasses: state.customClasses.map((c) => (c.id === classId ? { ...c, trainerId } : c)) });
  },
  assignAdvocate(advId: string, classId: string) {
    const customClasses = state.customClasses.map((c) => ({ ...c, advocateIds: c.advocateIds.filter((x) => x !== advId) }));
    const target = customClasses.find((c) => c.id === classId);
    if (target) target.advocateIds = [...target.advocateIds, advId];
    commit({ ...state, customClasses, assignments: { ...state.assignments, [advId]: classId } });
  },
  unassignAdvocate(advId: string) {
    const customClasses = state.customClasses.map((c) => ({ ...c, advocateIds: c.advocateIds.filter((x) => x !== advId) }));
    const a = { ...state.assignments };
    delete a[advId];
    commit({ ...state, customClasses, assignments: a });
  },
  addManualAdvocate({ name, email, level }: { name: string; email: string; level?: string }) {
    const id = uid("ma");
    commit({ ...state, manualAdvocates: [...state.manualAdvocates, { id, name, email, level: level || "New Hire" }] });
    return id;
  },

  // --- Trainers ---
  setTrainerStatus(trainerId: string, status: string) {
    commit({ ...state, trainerStatus: { ...state.trainerStatus, [trainerId]: status }, trainerStatusAt: { ...state.trainerStatusAt, [trainerId]: now() } });
  },

  // --- Report cards ---
  graduate(advId: string, classId: string) {
    commit({ ...state, graduated: { ...state.graduated, [advId]: { at: now(), classId } } });
  },
  graduateMany(pairs: [string, string][]) {
    const g = { ...state.graduated };
    pairs.forEach(([advId, classId]) => {
      g[advId] = { at: now(), classId };
    });
    commit({ ...state, graduated: g });
  },
  isGraduated(advId: string) {
    return !!state.graduated[advId];
  },
  release(advId: string) {
    if (state.released[advId]) return;
    const a = advocateById(advId);
    const rec = {
      id: uid("rel"), advId, kind: "Release review", assignee: "Shelby Gary",
      assigneeId: "t-gary", focus: a ? a.opportunity.label : "Performance review",
      date: fmt.fmtDate(new Date()), priority: true, source: "release",
    };
    commit({ ...state, released: { ...state.released, [advId]: { at: now() } }, extraCoachings: [rec, ...state.extraCoachings] });
    return rec.id;
  },
  isReleased(advId: string) {
    return !!state.released[advId];
  },
};

export type NestStore = typeof Store;

/** React hook — subscribes to the store and re-renders on change. */
export function useStore(): NestStore {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    // Load persisted state, subscribe, then force one render so this component
    // reflects state that may have been hydrated before it subscribed. (Without
    // the trailing force(), a component that mounts after hydrate() emits would
    // keep showing the pre-hydration snapshot — e.g. created classes not appearing.)
    Store.hydrate();
    const unsub = Store.subscribe(force);
    force();
    return unsub;
  }, []);
  return Store;
}
