import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SMARTSCHOOL_URL = "https://webtop.smartschool.co.il";
const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ||
  "/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome";

export async function POST() {
  const username = process.env.SMARTSCHOOL_USER;
  const password = process.env.SMARTSCHOOL_PASS;

  if (!username || !password) {
    return NextResponse.json(
      { error: "SMARTSCHOOL_USER and SMARTSCHOOL_PASS env vars are required" },
      { status: 500 }
    );
  }

  // Find a parent to use as the author for scraped announcements
  const systemAuthor = await prisma.familyMember.findFirst({
    where: { role: "parent" },
  });

  if (!systemAuthor) {
    return NextResponse.json(
      { error: "No parent family member found to assign as author" },
      { status: 500 }
    );
  }

  let browser;
  try {
    const { chromium } = await import("playwright-core");

    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const context = await browser.newContext({
      locale: "he-IL",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // Navigate to the notifications page (will redirect to login if not authenticated)
    await page.goto(`${SMARTSCHOOL_URL}/notification`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // If redirected to login page, perform login
    const currentUrl = page.url();
    if (!currentUrl.includes("/notification")) {
      // Fill login form — SmartSchool uses standard username/password fields
      await page.fill('input[name="username"], input[type="text"]:first-of-type', username);
      await page.fill('input[name="password"], input[type="password"]', password);
      await page.click('button[type="submit"], input[type="submit"]');

      await page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 });

      // Navigate to notifications after login
      if (!page.url().includes("/notification")) {
        await page.goto(`${SMARTSCHOOL_URL}/notification`, {
          waitUntil: "networkidle",
          timeout: 15000,
        });
      }
    }

    // Wait for notification items to load
    await page.waitForSelector(".notification-item, .message-item, [class*='notification'], [class*='message']", {
      timeout: 10000,
    }).catch(() => {
      // Selector may not match — proceed to extract what we can
    });

    // Extract the last 5 announcements
    const scraped = await page.evaluate(() => {
      const results: Array<{
        id: string;
        title: string;
        content: string;
        date: string;
      }> = [];

      // Try multiple common selector patterns for SmartSchool
      const containers = document.querySelectorAll(
        ".notification-item, .message-item, .notification-row, " +
        "[class*='notification-item'], [class*='message-row'], " +
        "li[data-id], div[data-id], tr[data-id]"
      );

      containers.forEach((el) => {
        if (results.length >= 5) return;

        const id =
          el.getAttribute("data-id") ||
          el.getAttribute("id") ||
          String(Math.random());

        const titleEl =
          el.querySelector(".title, .subject, h3, h4, strong, b") ||
          el.querySelector("[class*='title'], [class*='subject']");

        const contentEl =
          el.querySelector(".content, .body, .text, p, .description") ||
          el.querySelector("[class*='content'], [class*='body']");

        const dateEl =
          el.querySelector(".date, .time, time, [class*='date'], [class*='time']");

        const title = titleEl?.textContent?.trim() || "";
        const content = contentEl?.textContent?.trim() || "";
        const date = dateEl?.textContent?.trim() || new Date().toISOString();

        if (title || content) {
          results.push({ id, title: title || content.substring(0, 60), content, date });
        }
      });

      return results;
    });

    await browser.close();

    if (scraped.length === 0) {
      return NextResponse.json({ synced: 0, message: "No announcements found on page" });
    }

    // Upsert announcements — skip ones already saved (by externalId)
    let synced = 0;
    for (const item of scraped) {
      await prisma.schoolAnnouncement.upsert({
        where: { externalId: `smartschool-${item.id}` },
        update: {
          title: item.title,
          content: item.content,
        },
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

    return NextResponse.json({ synced, total: scraped.length });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
