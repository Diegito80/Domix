import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SMARTSCHOOL_URL = "https://webtop.smartschool.co.il";
const API_URL = "https://webtopserver.smartschool.co.il/server/api";
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

    // Block the real reCAPTCHA so our mock isn't overwritten
    await context.route("**/*recaptcha*", (route) => route.abort());

    const page = await context.newPage();

    // Inject a full grecaptcha mock BEFORE the page loads.
    // The ng2-recaptcha Angular library calls grecaptcha.render(el, { callback, ... })
    // — our mock calls that callback immediately with a fake token, which marks
    // the captcha form control as valid and enables the submit button.
    await page.addInitScript(() => {
      const w = window as unknown as Record<string, unknown>;

      // Angular sets window.ng2recaptchaloaded as the onload callback for the real script.
      // We intercept it so we can call it ourselves after setting up the mock.
      let _onload: (() => void) | null = null;
      Object.defineProperty(w, "ng2recaptchaloaded", {
        configurable: true,
        set(fn: () => void) { _onload = fn; },
        get() { return _onload; },
      });

      w["grecaptcha"] = {
        ready: (cb: () => void) => { setTimeout(cb, 0); },
        execute: (_key: string, _opts: unknown) => Promise.resolve("mock-captcha-token"),
        render: (_el: HTMLElement, config: Record<string, unknown>) => {
          // Call the success callback that ng2-recaptcha passes in — this is what
          // sets the captcha form control value and enables the submit button.
          if (typeof config?.callback === "function") {
            setTimeout(() => (config.callback as (t: string) => void)("mock-captcha-token"), 300);
          }
          return 0;
        },
        getResponse: () => "mock-captcha-token",
        reset: () => {},
      };

      // Trigger the ng2recaptchaloaded callback once Angular has set it
      setTimeout(() => { if (_onload) _onload(); }, 800);
    });

    // Load the login page so Angular initializes the session (sets cookies, calls getInput etc.)
    await page.goto(`${SMARTSCHOOL_URL}/account/login`, {
      waitUntil: "networkidle",
      timeout: 30000,
    }).catch(() => {});

    // Wait for Angular to initialize and call its startup APIs
    await page.waitForTimeout(2000);

    if (debugMode) {
      // Dump the live DOM form structure and all script URLs
      const debugInfo = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll("input")).map((i) => ({
          type: i.type,
          name: i.name,
          id: i.id,
          placeholder: i.placeholder,
          disabled: i.disabled,
          value: i.value ? "[has value]" : "[empty]",
          className: i.className.substring(0, 80),
        }));

        const buttons = Array.from(document.querySelectorAll("button")).map((b) => ({
          type: b.type,
          disabled: b.disabled,
          ariaDisabled: b.getAttribute("aria-disabled"),
          text: b.textContent?.trim().substring(0, 40),
          className: b.className.substring(0, 80),
        }));

        const scripts = Array.from(document.querySelectorAll("script"))
          .map((s) => ({ src: s.src, inline: !s.src ? s.textContent?.substring(0, 100) : null }))
          .filter((s) => s.src || s.inline);

        return { inputs, buttons, scriptCount: scripts.length, scripts: scripts.slice(0, 20) };
      });

      await browser.close();
      return NextResponse.json(debugInfo);
    }

    // Fill credentials with keystroke simulation (triggers Angular reactive form validation)
    const userLocator = page.locator('input[type="text"]').first();
    const passLocator = page.locator('input[type="password"]').first();

    await userLocator.click();
    await userLocator.pressSequentially(username, { delay: 60 });
    await passLocator.click();
    await passLocator.pressSequentially(password, { delay: 60 });

    // Wait for our captcha mock's callback (fires at 300ms) to enable the button
    await page.waitForSelector(
      'button[type="submit"]:not([disabled]):not(.mat-button-disabled)',
      { timeout: 5000 }
    ).catch(() => {});

    // Intercept the login API call to capture the real endpoint + session cookies
    let loginApiUrl = "";
    const loginPromise = new Promise<void>((resolve) => {
      context.on("request", (req) => {
        if (
          req.method() === "POST" &&
          req.url().includes("webtopserver") &&
          !req.url().includes("getInput") &&
          !req.url().includes("RememberMe") &&
          !req.url().includes("LogOut")
        ) {
          loginApiUrl = req.url();
          resolve();
        }
      });
      // Resolve anyway after 8s in case no login request fires
      setTimeout(resolve, 8000);
    });

    const submitBtn = await page.$('button[aria-label="כניסה"]:not([disabled])');
    if (submitBtn) {
      await submitBtn.click();
    } else {
      await passLocator.press("Enter");
    }

    await loginPromise;
    await page.waitForTimeout(3000);
    await page.waitForLoadState("networkidle").catch(() => {});

    if (debugMode) {
      const finalUrl = page.url();
      await browser.close();
      return NextResponse.json({ finalUrl, loginApiUrl, loginSucceeded: !finalUrl.includes("/login") });
    }

    // Navigate to notifications page
    if (!page.url().includes("/notification")) {
      await page.goto(`${SMARTSCHOOL_URL}/notification`, {
        waitUntil: "networkidle",
        timeout: 20000,
      }).catch(() => {});
    }

    // Wait for Angular to render the notifications table
    await page.waitForTimeout(3000);
    await page.waitForSelector("mat-row, tr.mat-row, tbody tr", { timeout: 8000 }).catch(() => {});

    // Extract announcements from the rendered table
    const items = await page.evaluate(() => {
      const results: Array<{ id: string; title: string; content: string; date: string }> = [];

      const matRows = Array.from(document.querySelectorAll("mat-row, tr.mat-row, [class*='mat-row']"));
      if (matRows.length > 0) {
        matRows.slice(0, 10).forEach((row, idx) => {
          const cells = Array.from(row.querySelectorAll("mat-cell, td.mat-cell, td, [class*='mat-cell']"));
          const texts = cells.map((c) => c.textContent?.trim() || "").filter(Boolean);
          if (texts.length > 0) {
            results.push({ id: row.getAttribute("data-id") || String(idx), title: texts[0].substring(0, 120), content: texts.slice(0, 2).join(" | "), date: texts[1] || new Date().toISOString() });
          }
        });
      }

      if (results.length === 0) {
        document.querySelectorAll("table").forEach((table) => {
          Array.from(table.querySelectorAll("tbody tr, tr:not(:first-child)")).slice(0, 10).forEach((row, idx) => {
            const texts = Array.from(row.querySelectorAll("td")).map((c) => c.textContent?.trim() || "").filter(Boolean);
            if (texts.length > 0) {
              results.push({ id: row.getAttribute("data-id") || `row-${idx}`, title: texts[0].substring(0, 120), content: texts.slice(0, 2).join(" | "), date: texts[1] || new Date().toISOString() });
            }
          });
        });
      }

      return results;
    });

    await browser.close();

    if (items.length === 0) {
      return NextResponse.json({ synced: 0, message: "Logged in but no notifications found in table." });
    }

    let synced = 0;
    for (const item of items) {
      const id = item.id;
      const title = item.title;
      const content = item.content;

      await prisma.schoolAnnouncement.upsert({
        where: { externalId: `smartschool-${id}` },
        update: { title, content },
        create: {
          title,
          content,
          subject: "general",
          priority: "info",
          source: "smartschool",
          externalId: `smartschool-${id}`,
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
