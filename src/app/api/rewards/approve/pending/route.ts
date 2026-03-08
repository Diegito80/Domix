import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const pending = await prisma.redemption.findMany({
    where: { status: "pending" },
    include: {
      reward: { select: { name: true, emoji: true, pointsCost: true } },
      member: { select: { id: true, name: true, nameHe: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(pending);
}
