import { test, expect } from "@playwright/test";

async function fillRequiredFields(page: import("@playwright/test").Page) {
  await page.getByLabel("Address").fill("123 Main St, Detroit, MI");
  await page.getByLabel("Purchase price").fill("250000");
  await page.getByLabel("Monthly rent").fill("2000");
  await page.getByLabel("Bedrooms").fill("3");
  await page.getByLabel("Bathrooms").fill("1.5");
  await page.getByLabel("Square footage").fill("1250");
}

async function fillFinancingAndExpenses(page: import("@playwright/test").Page) {
  await page.getByLabel("Down payment").fill("50000");
  await page.getByLabel("Interest rate (%)").fill("6");
  await page.getByLabel("Loan term (years)").fill("30");
  await page.getByLabel("Property taxes (monthly)").fill("200");
  await page.getByLabel("Insurance (monthly)").fill("100");
  await page.getByLabel("Property management (monthly)").fill("150");
  await page.getByLabel("Maintenance reserve (monthly)").fill("75");
  await page.getByLabel("HOA (monthly)").fill("0");
  await page.getByLabel("Monthly vacancy reserve").fill("50");
  await page.getByLabel("Utilities (monthly)").fill("25");
}

test.describe("Manual Deal Entry", () => {
  test("computes price per square foot and annual rent from required fields alone, live, with no submit step", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: /calculate|submit/i })).toHaveCount(0);

    await fillRequiredFields(page);

    await expect(page.getByText("$200.00")).toBeVisible();
    // Scoped to its own row: with every expense blank (treated as $0),
    // Annual NOI is now also $24,000 — the same figure as Annual rental
    // income — so an unscoped locator would match both.
    const annualRentalIncomeRow = page.locator("dt", { hasText: "Annual rental income" }).locator("xpath=..");
    await expect(annualRentalIncomeRow.getByText("$24,000.00")).toBeVisible();
    await expect(page.getByText(/not calculated/i).first()).toBeVisible();
  });

  test("computes the full financial breakdown once financing and expenses are filled in", async ({ page }) => {
    await page.goto("/deal-analyzer/manual");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: /add more details/i }).click();
    await fillFinancingAndExpenses(page);

    await expect(page.getByText("$200,000.00")).toBeVisible(); // loan amount
    await expect(page.getByText("6.72%")).toBeVisible(); // cap rate
    await expect(page.getByText(/not calculated/i)).toHaveCount(0);
  });

  test("treats a blank HOA as $0 rather than blocking cap rate or NOI", async ({ page }) => {
    await page.goto("/deal-analyzer/manual");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: /add more details/i }).click();
    await fillFinancingAndExpenses(page);
    // HOA was already entered as $0 above — clearing it back to blank must
    // produce the identical, fully-calculated result rather than blocking.
    await page.getByLabel("HOA (monthly)").fill("");

    await expect(page.getByText(/not calculated/i)).toHaveCount(0);
    await expect(page.getByText("$200,000.00")).toBeVisible(); // loan amount
    await expect(page.getByText("6.72%")).toBeVisible(); // cap rate, unchanged
  });

  test("computes cash flow using $0 for every blank optional expense once financing is filled in", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: /add more details/i }).click();
    await page.getByLabel("Down payment").fill("50000");
    await page.getByLabel("Interest rate (%)").fill("6");
    await page.getByLabel("Loan term (years)").fill("30");
    // Every expense field is left blank on purpose.

    await expect(page.getByText(/not calculated/i)).toHaveCount(0);
  });

  test("shows the notice explaining blank optional expense fields are treated as $0", async ({ page }) => {
    await page.goto("/deal-analyzer/manual");

    await expect(
      page.getByText(/blank optional expense fields are treated as \$0/i),
    ).toBeVisible();
  });

  test("shows a specific explanation, not a calculated number, when down payment is explicitly $0", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: /add more details/i }).click();
    await fillFinancingAndExpenses(page);
    await page.getByLabel("Down payment").fill("0");

    await expect(page.getByText(/\$0 down payment/i)).toBeVisible();
  });

  test("preserves an invalid entry and shows an inline error instead of discarding it", async ({ page }) => {
    await page.goto("/deal-analyzer/manual");
    const purchasePrice = page.getByLabel("Purchase price");
    await purchasePrice.fill("-5");
    await purchasePrice.blur();

    await expect(page.getByText(/purchase price must be a positive number/i)).toBeVisible();
    await expect(purchasePrice).toHaveValue("-5");
  });

  test("switches down payment to Percent mode, converts 20% of $150,000 to a $30,000 calculated amount, and feeds financing metrics", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: /add more details/i }).click();
    await page.getByLabel("Purchase price").fill("150000");

    await page.getByRole("radio", { name: "Percent (%)" }).check();
    await page.getByLabel("Down payment percentage").fill("20");
    await expect(page.getByText("Calculated down payment: $30,000.00")).toBeVisible();

    await page.getByLabel("Interest rate (%)").fill("6");
    await page.getByLabel("Loan term (years)").fill("30");

    const loanAmountRow = page.locator("dt", { hasText: "Loan amount" }).locator("xpath=..");
    await expect(loanAmountRow.getByText("$120,000.00")).toBeVisible();

    // Switch back to Amount and confirm the converted dollar value carried over.
    await page.getByRole("radio", { name: "Amount ($)" }).check();
    await expect(page.getByLabel("Down payment")).toHaveValue("30000");
  });

  test("uses arrow keys to move focus and selection between the Amount and Percent radio options", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await page.getByRole("button", { name: /add more details/i }).click();

    const amountRadio = page.getByRole("radio", { name: "Amount ($)" });
    const percentRadio = page.getByRole("radio", { name: "Percent (%)" });

    await amountRadio.focus();
    await expect(amountRadio).toBeChecked();

    await page.keyboard.press("ArrowRight");
    await expect(percentRadio).toBeChecked();
    await expect(percentRadio).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await expect(amountRadio).toBeChecked();
    await expect(amountRadio).toBeFocused();
  });
});
