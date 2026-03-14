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

  const reqUrl = new URL(request.url);
  const debugMode = reqUrl.searchParams.get("debug") === "1";

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

    // Intercept API calls to discover login endpoint and capture auth tokens
    const capturedRequests: Array<{ url: string; method: string; body: string }> = [];
    const capturedResponses: Array<{ url: string; status: number; body: string }> = [];

    context.on("request", (req) => {
      const url = req.url();
      if (
        url.includes("/api/") ||
        url.includes("/auth") ||
        url.includes("/login") ||
        url.includes("/token") ||
        url.includes("/notification")
      ) {
        capturedRequests.push({
          url,
          method: req.method(),
          body: req.postData() || "",
        });
      }
    });

    context.on("response", async (res) => {
      const url = res.url();
      if (
        url.includes("/api/") ||
        url.includes("/auth") ||
        url.includes("/login") ||
        url.includes("/token") ||
        url.includes("/notification")
      ) {
        const body = await res.text().catch(() => "");
        capturedResponses.push({ url, status: res.status(), body: body.substring(0, 2000) });
      }
    });

    const page = await context.newPage();

    // Inject a grecaptcha mock BEFORE the page loads so Angular's captcha
    // directive thinks verification is already complete and enables the submit button
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>)["grecaptcha"] = {
        ready: (cb: () => void) => cb(),
        execute: (_siteKey: string, _opts: unknown) => Promise.resolve("mock-token"),
        render: () => 0,
        getResponse: () => "mock-token",
        reset: () => {},
      };
    });

    // Go to login page and wait for it to fully render
    await page.goto(`${SMARTSCHOOL_URL}/account/login`, {
      waitUntil: "networkidle",
      timeout: 30000,
    }).catch(() => {});

    // Wait for Angular to hydrate
    await page.waitForTimeout(2000);

    // Use Playwright locators with pressSequentially — triggers each keystroke
    // individually which reliably fires Angular reactive form validation
    const userLocator = page.locator('input[type="text"], input[type="email"]').first();
    const passLocator = page.locator('input[type="password"]').first();

    await userLocator.click();
    await userLocator.pressSequentially(username, { delay: 80 });

    await passLocator.click();
    await passLocator.pressSequentially(password, { delay: 80 });

    // Give Angular 2s to run form validation after typing
    await page.waitForTimeout(2000);

    // Wait for submit button to become enabled (captcha mock should allow it)
    await page
      .waitForSelector(
        'button[type="submit"]:not([disabled]):not(.mat-button-disabled)',
        { timeout: 5000 }
      )
      .catch(() => {});

    // Click submit or press Enter as fallback
    const submitEnabled = await page.$('button[type="submit"]:not([disabled])');
    if (submitEnabled) {
      await submitEnabled.click();
    } else {
      await passLocator.press("Enter");
    }

    // Wait for navigation after submit
    await page.waitForTimeout(3000);
    await page.waitForLoadState("networkidle").catch(() => {});

    // Navigate to notifications
    if (!page.url().includes("/notification")) {
      await page.goto(`${SMARTSCHOOL_URL}/notification`, {
        waitUntil: "networkidle",
        timeout: 20000,
      }).catch(() => {});
    }

    // Wait for Angular to render table content
    await page.waitForTimeout(3000);
    await page
      .waitForSelector("mat-row, tr.mat-row, tbody tr", { timeout: 8000 })
      .catch(() => {});

    if (debugMode) {
      const html = await page.content();
      await browser.close();
      return NextResponse.json({
        finalUrl: page.url(),
        capturedRequests,
        capturedResponses,
        html: html.substring(0, 30000),
      });
    }

    // Extract announcements
    const scraped = await page.evaluate(() => {
      const results: Array<{ id: string; title: string; content: string; date: string }> = [];

      // Strategy 1: Angular Material table rows
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

      // Strategy 2: Standard HTML table rows
      if (results.length === 0) {
        document.querySelectorAll("table").forEach((table) => {
          Array.from(table.querySelectorAll("tbody tr, tr:not(:first-child)"))
            .slice(0, 5)
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

      // Strategy 3: Any element with enough text
      if (results.length === 0) {
        Array.from(
          document.querySelectorAll(
            "li, .notification-item, .message-item, div[class*='notification'], div[class*='message']"
          )
        )
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
        message:
          "No announcements found. Run with ?debug=1 to see captured API calls and HTML.",
      });
    }

    let synced = 0;
    for (const item of scraped) {
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

    return NextResponse.json({ synced, total: scraped.length });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
