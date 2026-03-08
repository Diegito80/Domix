import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rewards = await prisma.reward.findMany({
    where: { isActive: true },
    orderBy: { pointsCost: "asc" },
  });
  return NextResponse.json(rewards);
}
