import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pinned = searchParams.get("pinned");

  const where: Record<string, unknown> = {};
  if (pinned === "true") where.pinned = true;

  const announcements = await prisma.schoolAnnouncement.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, nameHe: true, color: true, role: true } },
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(announcements);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content, subject = "general", priority = "normal", pinned = false, authorId } = body;

  if (!title?.trim() || !content?.trim() || !authorId) {
    return NextResponse.json({ error: "title, content and authorId required" }, { status: 400 });
  }

  const announcement = await prisma.schoolAnnouncement.create({
    data: { title: title.trim(), content: content.trim(), subject, priority, pinned, authorId },
    include: {
      author: { select: { id: true, name: true, nameHe: true, color: true, role: true } },
    },
  });

  return NextResponse.json(announcement, { status: 201 });
}
