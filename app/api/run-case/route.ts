import { NextResponse } from "next/server";
import { runCareRouteCase } from "@/lib/care-route";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      symptoms?: string;
      walletAddress?: string;
      budgetTxHash?: string;
    };

    if (!body.symptoms?.trim()) {
      return NextResponse.json(
        { error: "Symptoms are required." },
        { status: 400 },
      );
    }

    const result = await runCareRouteCase({
      symptoms: body.symptoms,
      walletAddress: body.walletAddress,
      budgetTxHash: body.budgetTxHash,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run case.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
