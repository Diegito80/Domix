import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  const where: Record<string, unknown> = {};
  if (memberId) where.memberId = memberId;

  const drawings = await prisma.drawing.findMany({
    where,
    include: {
      member: { select: { id: true, name: true, nameHe: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(drawings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, dataUrl, memberId } = body;

  if (!dataUrl || !memberId) {
    return NextResponse.json({ error: "dataUrl and memberId required" }, { status: 400 });
  }

  const drawing = await prisma.drawing.create({
    data: { title, dataUrl, memberId },
    include: {
      member: { select: { id: true, name: true, nameHe: true, color: true } },
    },
  });

  return NextResponse.json(drawing, { status: 201 });
}
