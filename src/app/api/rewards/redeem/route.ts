import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { memberId, rewardId } = body;

  if (!memberId || !rewardId) {
    return NextResponse.json({ error: "memberId and rewardId required" }, { status: 400 });
  }

  const member = await prisma.familyMember.findUnique({ where: { id: memberId } });
  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });

  if (!member || !reward) {
    return NextResponse.json({ error: "Member or reward not found" }, { status: 404 });
  }

  if (member.points < reward.pointsCost) {
    return NextResponse.json({ error: "Not enough points", current: member.points, needed: reward.pointsCost }, { status: 400 });
  }

  // Deduct points and create redemption
  const [updatedMember, redemption] = await prisma.$transaction([
    prisma.familyMember.update({
      where: { id: memberId },
      data: { points: { decrement: reward.pointsCost } },
    }),
    prisma.redemption.create({
      data: { memberId, rewardId, status: "pending" },
      include: {
        reward: true,
        member: { select: { id: true, name: true, nameHe: true, points: true } },
      },
    }),
  ]);

  return NextResponse.json({ redemption, member: updatedMember }, { status: 201 });
}
