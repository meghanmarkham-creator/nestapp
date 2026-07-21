import "server-only";

// ---------------------------------------------------------------------------
// The Nest — MOM data source (server-only).
//
// Real MOM roleplay scores come from the Snowflake view:
//     CUSTOMERCARE.MOM_STANDARD.VW_CX_NEST_SIMULATION_INSIGHTS
//
// This module is the single seam between the app and live data. It returns a
// normalized array of MomRow objects (one per advocate). The UI/deriveStats
// overlay these onto the advocate shapes defined in lib/nest-data.ts.
//
// When NEST_DATA_SOURCE=snowflake and credentials are configured, it queries
// Snowflake live. Otherwise it returns deterministic mock rows so the demo runs
// with no backend (per the README).
//
// ── Confirmed against the live view (DESCRIBE VIEW, 2026-07) ────────────────
//   Grain:   one row per simulation call (TRANSCRIPTION_ID); ~251 calls / 97
//            advocates. We GROUP BY EMPLOYEE_ID to get one MomRow per advocate.
//   Identity: EMPLOYEE_ID, PREFERRED_NAME, EMAIL_ADDRESS, LEADER, STAFF_GROUP.
//   Criteria: COMPREHENSION_SCORE, CLARITY_OF_NEXT_STEPS_SCORE,
//            CUSTOMER_FELT_HEARD_SCORE — each its own column, but exposed as
//            TEXT BUCKETS ('POOR' | 'AVERAGE' | 'GREAT'), not the raw 1–5.
//            We map buckets → numeric midpoints (POOR=1.5, AVERAGE=3, GREAT=4.5)
//            to reach the app's 1–5 MOM scale, then average per advocate.
//            (TODO: if leadership wants the true 1–5, ask the view owner to also
//            expose INSIGHT_DETAILS:*:CRITERION_SCORE::INT, then drop the DECODE.)
//   roleplayMom = mean of the three criteria averages.
//
// This view is ROLEPLAY-SIMULATION data only. It does NOT provide Production MOM,
// Assessment, or Attendance — those keep the prototype's placeholder values (see
// mergeMomRows in nest integration) until their sources are wired.
//   TODO: Production MOM source (live-call MOM), Assessment, Attendance.
// ---------------------------------------------------------------------------

import { allAdvocates } from "./nest-data";
import type { CatKey } from "./types";

export interface MomRow {
  /** advocate identifier — EMPLOYEE_ID (maps to Advocate.id) */
  id: string;
  name: string;
  email?: string;
  /** classroom leader / team lead from the roster join (LEADER) */
  leader?: string;
  /** number of scored simulations this advocate has (COUNT of calls) */
  sims?: number;
  roleplayMom: number; // 1–5 (mean of the three criteria)
  /** not provided by this view — undefined until a Production MOM source is wired */
  productionMom?: number; // 1–5
  /** MOM rubric sub-scores (1–5 each), averaged from the bucketed criteria */
  cats?: Partial<Record<CatKey, number>>;
}

const VIEW_FQN = [
  process.env.SNOWFLAKE_DATABASE || "CUSTOMERCARE",
  process.env.SNOWFLAKE_SCHEMA || "MOM_STANDARD",
  process.env.SNOWFLAKE_MOM_VIEW || "VW_CX_NEST_SIMULATION_INSIGHTS",
].join(".");

/**
 * Live per-advocate aggregation over the simulation-insights view.
 * Buckets are mapped to 1–5 midpoints and averaged; roleplayMom is the mean of
 * the three criteria averages. Validated against the live view.
 */
export const MOM_QUERY = `
  WITH m AS (
    SELECT
      EMPLOYEE_ID,
      PREFERRED_NAME,
      EMAIL_ADDRESS,
      LEADER,
      -- Bucket → 1–5 midpoints (POOR 1–2→1.5, AVERAGE 3–4→3.5, GREAT 5→5).
      -- Mirrors MOM_BUCKET_SCORE in lib/momScale.ts (keep in sync).
      DECODE(COMPREHENSION_SCORE,          'POOR', 1.5, 'AVERAGE', 3.5, 'GREAT', 5) AS C,
      DECODE(CLARITY_OF_NEXT_STEPS_SCORE,  'POOR', 1.5, 'AVERAGE', 3.5, 'GREAT', 5) AS CL,
      DECODE(CUSTOMER_FELT_HEARD_SCORE,    'POOR', 1.5, 'AVERAGE', 3.5, 'GREAT', 5) AS H
    FROM ${VIEW_FQN}
  )
  SELECT
    EMPLOYEE_ID                         AS ID,
    MAX(PREFERRED_NAME)                 AS NAME,
    MAX(EMAIL_ADDRESS)                  AS EMAIL,
    MAX(LEADER)                         AS LEADER,
    COUNT(*)                            AS SIMS,
    ROUND(AVG(C), 2)                    AS COMPREHENSION,
    ROUND(AVG(CL), 2)                   AS CLARITY,
    ROUND(AVG(H), 2)                    AS HEARD,
    ROUND((AVG(C) + AVG(CL) + AVG(H)) / 3, 2) AS ROLEPLAYMOM
  FROM m
  WHERE EMPLOYEE_ID IS NOT NULL
  GROUP BY EMPLOYEE_ID
`;

/** Live Snowflake fetch. Uses snowflake-sdk lazily so the app builds without it. */
async function fetchFromSnowflake(): Promise<MomRow[]> {
  // TODO: `npm i snowflake-sdk` and provide SNOWFLAKE_* env vars to enable.
  // Computed specifier keeps tsc/webpack from statically resolving an optional dep.
  const pkg = "snowflake-sdk";
  const sdk: any = await import(/* webpackIgnore: true */ pkg).catch(() => null);
  if (!sdk) {
    throw new Error(
      "snowflake-sdk not installed. Run `npm i snowflake-sdk` to enable live MOM data.",
    );
  }
  const connection = sdk.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    password: process.env.SNOWFLAKE_PASSWORD,
    role: process.env.SNOWFLAKE_ROLE,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA,
  });
  await new Promise<void>((resolve, reject) =>
    connection.connect((err: unknown) => (err ? reject(err) : resolve())),
  );
  const rows: any[] = await new Promise((resolve, reject) => {
    connection.execute({
      sqlText: MOM_QUERY,
      complete: (err: unknown, _stmt: unknown, rows: any[]) =>
        err ? reject(err) : resolve(rows),
    });
  });
  connection.destroy(() => {});
  return rows.map(normalizeRow);
}

/** Map a raw Snowflake result row to a MomRow. */
function normalizeRow(r: any): MomRow {
  return {
    id: String(r.ID),
    name: r.NAME,
    email: r.EMAIL || undefined,
    leader: r.LEADER || undefined,
    sims: r.SIMS != null ? Number(r.SIMS) : undefined,
    roleplayMom: Number(r.ROLEPLAYMOM),
    // productionMom intentionally omitted — not in this view (TODO: wire source).
    cats: {
      comprehension: r.COMPREHENSION != null ? Number(r.COMPREHENSION) : undefined,
      clarity: r.CLARITY != null ? Number(r.CLARITY) : undefined,
      heard: r.HEARD != null ? Number(r.HEARD) : undefined,
    },
  };
}

/** Deterministic mock rows derived from the shape contract in nest-data.ts. */
function mockRows(): MomRow[] {
  return allAdvocates.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    roleplayMom: a.roleplayMom,
    productionMom: a.productionMom ?? undefined,
    cats: a.cats,
  }));
}

/**
 * Returns MOM rows from the configured source. Falls back to mock data if the
 * live source is unset or errors (so the demo never hard-fails).
 */
export async function getMomRows(): Promise<{ source: "snowflake" | "mock"; rows: MomRow[] }> {
  if ((process.env.NEST_DATA_SOURCE || "mock") === "snowflake") {
    try {
      return { source: "snowflake", rows: await fetchFromSnowflake() };
    } catch (err) {
      console.warn("[momSource] Snowflake fetch failed, falling back to mock:", err);
    }
  }
  return { source: "mock", rows: mockRows() };
}
