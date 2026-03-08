import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");
  const category = searchParams.get("category");
  const completed = searchParams.get("completed");

  const where: Record<string, unknown> = {};
  if (memberId) where.assignedToId = memberId;
  if (category) where.category = category;
  if (completed !== null) where.completed = completed === "true";

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignedTo: { select: { id: true, name: true, nameHe: true, color: true } },
      createdBy: { select: { id: true, name: true, nameHe: true } },
    },
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    title,
    description,
    emoji,
    pointsValue = 0,
    isRecurring = false,
    recurrence,
    dueDate,
    dueTime,
    category = "general",
    createdById,
    assignedToId,
  } = body;

  if (!title || !createdById || !assignedToId) {
    return NextResponse.json(
      { error: "title, createdById, and assignedToId are required" },
      { status: 400 }
    );
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      emoji,
      pointsValue,
      isRecurring,
      recurrence,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueTime,
      category,
      createdById,
      assignedToId,
    },
    include: {
      assignedTo: { select: { id: true, name: true, nameHe: true, color: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
