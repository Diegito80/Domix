import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// PATCH /api/tasks/reset — resets all recurring tasks to incomplete
// Triggered automatically by the client when date changes at midnight
export async function PATCH() {
  await prisma.task.updateMany({
    where: { isRecurring: true },
    data: { completed: false, completedAt: null },
  });

  // Store last reset date so client knows it happened
  await prisma.appSetting.upsert({
    where: { key: "lastTaskReset" },
    update: { value: new Date().toISOString().split("T")[0] },
    create: { key: "lastTaskReset", value: new Date().toISOString().split("T")[0] },
  });

  return NextResponse.json({ ok: true, resetAt: new Date().toISOString() });
}

// GET /api/tasks/reset — returns last reset date
export async function GET() {
  const setting = await prisma.appSetting.findUnique({ where: { key: "lastTaskReset" } });
  return NextResponse.json({ lastReset: setting?.value ?? null });
}
