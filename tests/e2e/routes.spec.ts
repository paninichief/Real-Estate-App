import { test, expect } from "@playwright/test";

const TOP_LEVEL_ROUTES = [
  "/",
  "/investor-search",
  "/home-buyers",
  "/deal-analyzer",
  "/my-deals",
  "/profile",
  "/help",
  "/about",
  "/contact",
  "/sign-in",
  "/create-account",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/investment-disclaimer",
  "/legal/ai-disclaimer",
  "/legal/property-data-disclaimer",
  "/legal/fair-housing",
  "/legal/accessibility",
];

for (const route of TOP_LEVEL_ROUTES) {
  test(`${route} renders without error`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const response = await page.goto(route);
    expect(response?.status(), `${route} should respond 200`).toBe(200);

    // Header and footer are on every page.
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    // Every route renders exactly one top-level heading.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    expect(consoleErrors, `console errors on ${route}`).toEqual([]);
    expect(pageErrors, `uncaught page errors on ${route}`).toEqual([]);
  });
}

test("sticky header stays visible while scrolling on the home page", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  await expect(header).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 2000));
  await expect(header).toBeInViewport();
});

test("theme toggle switches between light and dark", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");

  await page.getByRole("button", { name: "Dark" }).first().click();
  await expect(html).toHaveClass(/dark/);

  await page.getByRole("button", { name: "Light" }).first().click();
  await expect(html).not.toHaveClass(/dark/);
});

test("sign-in and create-account pages link to each other", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("main").getByRole("link", { name: "Create one" }).click();
  await expect(page).toHaveURL(/\/create-account$/);

  await page.getByRole("main").getByRole("link", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
});
