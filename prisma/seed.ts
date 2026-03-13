import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Domix family database...");

  // Clear existing members to avoid duplicates on re-seed
  await prisma.familyMember.deleteMany({});

  const members = await prisma.familyMember.createMany({
    data: [
      {
        name: "Roy",
        nameHe: "רועי",
        role: "parent",
        age: 40,
        avatarUrl: "",
        color: "#4A90D9",
        points: 0,
      },
      {
        name: "Liron",
        nameHe: "לירון",
        role: "parent",
        age: 38,
        avatarUrl: "",
        color: "#9B59B6",
        points: 0,
      },
      {
        name: "Tommy",
        nameHe: "טומי",
        role: "child",
        age: 14,
        avatarUrl: "",
        color: "#27AE60",
        points: 0,
      },
      {
        name: "Mailee",
        nameHe: "מיילי",
        role: "child",
        age: 11,
        avatarUrl: "",
        color: "#E67E22",
        points: 0,
      },
      {
        name: "Lian",
        nameHe: "ליאן",
        role: "child",
        age: 7,
        avatarUrl: "",
        color: "#E91E8C",
        points: 0,
      },
    ],
  });

  console.log(`✅ Created ${members.count} family members`);

  // Seed default rewards
  await prisma.reward.deleteMany({});
  await prisma.reward.createMany({
    data: [
      { name: "ארטיק", nameEn: "Popsicle", emoji: "🍦", pointsCost: 50, category: "small" },
      { name: "בחירת סרט ערב", nameEn: "Movie Night Pick", emoji: "🎬", pointsCost: 100, category: "small" },
      { name: "שעת שינה מאוחרת", nameEn: "Late Bedtime", emoji: "🌙", pointsCost: 150, category: "medium" },
      { name: "ארוחה בחוץ", nameEn: "Eat Out", emoji: "🍕", pointsCost: 300, category: "medium" },
      { name: "משחק וידאו יום שלם", nameEn: "Full Day Gaming", emoji: "🎮", pointsCost: 500, category: "large" },
      { name: "טיול מיוחד", nameEn: "Special Trip", emoji: "✈️", pointsCost: 1000, category: "epic" },
    ],
  });

  console.log("✅ Created default rewards");
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
