/**
 * Run this once to generate auth.json with your SmartSchool session.
 * Usage: node login.mjs
 *
 * A browser window will open — log in manually, then wait for the
 * notifications page. The script saves auth.json and exits.
 */
import { chromium } from "playwright";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

(async () => {
  const executablePath =
    process.env.CHROMIUM_PATH ||
    "/Users/roy.d/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

  console.log("Launching browser...");
  const browser = await chromium.launch({
    headless: false,
    executablePath,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://webtop.smartschool.co.il/account/login");

  console.log("ACTION REQUIRED: Log in manually in the browser window.");
  console.log("Waiting for redirect to the notifications page...");

  await page.waitForURL("**/notification**", { timeout: 0 });

  const authPath = join(__dirname, "auth.json");
  await context.storageState({ path: authPath });
  console.log(`Session saved to ${authPath}`);

  await browser.close();
})();
