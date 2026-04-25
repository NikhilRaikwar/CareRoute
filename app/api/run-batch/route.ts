import { NextResponse } from "next/server";
import { DEMO_CASES, runCareRouteCase } from "@/lib/care-route";

export async function POST() {
  try {
    const cases = await Promise.all(
      DEMO_CASES.slice(0, 20).map((symptoms) =>
        runCareRouteCase({
          symptoms,
        }),
      ),
    );

    return NextResponse.json({
      cases,
      totalTransactions: cases.reduce(
        (sum, caseResult) => sum + caseResult.transactions.length,
        0,
      ),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run batch.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
