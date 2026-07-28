import { test, expect } from "@playwright/test";

test.describe("Deal Analyzer — property-seeded entry (Milestone 3C)", () => {
  test("the property page links to Deal Analyzer for that property", async ({ page }) => {
    await page.goto("/property/prop-maple-514");

    const link = page.getByRole("link", { name: "Analyze this deal" });
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(/\/deal-analyzer\/property\/prop-maple-514$/);
  });

  test("pre-fills address, purchase price, bedrooms, bathrooms, and square footage from the mock property, tagged From property data", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/property/prop-maple-514");

    await expect(page.getByLabel("Address")).toHaveValue("514 Maple Street, Detroit, MI 48214");
    await expect(page.getByLabel("Purchase price")).toHaveValue("189000");
    await expect(page.getByLabel("Bedrooms")).toHaveValue("3");
    await expect(page.getByLabel("Bathrooms")).toHaveValue("1.5");
    await expect(page.getByLabel("Square footage")).toHaveValue("1450");

    const propertySummary = page.getByRole("region", { name: "Property summary" });
    await expect(propertySummary.getByText("From property data").first()).toBeVisible();
  });

  test("leaves monthly rent blank and required, never inventing a value the property data doesn't have", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/property/prop-maple-514");

    const monthlyRent = page.getByLabel("Monthly rent");
    await expect(monthlyRent).toHaveValue("");

    await monthlyRent.focus();
    await monthlyRent.blur();
    await expect(page.getByText(/enter the monthly rent/i)).toBeVisible();
  });

  test("relabels an edited seeded field as From property data (edited), and still recalculates live", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/property/prop-maple-514");

    const purchasePrice = page.getByLabel("Purchase price");
    await purchasePrice.fill("200000");

    const propertySummary = page.getByRole("region", { name: "Property summary" });
    const priceRow = propertySummary.locator("dt", { hasText: "Purchase price" }).locator("xpath=..");
    await expect(priceRow.getByText("From property data (edited)")).toBeVisible();
    await expect(priceRow.getByText("$200,000.00")).toBeVisible();

    // Square footage is untouched — still plain "From property data".
    const sqftRow = propertySummary.locator("dt", { hasText: "Square footage" }).locator("xpath=..");
    await expect(sqftRow.getByText("From property data", { exact: true })).toBeVisible();

    await page.getByLabel("Monthly rent").fill("2000");
    const priceSqftRow = propertySummary.locator("dt", { hasText: "Price per square foot" }).locator("xpath=..");
    await expect(priceSqftRow.getByText(/^\$\d/)).toBeVisible();
  });

  test("renders Next's not-found page for an unknown property id", async ({ page }) => {
    const response = await page.goto("/deal-analyzer/property/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("shows the property-data confidence status (Codex finding 1) alongside the provenance tag", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/property/prop-maple-514");

    const propertySummary = page.getByRole("region", { name: "Property summary" });
    const priceRow = propertySummary.locator("dt", { hasText: "Purchase price" }).locator("xpath=..");
    await expect(priceRow.getByText("From property data")).toBeVisible();
    await expect(priceRow.getByText("Reported")).toBeVisible();
  });

  test("clearing a seeded field to blank keeps the (edited) tag and never restores the original value (Codex finding 3)", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/property/prop-maple-514");

    await page.getByLabel("Address").fill("");

    const propertySummary = page.getByRole("region", { name: "Property summary" });
    const addressRow = propertySummary.locator("dt", { hasText: "Address" }).locator("xpath=..");
    await expect(addressRow.getByText("Not provided")).toBeVisible();
    await expect(addressRow.getByText("From property data (edited)")).toBeVisible();
    await expect(addressRow.getByText("514 Maple Street, Detroit, MI 48214")).toHaveCount(0);
  });
});
