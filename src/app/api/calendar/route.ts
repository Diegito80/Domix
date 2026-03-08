import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const memberId = searchParams.get("memberId");

  const where: Record<string, unknown> = {};

  if (startDate && endDate) {
    where.startTime = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  // memberIds is stored as JSON string array, use contains for filtering
  if (memberId) {
    where.memberIds = { contains: memberId };
  }

  const events = await prisma.calendarEvent.findMany({
    where,
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    title,
    description,
    startTime,
    endTime,
    isAllDay = false,
    location,
    color,
    memberIds = [],
    eventType = "general",
    zoomLink,
  } = body;

  if (!title || !startTime || !endTime) {
    return NextResponse.json(
      { error: "title, startTime, and endTime are required" },
      { status: 400 }
    );
  }

  const event = await prisma.calendarEvent.create({
    data: {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isAllDay,
      location,
      color,
      memberIds: JSON.stringify(memberIds),
      eventType,
      zoomLink,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
