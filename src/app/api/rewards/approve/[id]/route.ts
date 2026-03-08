import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body; // "approved" | "redeemed" | "rejected"

  if (!["approved", "redeemed", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // If rejecting, refund points
  if (status === "rejected") {
    const redemption = await prisma.redemption.findUnique({
      where: { id },
      include: { reward: true },
    });

    if (redemption && redemption.status === "pending") {
      await prisma.familyMember.update({
        where: { id: redemption.memberId },
        data: { points: { increment: redemption.reward.pointsCost } },
      });
    }
  }

  const updated = await prisma.redemption.update({
    where: { id },
    data: { status },
    include: {
      reward: true,
      member: { select: { id: true, name: true, nameHe: true, points: true } },
    },
  });

  return NextResponse.json(updated);
}
