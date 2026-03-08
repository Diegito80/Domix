import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { emoji } = body;

  const message = await prisma.message.update({
    where: { id },
    data: { emoji },
    include: {
      author: { select: { id: true, name: true, nameHe: true, color: true } },
    },
  });

  return NextResponse.json(message);
}
