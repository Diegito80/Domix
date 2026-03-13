import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE() {
  await prisma.message.deleteMany({});
  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const take = Number(searchParams.get("take") || "50");
  const skip = Number(searchParams.get("skip") || "0");
  const pinned = searchParams.get("pinned");

  const where: Record<string, unknown> = {};
  if (pinned === "true") where.pinned = true;

  const messages = await prisma.message.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, nameHe: true, color: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, authorId, emoji, pinned = false } = body;

  if (!content?.trim() || !authorId) {
    return NextResponse.json({ error: "content and authorId required" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { content: content.trim(), authorId, emoji, pinned },
    include: {
      author: { select: { id: true, name: true, nameHe: true, color: true, role: true } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}
