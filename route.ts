import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

const SMARTSCHOOL_URL = "https://webtop.smartschool.co.il";

export async function POST() {
  // 1. Grab the parent author to assign to the scraped announcements
  const systemAuthor = await prisma.familyMember.findFirst({
    where: { role: "parent" },
  });

  if (!systemAuthor) {
    return NextResponse.json(
      { error: "No parent family member found to assign as author" },
      { status: 500 }
    );
  }

  // 2. Check for the session file
  const authFilePath = path.join(process.cwd(), "auth.json");
  if (!fs.existsSync(authFilePath)) {
    return NextResponse.json(
      { error: "Missing auth.json. Run `node login.mjs` first." },
      { status: 401 }
    );
  }

  const { chromium } = await import("playwright-core");
  let browser;

  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    // 3. Launch browser using the saved session cookies
    const context = await browser.newContext({
      storageState: authFilePath,
      locale: "he-IL",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // 4. Navigate directly to notifications
    await page.goto(`${SMARTSCHOOL_URL}/notification`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    if (page.url().includes("/login") || page.url().includes("/account")) {
      await browser.close();
      return NextResponse.json(
        { error: "Session expired. Run `node login.mjs` again to refresh auth.json." },
        { status: 401 }
      );
    }

    // 5. Wait for the exact notification class we found in the debug dump
    await page.waitForSelector("[class*='notif']", { timeout: 15000 }).catch(() => {});

    // 6. Extract the announcements
    const items = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("[class*='notif']"));
      
      return rows.slice(0, 5).map((row, index) => {
        const rawText = row.innerText || row.textContent || "";
        const cleanText = rawText.trim().replace(/\s+/g, ' ');
        
        // Create a unique hash ID based on the text so we don't duplicate entries
        const textHash = cleanText.substring(0, 30).replace(/[^a-zA-Z0-9א-ת]/g, '');

        return {
          id: `${textHash}-${index}`,
          title: "עדכון SmartSchool",
          content: cleanText,
        };
      }).filter(item => item.content.length > 10);
    });

    await browser.close();

    if (items.length === 0) {
      return NextResponse.json({
        synced: 0,
        message: "Authenticated but no notifications found on page.",
      });
    }

    // 7. Save to database
    let synced = 0;
    for (const item of items) {
      await prisma.schoolAnnouncement.upsert({
        where: { externalId: `smartschool-${item.id}` },
        update: { content: item.content }, // Update if it exists
        create: {
          title: item.title,
          content: item.content,
          subject: "general",
          priority: "info",
          source: "smartschool",
          externalId: `smartschool-${item.id}`,
          authorId: systemAuthor.id,
        },
      });
      synced++;
    }

    return NextResponse.json({ synced, total: items.length });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}