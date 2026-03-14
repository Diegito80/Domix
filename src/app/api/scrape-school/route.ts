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

    // --- LOGIN VIA DIRECT API CALL from within the browser page ---
    // The Angular app already has CORS access + correct cookies to webtopserver.
    // We bypass the UI form entirely and call the login API with credentials: "include".
    const loginResult = await page.evaluate(
      async ([user, pass, apiUrl]) => {
        // Try multiple login endpoint names and body formats
        const endpoints = [
          "user/Login",
          "user/login",
          "user/signIn",
          "user/SignIn",
          "user/userLogin",
          "user/UserLogin",
          "user/loginUser",
          "user/LoginUser",
          "auth/login",
          "auth/signIn",
        ];

        // Try both param1/param2 and username/password body formats
        const bodies = (u: string, p: string) => [
          { param1: u, param2: p },
          { param1: u, param2: p, param3: null, param4: "" },
          { username: u, password: p },
          { userName: u, password: p },
          { user: u, pass: p },
        ];

        for (const ep of endpoints) {
          for (const body of bodies(user, pass)) {
            try {
              const res = await fetch(`${apiUrl}/${ep}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
              });
              if (res.status !== 404) {
                const text = await res.text().catch(() => "");
                let data: unknown = text;
                try {
                  data = JSON.parse(text);
                } catch {}
                // Any non-404 response tells us we hit the right endpoint
                return { endpoint: ep, body, status: res.status, data };
              }
            } catch (_e) {
              // continue
            }
          }
        }
        return { error: "All login endpoints returned 404" };
      },
      [username, password, API_URL]
    );

    if (debugMode) {
      await browser.close();
      return NextResponse.json({ loginResult });
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
