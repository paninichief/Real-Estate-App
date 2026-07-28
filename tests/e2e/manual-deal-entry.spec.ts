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

  test("blocks expense-dependent metrics and names HOA as invalid when it is negative, leaving unrelated metrics calculated, then restores on correction", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: /add more details/i }).click();
    await page.getByLabel("HOA (monthly)").fill("-50");

    const totalExpensesRow = page
      .locator("dt", { hasText: "Total monthly operating expenses" })
      .locator("xpath=..");
    await expect(totalExpensesRow.getByText(/not calculated/i)).toBeVisible();
    await expect(totalExpensesRow.getByText(/invalid/i)).toBeVisible();
    await expect(totalExpensesRow.getByText(/hoa/i)).toBeVisible();

    // Unrelated metrics stay calculated.
    await expect(page.getByText("$200.00")).toBeVisible(); // price per sqft

    await page.getByLabel("HOA (monthly)").fill("50");
    await expect(totalExpensesRow.getByText(/not calculated/i)).toHaveCount(0);
    await expect(totalExpensesRow.getByText("$50.00")).toBeVisible();
  });

  test("blocks loan amount when down payment exceeds purchase price, leaving cap rate calculated", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: /add more details/i }).click();
    await page.getByLabel("Purchase price").fill("150000");
    await page.getByLabel("Down payment").fill("200000");

    const loanAmountRow = page.locator("dt", { hasText: "Loan amount" }).locator("xpath=..");
    await expect(loanAmountRow.getByText(/not calculated/i)).toBeVisible();
    await expect(loanAmountRow.getByText(/invalid/i)).toBeVisible();
    await expect(loanAmountRow.getByText(/down payment/i)).toBeVisible();

    const capRateRow = page.locator("dt", { hasText: "Cap rate" }).locator("xpath=..");
    await expect(capRateRow.getByText(/not calculated/i)).toHaveCount(0);
  });

  test("adds an optional Property condition select with the exact options, informational only", async ({ page }) => {
    await page.goto("/deal-analyzer/manual");
    await page.getByRole("button", { name: /add more details/i }).click();

    const select = page.getByLabel("Property condition");
    const optionTexts = await select.locator("option").allTextContents();
    expect(optionTexts).toEqual(["", "Excellent", "Good", "Fair", "Poor", "Needs renovation", "Unknown"]);

    const row = page.locator("dt", { hasText: "Property condition" }).locator("xpath=..");
    await expect(row.getByText("Not provided")).toBeVisible();

    await select.selectOption("Fair");
    await expect(row.getByText("Fair")).toBeVisible();
    await expect(row.getByText("User input")).toBeVisible();
    await expect(row.getByText(/not included in these calculations/i)).toBeVisible();
  });

  test("preserves a dollar down payment entered before purchase price, deriving the percentage once purchase price becomes valid, even while Percent mode stays visible", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await page.getByRole("button", { name: /add more details/i }).click();

    await page.getByLabel("Down payment").fill("30000");
    await page.getByRole("radio", { name: "Percent (%)" }).check();
    await expect(page.getByLabel("Down payment percentage")).toHaveValue("");

    await page.getByLabel("Purchase price").fill("150000");
    await expect(page.getByLabel("Down payment percentage")).toHaveValue("20");

    await page.getByRole("radio", { name: "Amount ($)" }).check();
    await expect(page.getByLabel("Down payment")).toHaveValue("30000");
  });

  test("shows an accessible error immediately for an out-of-range down payment percentage, independent of purchase price, without converting it to a dollar amount", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: /add more details/i }).click();
    await page.getByRole("radio", { name: "Percent (%)" }).check();

    const percent = page.getByLabel("Down payment percentage");
    await percent.fill("-1");
    await expect(page.getByText(/between 0 and 100/i)).toBeVisible();
    await expect(percent).toHaveAttribute("aria-invalid", "true");
    await expect(percent).toHaveValue("-1");
    await expect(page.getByText(/^Calculated down payment:/)).toHaveCount(0);

    const loanAmountRow = page.locator("dt", { hasText: "Loan amount" }).locator("xpath=..");
    await expect(loanAmountRow.getByText(/not calculated/i)).toBeVisible();
    await expect(loanAmountRow.getByText(/down payment percentage/i)).toBeVisible();

    // Corrects to a valid percentage — error clears immediately and calculation resumes.
    await percent.fill("20");
    await expect(page.getByText(/between 0 and 100/i)).toHaveCount(0);
    await expect(page.getByText("Calculated down payment: $50,000.00")).toBeVisible();
    await expect(loanAmountRow.getByText(/not calculated/i)).toHaveCount(0);
  });

  test("keeps the dollar amount labeled User input after switching to view Percent mode, since the user typed the dollar amount", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: /add more details/i }).click();
    await page.getByLabel("Purchase price").fill("150000");
    await page.getByLabel("Down payment").fill("30000");

    await page.getByRole("radio", { name: "Percent (%)" }).check();

    // Scoped to "Your entries": the live form also has its own static
    // "Down payment" label above the mode selector, and "hasText" does
    // substring matching, so an unscoped/loose query would collide with it
    // or with "Down payment percentage (calculated)".
    const yourEntries = page.getByRole("region", { name: "Your entries" });

    // Plain heading for the true source (the dollar amount)...
    const dollarRow = yourEntries.locator("dt", { hasText: /^Down payment$/ }).locator("xpath=..");
    await expect(dollarRow.getByText("$30,000.00")).toBeVisible();
    await expect(dollarRow.getByText("User input")).toBeVisible();
    await expect(yourEntries.getByText("Down payment (calculated)")).toHaveCount(0);

    // ...and a "(calculated)" heading for the derived percentage.
    const percentRow = yourEntries
      .locator("dt", { hasText: /^Down payment percentage \(calculated\)$/ })
      .locator("xpath=..");
    await expect(percentRow.getByText("Calculated from user input")).toBeVisible();
    await expect(yourEntries.getByText("Down payment percentage", { exact: true })).toHaveCount(0);
  });

  test("keeps the percentage labeled User input after switching to view Amount mode, since the user typed the percentage", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: /add more details/i }).click();
    await page.getByLabel("Purchase price").fill("150000");
    await page.getByRole("radio", { name: "Percent (%)" }).check();
    await page.getByLabel("Down payment percentage").fill("20");

    await page.getByRole("radio", { name: "Amount ($)" }).check();

    // The single visible row uses the "(calculated)" heading since the
    // percentage, not the dollar amount, is the true source. Scoped to
    // "Your entries" — the live form's own static "Down payment" label
    // (above the mode selector) is unrelated and always present.
    const yourEntries = page.getByRole("region", { name: "Your entries" });
    await expect(yourEntries.getByText("Down payment", { exact: true })).toHaveCount(0);
    const dollarRow = yourEntries
      .locator("dt", { hasText: /^Down payment \(calculated\)$/ })
      .locator("xpath=..");
    await expect(dollarRow.getByText("$30,000.00")).toBeVisible();
    await expect(dollarRow.getByText("Calculated from user input")).toBeVisible();
  });

  test("hides the previously calculated down payment amount once the percentage becomes invalid, then shows the correct new amount once corrected", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: /add more details/i }).click();
    await page.getByLabel("Purchase price").fill("150000");
    await page.getByRole("radio", { name: "Percent (%)" }).check();

    const percent = page.getByLabel("Down payment percentage");
    const calculatedRow = page.locator("dt", { hasText: "Down payment (calculated)" }).locator("xpath=..");
    const loanAmountRow = page.locator("dt", { hasText: "Loan amount" }).locator("xpath=..");

    await percent.fill("20");
    await expect(calculatedRow.getByText("$30,000.00")).toBeVisible();

    await percent.fill("150");
    await expect(calculatedRow.getByText("$30,000.00")).toHaveCount(0);
    await expect(calculatedRow.getByText("Not provided")).toBeVisible();
    await expect(loanAmountRow.getByText(/not calculated/i)).toBeVisible();
    await expect(loanAmountRow.getByText(/down payment percentage/i)).toBeVisible();

    await percent.fill("25");
    await expect(calculatedRow.getByText("$37,500.00")).toBeVisible();
    await expect(loanAmountRow.getByText(/not calculated/i)).toHaveCount(0);
  });

  test("rejects a fractional bedroom count with an accessible error, preserves the value, and clears immediately once corrected", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    const bedrooms = page.getByLabel("Bedrooms");

    await bedrooms.fill("1.5");
    await bedrooms.blur();
    await expect(page.getByText(/whole number/i)).toBeVisible();
    await expect(bedrooms).toHaveAttribute("aria-invalid", "true");
    await expect(bedrooms).toHaveValue("1.5");

    await bedrooms.fill("2");
    await expect(page.getByText(/whole number/i)).toHaveCount(0);
  });

  test("does not convert an invalid 150% into a dollar amount after a purchase-price edit, and resumes correctly once corrected", async ({
    page,
  }) => {
    await page.goto("/deal-analyzer/manual");
    await fillRequiredFields(page); // purchase price = 250000
    await page.getByRole("button", { name: /add more details/i }).click();
    await page.getByRole("radio", { name: "Percent (%)" }).check();

    // 1. Enter 150%.
    await page.getByLabel("Down payment percentage").fill("150");

    // 2. Change purchase price.
    await page.getByLabel("Purchase price").fill("300000");

    // 3. Confirm no dollar amount is generated.
    const calculatedRow = page.locator("dt", { hasText: "Down payment (calculated)" }).locator("xpath=..");
    await expect(calculatedRow.getByText("Not provided")).toBeVisible();
    await expect(calculatedRow.getByText(/^\$/)).toHaveCount(0);

    const loanAmountRow = page.locator("dt", { hasText: "Loan amount" }).locator("xpath=..");
    await expect(loanAmountRow.getByText(/down payment percentage/i)).toBeVisible();

    // 4. Switch to Amount mode.
    await page.getByRole("radio", { name: "Amount ($)" }).check();

    // 5. Confirm no invalid derived amount appears.
    await expect(page.getByLabel("Down payment")).toHaveValue("");

    // 6. Correct percentage to a valid value.
    await page.getByRole("radio", { name: "Percent (%)" }).check();
    await page.getByLabel("Down payment percentage").fill("20");

    // 7. Confirm conversion resumes correctly (20% of 300000 = 60000).
    await expect(page.getByText("Calculated down payment: $60,000.00")).toBeVisible();
    await page.getByRole("radio", { name: "Amount ($)" }).check();
    await expect(page.getByLabel("Down payment")).toHaveValue("60000");
  });
});
