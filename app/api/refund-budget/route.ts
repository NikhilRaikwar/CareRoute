import { NextResponse } from "next/server";
import { refundUserBudget } from "@/lib/transactions";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      address?: string;
      amount?: number;
    };

    if (!body.address || typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json(
        { error: "Address and positive refund amount are required." },
        { status: 400 },
      );
    }

    const refund = await refundUserBudget({
      to: body.address as `0x${string}`,
      amount: body.amount,
    });

    return NextResponse.json(refund);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Refund failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
