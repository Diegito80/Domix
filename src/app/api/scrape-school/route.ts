import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

const SMARTSCHOOL_URL = "https://webtop.smartschool.co.il";
const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ||
  "/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome";

async function launchAndNavigate() {
  const authFilePath = path.join(process.cwd(), "auth.json");

  if (!fs.existsSync(authFilePath)) {
    return {
      error:
        "Missing auth.json. Run `node login.mjs` from the project root to generate it by logging in manually.",
      status: 401,
    };
  }

  const { chromium } = await import("playwright-core");

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  const context = await browser.newContext({
    storageState: authFilePath,
    locale: "he-IL",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  await page.goto(`${SMARTSCHOOL_URL}/notification`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  if (page.url().includes("/login") || page.url().includes("/account")) {
    await browser.close();
    return {
      error:
        "Session expired. Run `node login.mjs` again to refresh auth.json.",
      status: 401,
    };
  }

  // Wait for Angular to render
  await page.waitForTimeout(5000);

  return { browser, page };
}

// Debug endpoint: GET /api/scrape-school — returns page HTML structure
export async function GET() {
  let browser;
  try {
    const result = await launchAndNavigate();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }
    browser = result.browser;
    const page = result.page;

    const debug = await page.evaluate(() => {
      const body = document.body;

      // Get a truncated snapshot of the body HTML
      const bodyHtml = body.innerHTML.substring(0, 15000);

      // Find all unique tag names in the page
      const allTags = new Set<string>();
      body.querySelectorAll("*").forEach((el) => allTags.add(el.tagName.toLowerCase()));

      // Look for any list-like or repeating structures
      const repeatingSelectors = [
        "mat-row", "tr", "mat-list-item", "mat-card",
        "[class*='notification']", "[class*='item']", "[class*='row']",
        "[class*='list']", "[class*='message']", "[class*='alert']",
        "li", "article", "section", ".card", "cdk-row",
        "[class*='cdk-row']", "app-notification", "[class*='notif']",
      ];

      const found: Record<string, number> = {};
      for (const sel of repeatingSelectors) {
        try {
          const count = document.querySelectorAll(sel).length;
          if (count > 0) found[sel] = count;
        } catch {}
      }

      // Get text content of first few elements that look like notifications
      const sampleTexts: string[] = [];
      for (const sel of Object.keys(found)) {
        const els = document.querySelectorAll(sel);
        els.forEach((el, i) => {
          if (i < 3) {
            const text = el.textContent?.trim().substring(0, 200);
            if (text) sampleTexts.push(`[${sel}#${i}] ${text}`);
          }
        });
      }

      return {
        url: window.location.href,
        title: document.title,
        allTags: Array.from(allTags).sort(),
        matchingSelectors: found,
        sampleTexts: sampleTexts.slice(0, 30),
        bodyHtml,
      };
    });

    await browser.close();
    return NextResponse.json(debug);
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
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
    const result = await launchAndNavigate();
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }
    browser = result.browser;
    const page = result.page;

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
