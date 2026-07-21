// Nest — persistent action store (localStorage). Survives refresh.
// Exposes window.Store (imperative) + window.useStore() (React hook).
// All user actions (omit calls, log/complete coaching, create classes,
// assign advocates/trainers, statuses, graduate, release) live here.

(() => {
  const KEY = "nest_store_v2";
  const DEFAULT = {
    omits: {},            // callId -> { reason, at }
    logs: {},             // coachingId -> { notes, status:'complete'|'incomplete', completedAt }
    extraCoachings: [],    // [{ id, advId, kind, focus, trainerId, assignee, date, priority, source }]
    customClasses: [],     // [{ id, name, level, startKey, startLabel, trainerId, advocateIds:[] }]
    assignments: {},       // advId -> classId  (override of home cohort; used by custom classes)
    manualAdvocates: [],   // [{ id, name, email, level }]
    trainerStatus: {},     // trainerId -> statusKey
    trainerStatusAt: {},   // trainerId -> ISO time
    graduated: {},         // advId -> { at, classId }
    released: {},          // advId -> { at }
  };

  let state = load();
  const subs = new Set();

  function load() {
    try { return { ...structuredClone(DEFAULT), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
    catch (e) { return structuredClone(DEFAULT); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function emit() { subs.forEach(f => f()); }
  function commit(next) { state = next; save(); emit(); }
  const now = () => new Date().toISOString();
  const uid = (p) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

  const Store = {
    get: () => state,
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
    reset: () => commit(structuredClone(DEFAULT)),

    // --- AI Efficiency ---
    omitCall(callId, reason) { commit({ ...state, omits: { ...state.omits, [callId]: { reason, at: now() } } }); },
    restoreCall(callId) { const o = { ...state.omits }; delete o[callId]; commit({ ...state, omits: o }); },
    isOmitted(callId) { return !!state.omits[callId]; },

    // --- Coaching ---
    // a log holds: { notes, coachId, strengths:[{key,note}], opportunities:[{key,note}], status, completedAt }
    logKey: (id) => id,
    getLog(id) { return state.logs[id] || { notes: "", coachId: null, strengths: [], opportunities: [], status: "incomplete", completedAt: null }; },
    saveCoachingNotes(id, patch) {
      const prev = state.logs[id] || { status: "incomplete", completedAt: null, strengths: [], opportunities: [] };
      commit({ ...state, logs: { ...state.logs, [id]: { ...prev, ...patch } } });
    },
    completeCoaching(id, patch) {
      const prev = state.logs[id] || { strengths: [], opportunities: [] };
      commit({ ...state, logs: { ...state.logs, [id]: { ...prev, ...patch, status: "complete", completedAt: now() } } });
    },
    reopenCoaching(id) {
      const prev = state.logs[id] || {};
      commit({ ...state, logs: { ...state.logs, [id]: { ...prev, status: "incomplete", completedAt: null } } });
    },
    addCoaching(rec) {
      const id = rec.id || uid("cx");
      commit({ ...state, extraCoachings: [{ id, date: window.NEST?.fmt?.fmtDate(new Date()) || "Today", ...rec }, ...state.extraCoachings] });
      return id;
    },

    // --- Class Assignments ---
    createClass({ name, level, startKey, startLabel, trainerId }) {
      const id = uid("cc");
      commit({ ...state, customClasses: [...state.customClasses, { id, name, level, startKey, startLabel, trainerId: trainerId || null, advocateIds: [] }] });
      return id;
    },
    deleteClass(id) { commit({ ...state, customClasses: state.customClasses.filter(c => c.id !== id) }); },
    assignTrainer(classId, trainerId) {
      commit({ ...state, customClasses: state.customClasses.map(c => c.id === classId ? { ...c, trainerId } : c) });
    },
    assignAdvocate(advId, classId) {
      const customClasses = state.customClasses.map(c => ({ ...c, advocateIds: c.advocateIds.filter(x => x !== advId) }));
      const target = customClasses.find(c => c.id === classId);
      if (target) target.advocateIds = [...target.advocateIds, advId];
      commit({ ...state, customClasses, assignments: { ...state.assignments, [advId]: classId } });
    },
    unassignAdvocate(advId) {
      const customClasses = state.customClasses.map(c => ({ ...c, advocateIds: c.advocateIds.filter(x => x !== advId) }));
      const a = { ...state.assignments }; delete a[advId];
      commit({ ...state, customClasses, assignments: a });
    },
    addManualAdvocate({ name, email, level }) {
      const id = uid("ma");
      commit({ ...state, manualAdvocates: [...state.manualAdvocates, { id, name, email, level: level || "New Hire" }] });
      return id;
    },

    // --- Trainers ---
    setTrainerStatus(trainerId, status) {
      commit({ ...state, trainerStatus: { ...state.trainerStatus, [trainerId]: status }, trainerStatusAt: { ...state.trainerStatusAt, [trainerId]: now() } });
    },

    // --- Report cards ---
    graduate(advId, classId) { commit({ ...state, graduated: { ...state.graduated, [advId]: { at: now(), classId } } }); },
    graduateMany(pairs) {
      const g = { ...state.graduated };
      pairs.forEach(([advId, classId]) => { g[advId] = { at: now(), classId }; });
      commit({ ...state, graduated: g });
    },
    isGraduated(advId) { return !!state.graduated[advId]; },
    release(advId) {
      if (state.released[advId]) return;
      const a = window.NEST?.advocateById(advId);
      const rec = {
        id: uid("rel"), advId, kind: "Release review", assignee: "Shelby Gary",
        assigneeId: "t-gary", focus: a ? a.opportunity.label : "Performance review",
        date: window.NEST?.fmt?.fmtDate(new Date()) || "Today", priority: true, source: "release",
      };
      commit({ ...state, released: { ...state.released, [advId]: { at: now() } }, extraCoachings: [rec, ...state.extraCoachings] });
      return rec.id;
    },
    isReleased(advId) { return !!state.released[advId]; },
  };

  window.Store = Store;
  window.useStore = function useStore() {
    const [, force] = React.useReducer(x => x + 1, 0);
    React.useEffect(() => Store.subscribe(force), []);
    return Store;
  };
})();
