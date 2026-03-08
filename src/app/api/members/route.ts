import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const members = await prisma.familyMember.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(members);
}
