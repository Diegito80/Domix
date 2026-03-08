import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const favorite = searchParams.get("favorite");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};

  if (category) where.category = category;
  if (favorite === "true") where.isFavorite = true;
  if (tag) where.tags = { contains: tag };
  if (search) where.title = { contains: search };

  const recipes = await prisma.recipe.findMany({
    where,
    orderBy: { title: "asc" },
  });

  return NextResponse.json(recipes);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const recipe = await prisma.recipe.create({ data: body });
  return NextResponse.json(recipe, { status: 201 });
}
