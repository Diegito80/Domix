import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { amount } = body;

  if (typeof amount !== "number") {
    return NextResponse.json({ error: "amount (number) is required" }, { status: 400 });
  }

  const member = await prisma.familyMember.update({
    where: { id },
    data: { points: { increment: amount } },
  });

  return NextResponse.json(member);
}
