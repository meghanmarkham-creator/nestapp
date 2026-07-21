// Shared "scores travel with people" logic (ported from app/dashboard.jsx).
// deriveStats computes a class's rollup from an arbitrary advocate list, so a
// reassigned advocate's scores follow them to their destination class.

import { CATEGORIES, GRADES, advocateById, gradeOf } from "./nest-data";
import type { Advocate, CatScore, GradeLetter } from "./types";
import type { StoreState } from "./store";

export interface DerivedStats {
  avg: number;
  grade: (typeof GRADES)[GradeLetter];
  dist: Record<GradeLetter, number>;
  strength: CatScore;
  opportunity: CatScore;
}

export function deriveStats(advs: Advocate[]): DerivedStats {
  if (!advs || !advs.length) {
    return {
      avg: 0,
      grade: GRADES.D,
      dist: { A: 0, B: 0, C: 0, D: 0 },
      strength: { ...CATEGORIES[0], val: 0 },
      opportunity: { ...CATEGORIES[0], val: 0 },
    };
  }
  const avg = Math.round(advs.reduce((s, a) => s + a.composite, 0) / advs.length);
  const dist: Record<GradeLetter, number> = { A: 0, B: 0, C: 0, D: 0 };
  advs.forEach((a) => dist[a.grade]++);
  const cats: CatScore[] = CATEGORIES.map((cat) => ({ ...cat, val: advs.reduce((s, a) => s + a.cats[cat.key], 0) / advs.length }));
  const sorted = [...cats].sort((a, b) => b.val - a.val);
  return { avg, grade: gradeOf(avg), dist, strength: sorted[0], opportunity: sorted[sorted.length - 1] };
}

/** Resolve an advocate id to a scored advocate, or a manual (unscored) record. */
export function resolveAdv(id: string, S: StoreState): Advocate | { id: string; name: string; email: string; level: string } | null {
  return advocateById(id) || (S.manualAdvocates || []).find((m) => m.id === id) || null;
}
