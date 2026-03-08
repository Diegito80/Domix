import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.redemption.deleteMany();
  await prisma.drawing.deleteMany();
  await prisma.message.deleteMany();
  await prisma.task.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.appSetting.deleteMany();
  await prisma.familyMember.deleteMany();

  // ── Family Members ──────────────────────────────────────────────
  console.log("👨‍👩‍👧‍👦 Creating family members...");

  const roy = await prisma.familyMember.create({
    data: {
      name: "Roy",
      nameHe: "רועי",
      role: "parent",
      age: 40,
      avatarUrl: "/avatars/roy.png",
      color: "#4A6FA5",
      points: 0,
    },
  });

  const liron = await prisma.familyMember.create({
    data: {
      name: "Liron",
      nameHe: "לירון",
      role: "parent",
      age: 38,
      avatarUrl: "/avatars/liron.png",
      color: "#7B9E6B",
      points: 0,
    },
  });

  const tommy = await prisma.familyMember.create({
    data: {
      name: "Tommy",
      nameHe: "טומי",
      role: "child",
      age: 12.5,
      avatarUrl: "/avatars/tommy.png",
      color: "#E8943A",
      points: 0,
    },
  });

  const mailee = await prisma.familyMember.create({
    data: {
      name: "Mailee",
      nameHe: "מיילי",
      role: "child",
      age: 10.5,
      avatarUrl: "/avatars/mailee.png",
      color: "#C46B9E",
      points: 0,
    },
  });

  const lian = await prisma.familyMember.create({
    data: {
      name: "Lian",
      nameHe: "ליאן",
      role: "child",
      age: 7,
      avatarUrl: "/avatars/lian.png",
      color: "#F2C94C",
      points: 0,
    },
  });

  const members = { roy, liron, tommy, mailee, lian };
  console.log("  ✅ Created 5 family members");

  // ── Tasks ───────────────────────────────────────────────────────
  console.log("📋 Creating sample tasks...");

  const taskData = [
    // Tommy's tasks
    { title: "לצחצח שיניים", emoji: "🪥", pointsValue: 10, category: "morning_routine", recurrence: "daily", assignedToId: tommy.id, createdById: roy.id, isRecurring: true },
    { title: "לסדר מיטה", emoji: "🛏️", pointsValue: 10, category: "morning_routine", recurrence: "daily", assignedToId: tommy.id, createdById: roy.id, isRecurring: true },
    { title: "להכין שיעורי בית", emoji: "📝", pointsValue: 30, category: "homework", recurrence: "weekdays", assignedToId: tommy.id, createdById: roy.id, isRecurring: true },
    { title: "לטייל עם הכלב", emoji: "🐕", pointsValue: 20, category: "chores", recurrence: "daily", assignedToId: tommy.id, createdById: roy.id, isRecurring: true },
    { title: "לקרוא 20 דקות", emoji: "📖", pointsValue: 25, category: "general", recurrence: "daily", assignedToId: tommy.id, createdById: roy.id, isRecurring: true },

    // Mailee's tasks
    { title: "לצחצח שיניים", emoji: "🪥", pointsValue: 10, category: "morning_routine", recurrence: "daily", assignedToId: mailee.id, createdById: liron.id, isRecurring: true },
    { title: "לסדר חדר", emoji: "🧹", pointsValue: 15, category: "chores", recurrence: "daily", assignedToId: mailee.id, createdById: liron.id, isRecurring: true },
    { title: "להכין שיעורי בית", emoji: "📝", pointsValue: 30, category: "homework", recurrence: "weekdays", assignedToId: mailee.id, createdById: liron.id, isRecurring: true },
    { title: "לסדר צעצועים", emoji: "🧸", pointsValue: 15, category: "chores", recurrence: "daily", assignedToId: mailee.id, createdById: liron.id, isRecurring: true },
    { title: "לצייר 15 דקות", emoji: "🎨", pointsValue: 20, category: "general", recurrence: null, assignedToId: mailee.id, createdById: liron.id, isRecurring: false },

    // Lian's tasks
    { title: "לצחצח שיניים", emoji: "🪥", pointsValue: 10, category: "morning_routine", recurrence: "daily", assignedToId: lian.id, createdById: liron.id, isRecurring: true },
    { title: "לסדר צעצועים", emoji: "🧸", pointsValue: 15, category: "chores", recurrence: "daily", assignedToId: lian.id, createdById: liron.id, isRecurring: true },
    { title: "לקרוא סיפור", emoji: "📖", pointsValue: 25, category: "general", recurrence: "daily", assignedToId: lian.id, createdById: liron.id, isRecurring: true },
    { title: "להתלבש לבד", emoji: "👕", pointsValue: 10, category: "morning_routine", recurrence: "daily", assignedToId: lian.id, createdById: liron.id, isRecurring: true },

    // Family tasks (assigned to tommy as representative — in practice could be any kid)
    { title: "לערוך שולחן לארוחת ערב", emoji: "🍽️", pointsValue: 15, category: "chores", recurrence: "daily", assignedToId: tommy.id, createdById: roy.id, isRecurring: true },
  ];

  for (const task of taskData) {
    await prisma.task.create({ data: task });
  }
  console.log(`  ✅ Created ${taskData.length} tasks`);

  // ── Rewards ─────────────────────────────────────────────────────
  console.log("🏆 Creating reward catalog...");

  const rewardData = [
    { name: "גלידה", nameEn: "Ice cream", emoji: "🍦", pointsCost: 200, category: "small" },
    { name: "חטיף מיוחד", nameEn: "Special snack", emoji: "🍫", pointsCost: 150, category: "small" },
    { name: "לבחור את ארוחת הערב", nameEn: "Choose dinner", emoji: "🍕", pointsCost: 250, category: "small" },
    { name: "30 דקות מסך נוסף", nameEn: "30 min extra screen", emoji: "📺", pointsCost: 300, category: "medium" },
    { name: "שעה של משחק", nameEn: "One hour gaming", emoji: "🎮", pointsCost: 500, category: "medium" },
    { name: "לישון מאוחר ב-30 דקות", nameEn: "30 min late bedtime", emoji: "🌙", pointsCost: 400, category: "medium" },
    { name: "סרט משפחתי לבחירה", nameEn: "Family movie choice", emoji: "🎬", pointsCost: 750, category: "large" },
    { name: "יום כיף עם חבר", nameEn: "Fun day with friend", emoji: "🎉", pointsCost: 1000, category: "large" },
    { name: 'קניות בסכום של 50 ש"ח', nameEn: "50 NIS shopping", emoji: "🛍️", pointsCost: 2000, category: "large" },
    { name: "טלפון חדש", nameEn: "New phone", emoji: "📱", pointsCost: 10000, category: "epic" },
  ];

  for (const reward of rewardData) {
    await prisma.reward.create({ data: reward });
  }
  console.log(`  ✅ Created ${rewardData.length} rewards`);

  // ── Recipes ─────────────────────────────────────────────────────
  console.log("🍳 Creating sample recipes...");

  const recipeData = [
    {
      title: "סלמון צלוי עם אספרגוס",
      category: "dinner",
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      ingredients: JSON.stringify(["4 פילה סלמון", "חבילת אספרגוס", "שמן זית", "לימון", "מלח ופלפל", "שום"]),
      steps: JSON.stringify([
        { step: 1, instruction: "לחמם תנור ל-200 מעלות", timer: null },
        { step: 2, instruction: "לסדר סלמון ואספרגוס על תבנית, לתבל בשמן זית, מלח, פלפל ושום", timer: null },
        { step: 3, instruction: "לצלות 18-20 דקות עד שהסלמון מוכן", timer: 1200 },
      ]),
      tags: JSON.stringify(["healthy", "quick", "dinner"]),
    },
    {
      title: "פנקייק אמריקאי",
      category: "breakfast",
      prepTime: 5,
      cookTime: 15,
      servings: 4,
      ingredients: JSON.stringify(["2 כוסות קמח", "2 ביצים", "1.5 כוס חלב", "2 כפות סוכר", "1 כפית אבקת אפייה", "חמאה"]),
      steps: JSON.stringify([
        { step: 1, instruction: "לערבב את כל המרכיבים היבשים בקערה גדולה", timer: null },
        { step: 2, instruction: "להוסיף ביצים וחלב ולערבב עד לבלילה חלקה", timer: null },
        { step: 3, instruction: "לחמם מחבת עם חמאה ולצקת כפות בלילה", timer: null },
        { step: 4, instruction: "לטגן 2 דקות מכל צד עד להזהבה", timer: 120 },
      ]),
      tags: JSON.stringify(["kids-friendly", "breakfast", "quick"]),
    },
    {
      title: "פסטה ברוטב עגבניות",
      category: "lunch",
      prepTime: 5,
      cookTime: 20,
      servings: 4,
      ingredients: JSON.stringify(["500 גרם פסטה", "פחית עגבניות מרוסקות", "שום", "בצל", "שמן זית", "בזיליקום", "מלח ופלפל"]),
      steps: JSON.stringify([
        { step: 1, instruction: "לבשל פסטה לפי הוראות על האריזה", timer: 600 },
        { step: 2, instruction: "לטגן בצל ושום בשמן זית עד להזהבה", timer: null },
        { step: 3, instruction: "להוסיף עגבניות מרוסקות ולבשל 10 דקות", timer: 600 },
        { step: 4, instruction: "לערבב פסטה עם הרוטב ולהגיש עם בזיליקום", timer: null },
      ]),
      tags: JSON.stringify(["kids-friendly", "lunch", "quick"]),
    },
    {
      title: "שקשוקה",
      category: "breakfast",
      prepTime: 5,
      cookTime: 15,
      servings: 4,
      ingredients: JSON.stringify(["פחית עגבניות מרוסקות", "4 ביצים", "בצל", "פלפל", "שום", "כמון", "פפריקה", "מלח"]),
      steps: JSON.stringify([
        { step: 1, instruction: "לטגן בצל ופלפל בשמן זית", timer: null },
        { step: 2, instruction: "להוסיף שום, כמון ופפריקה ולערבב", timer: null },
        { step: 3, instruction: "להוסיף עגבניות מרוסקות ולבשל 5 דקות", timer: 300 },
        { step: 4, instruction: "לעשות גומות ולשבור ביצים פנימה, לכסות ולבשל 5 דקות", timer: 300 },
      ]),
      tags: JSON.stringify(["breakfast", "quick", "healthy"]),
    },
    {
      title: "עוגיות שוקולד צ'יפס",
      category: "dessert",
      prepTime: 15,
      cookTime: 12,
      servings: 24,
      ingredients: JSON.stringify(["2 כוסות קמח", "1 כוס חמאה", "3/4 כוס סוכר חום", "1/2 כוס סוכר", "2 ביצים", "1 כפית וניל", "1 כפית סודה לשתייה", "2 כוסות שוקולד צ'יפס"]),
      steps: JSON.stringify([
        { step: 1, instruction: "לחמם תנור ל-180 מעלות", timer: null },
        { step: 2, instruction: "לערבב חמאה וסוכרים עד לקרם חלק", timer: null },
        { step: 3, instruction: "להוסיף ביצים ווניל ולערבב", timer: null },
        { step: 4, instruction: "להוסיף קמח וסודה ולערבב, להוסיף שוקולד צ'יפס", timer: null },
        { step: 5, instruction: "ליצור כדורי בצק על תבנית ולאפות 10-12 דקות", timer: 720 },
      ]),
      tags: JSON.stringify(["kids-friendly", "dessert"]),
    },
  ];

  for (const recipe of recipeData) {
    await prisma.recipe.create({ data: recipe });
  }
  console.log(`  ✅ Created ${recipeData.length} recipes`);

  // ── Sample Messages ─────────────────────────────────────────────
  console.log("💬 Creating sample messages...");

  await prisma.message.createMany({
    data: [
      { content: "!שבת שלום למשפחה", authorId: roy.id, pinned: false },
      { content: "!מי רוצה פנקייקים לארוחת בוקר", authorId: liron.id, pinned: false },
      { content: "!אני! עם שוקולד צ'יפס בבקשה 🍫", authorId: tommy.id, pinned: false },
      { content: "!גם אני רוצה 🥞", authorId: mailee.id, pinned: false },
      { content: "!סבתא באה ביום שישי", authorId: liron.id, pinned: true },
    ],
  });
  console.log("  ✅ Created 5 sample messages");

  // ── App Settings ────────────────────────────────────────────────
  console.log("⚙️ Creating default settings...");

  await prisma.appSetting.createMany({
    data: [
      { key: "idle_timeout", value: "5" },
      { key: "voice_enabled", value: "true" },
      { key: "sound_enabled", value: "true" },
      { key: "screensaver_interval", value: "5" },
    ],
  });
  console.log("  ✅ Created default settings");

  console.log("\n🎉 Seed complete!");
  console.log(`   Members: 5 (${Object.values(members).map((m) => m.nameHe).join(", ")})`);
  console.log(`   Tasks: ${taskData.length}`);
  console.log(`   Rewards: ${rewardData.length}`);
  console.log(`   Recipes: ${recipeData.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
