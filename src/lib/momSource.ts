import "server-only";

// ---------------------------------------------------------------------------
// The Nest — MOM data source (server-only).
//
// Real MOM roleplay/production scores come from the Snowflake view:
//     CUSTOMERCARE.MOM_STANDARD.VW_CX_NEST_SIMULATION_INSIGHTS
//
// This module is the single seam between the app and live data. It returns a
// normalized array of MomRow objects (one per advocate). The UI/deriveStats
// overlay these onto the advocate shapes defined in lib/nest-data.ts.
//
// When NEST_DATA_SOURCE=snowflake and credentials are configured, it queries
// Snowflake live. Otherwise it returns deterministic mock rows so the demo runs
// with no backend (per the README: "run the query once and cache ... then
// switch to live").
//
// NOTE: the exact column names below are placeholders mapped to the documented
// query shape. Confirm them against the live view (DESCRIBE VIEW ...) and adjust
// the SELECT + row mapping — everything downstream keys off the MomRow shape.
// ---------------------------------------------------------------------------

import { allAdvocates } from "./nest-data";
import type { CatKey } from "./types";

export interface MomRow {
  /** advocate identifier (maps to Advocate.id) */
  id: string;
  name: string;
  email?: string;
  roleplayMom: number; // 1–5
  productionMom: number; // 1–5
  /** optional MOM rubric sub-scores (1–5 each) */
  cats?: Partial<Record<CatKey, number>>;
}

const VIEW_FQN = [
  process.env.SNOWFLAKE_DATABASE || "CUSTOMERCARE",
  process.env.SNOWFLAKE_SCHEMA || "MOM_STANDARD",
  process.env.SNOWFLAKE_MOM_VIEW || "VW_CX_NEST_SIMULATION_INSIGHTS",
].join(".");

/**
 * Documented server-side query. Column aliases map the view's columns to the
 * MomRow shape — rename the source columns to match your view.
 *
 * If the view returns per-call rows rather than per-advocate aggregates, wrap
 * this in an aggregation (AVG of the MOM scores GROUP BY advocate).
 */
export const MOM_QUERY = `
  SELECT
    ADVOCATE_ID          AS ID,
    ADVOCATE_NAME        AS NAME,
    ADVOCATE_EMAIL       AS EMAIL,
    ROLEPLAY_MOM         AS ROLEPLAYMOM,
    PRODUCTION_MOM       AS PRODUCTIONMOM,
    MOM_COMPREHENSION    AS COMPREHENSION,
    MOM_CLARITY          AS CLARITY,
    MOM_FELT_HEARD       AS HEARD
  FROM ${VIEW_FQN}
`;

/** Live Snowflake fetch. Uses snowflake-sdk lazily so the app builds without it. */
async function fetchFromSnowflake(): Promise<MomRow[]> {
  // TODO: `npm i snowflake-sdk` and provide SNOWFLAKE_* env vars to enable.
  // Kept as a dynamic import so a missing dependency never breaks the build/demo.
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
  return rows.map((r) => ({
    id: String(r.ID),
    name: r.NAME,
    email: r.EMAIL || undefined,
    roleplayMom: Number(r.ROLEPLAYMOM),
    productionMom: Number(r.PRODUCTIONMOM),
    cats: {
      comprehension: r.COMPREHENSION != null ? Number(r.COMPREHENSION) : undefined,
      clarity: r.CLARITY != null ? Number(r.CLARITY) : undefined,
      heard: r.HEARD != null ? Number(r.HEARD) : undefined,
    },
  }));
}

/** Deterministic mock rows derived from the shape contract in nest-data.ts. */
function mockRows(): MomRow[] {
  return allAdvocates.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    roleplayMom: a.roleplayMom,
    productionMom: a.productionMom,
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
