import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const members = await prisma.familyMember.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(members);
  } catch {
    return NextResponse.json([]);
  }
}
