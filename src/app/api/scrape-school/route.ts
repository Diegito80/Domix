import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SMARTSCHOOL_URL = "https://webtop.smartschool.co.il";
const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ||
  "/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome";

export async function POST(request: Request) {
  const username = process.env.SMARTSCHOOL_USER;
  const password = process.env.SMARTSCHOOL_PASS;

  if (!username || !password) {
    return NextResponse.json(
      { error: "SMARTSCHOOL_USER and SMARTSCHOOL_PASS env vars are required" },
      { status: 500 }
    );
  }

  // Support ?debug=1 to return raw HTML for troubleshooting
  const url = new URL(request.url);
  const debugMode = url.searchParams.get("debug") === "1";

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

    // Navigate to login page first
    await page.goto(`${SMARTSCHOOL_URL}/login`, {
      waitUntil: "networkidle",
      timeout: 30000,
    }).catch(() => {
      // Try root URL if /login doesn't exist
    });

    // If we're not already logged in, attempt login
    let currentUrl = page.url();
    const isLoginPage =
      !currentUrl.includes("/notification") &&
      (currentUrl.includes("/login") ||
        (await page.$('input[type="password"]').catch(() => null)) !== null);

    if (isLoginPage || !currentUrl.includes("/notification")) {
      // Fill login credentials
      const userInput = await page.$(
        'input[name="username"], input[name="user"], input[type="text"], input[type="email"]'
      );
      const passInput = await page.$('input[name="password"], input[type="password"]');

      if (userInput && passInput) {
        // Use type() to trigger Angular reactive form validation (fill() bypasses it)
        await userInput.click();
        await page.keyboard.type(username, { delay: 50 });
        await passInput.click();
        await page.keyboard.type(password, { delay: 50 });

        // Wait for Angular to enable the submit button
        await page
          .waitForSelector('button[type="submit"]:not([disabled]):not(.mat-button-disabled)', {
            timeout: 5000,
          })
          .catch(() => {});

        await page.click('button[type="submit"]:not([disabled]), button[aria-label="כניסה"]:not([disabled])');
        await page.waitForNavigation({ waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
      }

      // Navigate to notifications page after login
      currentUrl = page.url();
      if (!currentUrl.includes("/notification")) {
        await page.goto(`${SMARTSCHOOL_URL}/notification`, {
          waitUntil: "networkidle",
          timeout: 20000,
        }).catch(() => {});
      }
    }

    // Wait extra time for Angular/React SPA to render content
    await page.waitForTimeout(3000);

    // Try to wait for any row-like elements (Angular Material or standard table)
    await page
      .waitForSelector(
        [
          "mat-row",
          "tr.mat-row",
          "tbody tr",
          "[class*='notification-row']",
          "[class*='notification-item']",
        ].join(", "),
        { timeout: 10000 }
      )
      .catch(() => {
        // Proceed even if no known selector found
      });

    if (debugMode) {
      const html = await page.content();
      await browser.close();
      return NextResponse.json({ url: page.url(), html: html.substring(0, 50000) });
    }

    // Extract announcements — handles Angular Material tables and standard HTML tables
    const scraped = await page.evaluate(() => {
      const results: Array<{
        id: string;
        title: string;
        content: string;
        date: string;
      }> = [];

      // --- Strategy 1: Angular Material table rows (mat-row) ---
      const matRows = Array.from(
        document.querySelectorAll("mat-row, tr.mat-row, [class*='mat-row']")
      );

      if (matRows.length > 0) {
        matRows.slice(0, 5).forEach((row, idx) => {
          const cells = Array.from(
            row.querySelectorAll("mat-cell, td.mat-cell, td, [class*='mat-cell']")
          );
          const texts = cells.map((c) => c.textContent?.trim() || "").filter(Boolean);
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

      // --- Strategy 2: Standard HTML table rows (skip header) ---
      if (results.length === 0) {
        const tables = document.querySelectorAll("table");
        tables.forEach((table) => {
          const rows = Array.from(table.querySelectorAll("tbody tr, tr:not(:first-child)"));
          rows.slice(0, 5).forEach((row, idx) => {
            const cells = Array.from(row.querySelectorAll("td"));
            const texts = cells.map((c) => c.textContent?.trim() || "").filter(Boolean);
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

      // --- Strategy 3: Any list items or divs with substantial text ---
      if (results.length === 0) {
        const candidates = Array.from(
          document.querySelectorAll(
            "li, .notification-item, .message-item, div[class*='notification'], div[class*='message']"
          )
        );
        candidates
          .filter((el) => (el.textContent?.trim().length || 0) > 20)
          .slice(0, 5)
          .forEach((el, idx) => {
            const text = el.textContent?.trim() || "";
            results.push({
              id: el.getAttribute("data-id") || String(idx),
              title: text.substring(0, 120),
              content: text,
              date: new Date().toISOString(),
            });
          });
      }

      return results;
    });

    await browser.close();

    if (scraped.length === 0) {
      return NextResponse.json({
        synced: 0,
        message: "No announcements found on page. Try POST /api/scrape-school?debug=1 to inspect HTML.",
      });
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
