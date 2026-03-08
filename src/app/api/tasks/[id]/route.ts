import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // If completing a task, add points to the assigned member
  if (body.completed === true) {
    const task = await prisma.task.findUnique({
      where: { id },
      select: { assignedToId: true, pointsValue: true, completed: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.completed && task.pointsValue > 0) {
      await prisma.familyMember.update({
        where: { id: task.assignedToId },
        data: { points: { increment: task.pointsValue } },
      });
    }

    body.completedAt = new Date();
  }

  // If un-completing, deduct points
  if (body.completed === false) {
    const task = await prisma.task.findUnique({
      where: { id },
      select: { assignedToId: true, pointsValue: true, completed: true },
    });

    if (task?.completed && task.pointsValue > 0) {
      await prisma.familyMember.update({
        where: { id: task.assignedToId },
        data: { points: { decrement: task.pointsValue } },
      });
    }

    body.completedAt = null;
  }

  const updated = await prisma.task.update({
    where: { id },
    data: body,
    include: {
      assignedTo: { select: { id: true, name: true, nameHe: true, color: true, points: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
