import { NextResponse } from "next/server";
import { getMomRows } from "@/lib/momSource";

// GET /api/mom — normalized MOM rows (roleplay + production per advocate).
// Live seam to Snowflake (CUSTOMERCARE.MOM_STANDARD.VW_CX_NEST_SIMULATION_INSIGHTS);
// falls back to deterministic mock data when NEST_DATA_SOURCE!=snowflake.
// TODO: the client currently derives from the in-memory mock (lib/nest-data.ts);
// once live, overlay these rows onto advocate shapes in deriveStats.
export async function GET() {
  const { source, rows } = await getMomRows();
  return NextResponse.json({ source, count: rows.length, rows });
}
