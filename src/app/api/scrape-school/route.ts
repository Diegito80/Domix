import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

const SMARTSCHOOL_URL = "https://webtop.smartschool.co.il";
const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ||
  "/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome";

export async function POST() {
  const authFilePath = path.join(process.cwd(), "auth.json");

  if (!fs.existsSync(authFilePath)) {
    return NextResponse.json(
      {
        error:
          "Missing auth.json. Run `node login.mjs` from the project root to generate it by logging in manually.",
      },
      { status: 401 }
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

    // Restore the saved session (cookies + localStorage) — skips login entirely
    const context = await browser.newContext({
      storageState: authFilePath,
      locale: "he-IL",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // Go straight to notifications — authenticated session bypasses login
    await page.goto(`${SMARTSCHOOL_URL}/notification`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // If redirected back to login the session expired — tell the user to re-run login.mjs
    if (page.url().includes("/login") || page.url().includes("/account")) {
      await browser.close();
      return NextResponse.json(
        {
          error:
            "Session expired. Run `node login.mjs` again to refresh auth.json.",
        },
        { status: 401 }
      );
    }

    // Wait for Angular to render the notifications table
    await page.waitForTimeout(3000);
    await page
      .waitForSelector("mat-row, tr.mat-row, tbody tr", { timeout: 8000 })
      .catch(() => {});

    // Extract announcements from the rendered Angular Material table
    const items = await page.evaluate(() => {
      const results: Array<{
        id: string;
        title: string;
        content: string;
        date: string;
      }> = [];

      // Strategy 1: Angular Material table rows
      const matRows = Array.from(
        document.querySelectorAll("mat-row, tr.mat-row, [class*='mat-row']")
      );
      if (matRows.length > 0) {
        matRows.slice(0, 10).forEach((row, idx) => {
          const cells = Array.from(
            row.querySelectorAll(
              "mat-cell, td.mat-cell, td, [class*='mat-cell']"
            )
          );
          const texts = cells
            .map((c) => c.textContent?.trim() || "")
            .filter(Boolean);
          if (texts.length > 0) {
            results.push({
              id: row.getAttribute("data-id") || String(idx),
              title: texts[0].substring(0, 120),
              content: texts.slice(0, 2).join(" | "),
              date: texts[1] || new Date().toISOString(),
            });
          }
        });
      }

      // Strategy 2: Standard HTML table rows
      if (results.length === 0) {
        document.querySelectorAll("table").forEach((table) => {
          Array.from(
            table.querySelectorAll("tbody tr, tr:not(:first-child)")
          )
            .slice(0, 10)
            .forEach((row, idx) => {
              const texts = Array.from(row.querySelectorAll("td"))
                .map((c) => c.textContent?.trim() || "")
                .filter(Boolean);
              if (texts.length > 0) {
                results.push({
                  id: row.getAttribute("data-id") || `row-${idx}`,
                  title: texts[0].substring(0, 120),
                  content: texts.slice(0, 2).join(" | "),
                  date: texts[1] || new Date().toISOString(),
                });
              }
            });
        });
      }

      return results;
    });

    await browser.close();

    if (items.length === 0) {
      return NextResponse.json({
        synced: 0,
        message:
          "Authenticated but no notifications found in table. Session may need refresh — run `node login.mjs` again.",
      });
    }

    let synced = 0;
    for (const item of items) {
      await prisma.schoolAnnouncement.upsert({
        where: { externalId: `smartschool-${item.id}` },
        update: { title: item.title, content: item.content },
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
