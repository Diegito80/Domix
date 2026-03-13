import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const rewards = await prisma.reward.findMany({
    where: { isActive: true },
    orderBy: { pointsCost: "asc" },
  });
  return NextResponse.json(rewards);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, emoji = "🎁", pointsCost, category = "medium", description } = body;
  if (!name || !pointsCost) {
    return NextResponse.json({ error: "name and pointsCost required" }, { status: 400 });
  }
  const reward = await prisma.reward.create({
    data: { name, emoji, pointsCost: Number(pointsCost), category, description },
  });
  return NextResponse.json(reward, { status: 201 });
}
