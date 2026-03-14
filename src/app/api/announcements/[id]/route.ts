import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { pinned, priority } = body;

  const data: Record<string, unknown> = {};
  if (pinned !== undefined) data.pinned = pinned;
  if (priority !== undefined) data.priority = priority;

  const announcement = await prisma.schoolAnnouncement.update({
    where: { id },
    data,
    include: {
      author: { select: { id: true, name: true, nameHe: true, color: true, role: true } },
    },
  });

  return NextResponse.json(announcement);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.schoolAnnouncement.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
