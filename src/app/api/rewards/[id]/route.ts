import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const reward = await prisma.reward.update({ where: { id }, data: body });
  return NextResponse.json(reward);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Soft-delete: set isActive = false
  await prisma.reward.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
