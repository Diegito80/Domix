import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Handle claiming a pool task (assigning to a member)
  if (body.claim === true && body.memberId) {
    const updated = await prisma.task.update({
      where: { id },
      data: { assignedToId: body.memberId },
      include: {
        assignedTo: { select: { id: true, name: true, nameHe: true, color: true } },
      },
    });
    return NextResponse.json(updated);
  }

  // If completing a task, add points to the assigned member
  if (body.completed === true) {
    const task = await prisma.task.findUnique({
      where: { id },
      select: { assignedToId: true, pointsValue: true, completed: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!task.completed && task.pointsValue > 0 && task.assignedToId) {
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

    if (task?.completed && task.pointsValue > 0 && task.assignedToId) {
      await prisma.familyMember.update({
        where: { id: task.assignedToId },
        data: { points: { decrement: task.pointsValue } },
      });
    }

    body.completedAt = null;
  }

  // Remove internal fields before passing to Prisma
  const { claim, memberId, ...updateData } = body;
  void claim; void memberId;

  const updated = await prisma.task.update({
    where: { id },
    data: updateData,
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
