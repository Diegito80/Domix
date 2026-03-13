import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Sum points from tasks completed in the last 7 days, grouped by assignedToId
  const completedTasks = await prisma.task.groupBy({
    by: ["assignedToId"],
    where: {
      completed: true,
      completedAt: { gte: weekAgo },
    },
    _sum: { pointsValue: true },
  });

  const result: Record<string, number> = {};
  for (const row of completedTasks) {
    result[row.assignedToId] = row._sum.pointsValue ?? 0;
  }

  return NextResponse.json(result);
}
