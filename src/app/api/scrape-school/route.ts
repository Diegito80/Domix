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

    const page = await context.newPage();

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

    // Use discovered endpoints or fall back to guesses
    const loginEndpoints = (endpointScan as string[]).filter(
      (e) => e.toLowerCase().includes("login") || e.toLowerCase().includes("signin") || e.toLowerCase().includes("auth")
    );
    if (loginEndpoints.length === 0) {
      loginEndpoints.push("/server/api/user/login", "/server/api/user/signIn");
    }

    // --- LOGIN VIA DIRECT API CALL from within the browser page ---
    const loginResult = await page.evaluate(
      async ([user, pass, endpoints]) => {
        const bodies = (u: string, p: string) => [
          { param1: u, param2: p },
          { param1: u, param2: p, param3: null, param4: "" },
          { username: u, password: p },
        ];

        for (const ep of endpoints as string[]) {
          for (const body of bodies(user, pass)) {
            try {
              const res = await fetch(`https://webtopserver.smartschool.co.il${ep}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
              });
              if (res.status !== 404) {
                const text = await res.text().catch(() => "");
                let data: unknown = text;
                try { data = JSON.parse(text); } catch {}
                return { endpoint: ep, body, status: res.status, data };
              }
            } catch (_e) { /* continue */ }
          }
        }
        return { error: "No working login endpoint found", tried: endpoints };
      },
      [username, password, loginEndpoints]
    );

    if (!loginResult || (loginResult as Record<string, unknown>).error) {
      await browser.close();
      return NextResponse.json({ synced: 0, message: "Login failed", loginResult });
    }

    // Check if login succeeded
    const loginData = loginResult as Record<string, unknown>;
    const loginSucceeded =
      loginData.status === 200 &&
      (loginData.data as Record<string, unknown>)?.status === true;

    if (!loginSucceeded) {
      await browser.close();
      return NextResponse.json({
        synced: 0,
        message: "Login failed or endpoint not found. Run with ?debug=1 for details.",
        loginResult,
      });
    }

    // --- FETCH NOTIFICATIONS via API ---
    const notifResult = await page.evaluate(
      async (apiUrl) => {
        const endpoints = [
          "notification/getList",
          "notification/getNotifications",
          "notification/list",
          "notification/GetList",
          "notification/GetNotifications",
          "user/getNotifications",
          "user/notifications",
        ];

        for (const ep of endpoints) {
          try {
            const res = await fetch(`${apiUrl}/${ep}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: "{}",
            });
            if (res.status !== 404) {
              const text = await res.text().catch(() => "");
              let data: unknown = text;
              try {
                data = JSON.parse(text);
              } catch {}
              return { endpoint: ep, status: res.status, data };
            }
          } catch (_e) {
            // continue
          }
        }
        return { error: "No notification endpoint found" };
      },
      API_URL
    );

    await browser.close();

    // Parse notification data
    const notifData = notifResult as Record<string, unknown>;
    const rawData = (notifData.data as Record<string, unknown>)?.data;
    const items: Array<Record<string, unknown>> = Array.isArray(rawData)
      ? (rawData as Array<Record<string, unknown>>)
      : [];

    if (items.length === 0) {
      return NextResponse.json({
        synced: 0,
        message: "Login succeeded but no notifications found.",
        notifResult,
      });
    }

    let synced = 0;
    for (const item of items.slice(0, 10)) {
      const id = String(item.id || item.Id || Math.random());
      const title = String(
        item.title || item.Title || item.subject || item.Subject || ""
      ).substring(0, 120);
      const content = String(
        item.content || item.Content || item.body || item.Body || item.message || title
      );

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
