import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const items = await prisma.shoppingItem.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  const item = await prisma.shoppingItem.create({ data: { name: name.trim() } });
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE() {
  // Clear completed items
  await prisma.shoppingItem.deleteMany({ where: { completed: true } });
  return NextResponse.json({ ok: true });
}
