import { test, expect } from "@playwright/test";

test.describe("Address search (Milestone 2, mock fixtures)", () => {
  test("expands the inline form, searches a known address, and lands on the property page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Analyze a Specific Property" }).click();
    await page.getByLabel("Property address").fill("514 Maple Street, Detroit, MI 48214");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page).toHaveURL(/\/property\/prop-maple-514$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "514 Maple Street, Detroit, MI 48214",
    );

    // Core facts render with real (mock) values, not fabricated ones.
    await expect(page.getByText("$189,000")).toBeVisible();
    await expect(page.getByText("Active listing")).toBeVisible();

    // A fact with no reporting source shows "Not available", never a guess.
    await page.getByRole("button", { name: "View Data Sources" }).click();
    const lotSizeRow = page.locator("li", { hasText: "Lot size" });
    await expect(lotSizeRow).toContainText("Not available");
  });

  test("shows a selection list when more than one property matches", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Analyze a Specific Property" }).click();
    await page.getByLabel("Property address").fill("22 Elm Court");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page.getByText(/more than one property matched/i)).toBeVisible();
    const springfieldIL = page.getByRole("link", { name: /Springfield, IL/ });
    const springfieldMO = page.getByRole("link", { name: /Springfield, MO/ });
    await expect(springfieldIL).toBeVisible();
    await expect(springfieldMO).toBeVisible();

    await springfieldIL.click();
    await expect(page).toHaveURL(/\/property\/prop-elm-il$/);
  });

  test("shows a no-match message instead of fabricating a result", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Analyze a Specific Property" }).click();
    await page.getByLabel("Property address").fill("999 Nowhere Road, Nowhere, ZZ 00000");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page.getByText(/couldn't find that address/i)).toBeVisible();
  });

  test("off-market property shows a prominent off-market notice", async ({ page }) => {
    await page.goto("/property/prop-oak-812");
    await expect(page.getByRole("status")).toContainText("Off-market property");
  });

  test("a property with zero photos shows the missing-image placeholder", async ({ page }) => {
    await page.goto("/property/prop-birch-215");
    await expect(page.getByRole("img", { name: /no photos available/i })).toBeVisible();
  });

  test("a property with multiple photos shows clickable thumbnails", async ({ page }) => {
    await page.goto("/property/prop-maple-514");
    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(3);
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  });

  test("an unknown property id renders Next's not-found page", async ({ page }) => {
    const response = await page.goto("/property/does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
