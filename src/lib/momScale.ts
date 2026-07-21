// The Nest — MOM bucket → 1–5 conversion (single source of truth).
//
// The Snowflake view exposes each criterion as a text bucket, not a raw 1–5:
//   POOR = 1–2  ·  AVERAGE = 3–4  ·  GREAT = 5
// The app auto-converts buckets to a numeric 1–5 using these midpoints, then
// averages across an advocate's simulations. Keep this in sync with the DECODE
// in lib/momSource.ts MOM_QUERY (they must express the same mapping).

export type MomBucket = "POOR" | "AVERAGE" | "GREAT";

/** Midpoint of each bucket's 1–5 range (POOR 1–2 → 1.5, AVERAGE 3–4 → 3.5, GREAT 5 → 5). */
export const MOM_BUCKET_SCORE: Record<MomBucket, number> = {
  POOR: 1.5,
  AVERAGE: 3.5,
  GREAT: 5,
};

/** Weighted average (1–5) from per-bucket counts. Returns 0 when there are no sims. */
export function bucketAvg(counts: { POOR?: number; AVERAGE?: number; GREAT?: number }): number {
  const poor = counts.POOR || 0;
  const avg = counts.AVERAGE || 0;
  const great = counts.GREAT || 0;
  const n = poor + avg + great;
  if (!n) return 0;
  const sum = poor * MOM_BUCKET_SCORE.POOR + avg * MOM_BUCKET_SCORE.AVERAGE + great * MOM_BUCKET_SCORE.GREAT;
  return Math.round((sum / n) * 100) / 100;
}

/** Labels shown until the backing queries are wired. */
export const PENDING_LABELS = {
  production: "Coming Soon",
  assessment: "Not Yet Calculated",
} as const;
