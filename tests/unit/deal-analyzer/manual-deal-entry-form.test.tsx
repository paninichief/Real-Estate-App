import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ManualDealEntryForm } from "@/components/deal-analyzer/manual-deal-entry-form";
import type { ManualDealSeed } from "@/lib/deal-analyzer/property-to-manual-deal";

const REQUIRED_LABELS = [
  "Address",
  "Purchase price",
  "Monthly rent",
  "Bedrooms",
  "Bathrooms",
  "Square footage",
];

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("Address"), { target: { value: "123 Main St" } });
  fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "250000" } });
  fireEvent.change(screen.getByLabelText("Monthly rent"), { target: { value: "2000" } });
  fireEvent.change(screen.getByLabelText("Bedrooms"), { target: { value: "3" } });
  fireEvent.change(screen.getByLabelText("Bathrooms"), { target: { value: "1.5" } });
  fireEvent.change(screen.getByLabelText("Square footage"), { target: { value: "1250" } });
}

function expandDetails() {
  fireEvent.click(screen.getByRole("button", { name: /add more details/i }));
}

describe("ManualDealEntryForm — required fields", () => {
  it("renders every required field as an accessible, labeled input", () => {
    render(<ManualDealEntryForm />);
    for (const label of REQUIRED_LABELS) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("shows an inline error and marks the field invalid when a required field is left blank on blur", () => {
    render(<ManualDealEntryForm />);
    const purchasePrice = screen.getByLabelText("Purchase price");

    fireEvent.focus(purchasePrice);
    fireEvent.blur(purchasePrice);

    expect(purchasePrice).toHaveAttribute("aria-invalid", "true");
    const describedBy = purchasePrice.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent(/enter the purchase price/i);
  });

  it("rejects a non-positive purchase price with a specific message", () => {
    render(<ManualDealEntryForm />);
    const purchasePrice = screen.getByLabelText("Purchase price");

    fireEvent.change(purchasePrice, { target: { value: "-5" } });
    fireEvent.blur(purchasePrice);

    expect(screen.getByText(/purchase price must be a positive number/i)).toBeInTheDocument();
  });

  it("preserves an invalid entered value instead of clearing it", () => {
    render(<ManualDealEntryForm />);
    const bedrooms = screen.getByLabelText("Bedrooms");

    fireEvent.change(bedrooms, { target: { value: "-1" } });
    fireEvent.blur(bedrooms);

    expect(screen.getByText(/bedrooms must be zero or a positive number/i)).toBeInTheDocument();
    expect(bedrooms).toHaveValue(-1);
  });

  it("clears the error once the field is corrected", () => {
    render(<ManualDealEntryForm />);
    const squareFootage = screen.getByLabelText("Square footage");

    fireEvent.change(squareFootage, { target: { value: "0" } });
    fireEvent.blur(squareFootage);
    expect(screen.getByText(/square footage must be a positive number/i)).toBeInTheDocument();

    fireEvent.change(squareFootage, { target: { value: "1250" } });
    fireEvent.blur(squareFootage);
    expect(screen.queryByText(/square footage must be a positive number/i)).not.toBeInTheDocument();
  });
});

describe("ManualDealEntryForm — bedrooms must be a whole number", () => {
  it("accepts 0 bedrooms", () => {
    render(<ManualDealEntryForm />);
    const bedrooms = screen.getByLabelText("Bedrooms");
    fireEvent.change(bedrooms, { target: { value: "0" } });
    fireEvent.blur(bedrooms);
    expect(screen.queryByText(/whole number/i)).not.toBeInTheDocument();
  });

  it("accepts 1 bedroom", () => {
    render(<ManualDealEntryForm />);
    const bedrooms = screen.getByLabelText("Bedrooms");
    fireEvent.change(bedrooms, { target: { value: "1" } });
    fireEvent.blur(bedrooms);
    expect(screen.queryByText(/whole number/i)).not.toBeInTheDocument();
  });

  it("rejects 1.5 bedrooms with an accessible error and preserves the entered value", () => {
    render(<ManualDealEntryForm />);
    const bedrooms = screen.getByLabelText("Bedrooms");
    fireEvent.change(bedrooms, { target: { value: "1.5" } });
    fireEvent.blur(bedrooms);

    expect(screen.getByText(/whole number/i)).toBeInTheDocument();
    expect(bedrooms).toHaveAttribute("aria-invalid", "true");
    expect(bedrooms).toHaveValue(1.5);
  });

  it("rejects negative bedrooms", () => {
    render(<ManualDealEntryForm />);
    const bedrooms = screen.getByLabelText("Bedrooms");
    fireEvent.change(bedrooms, { target: { value: "-1" } });
    fireEvent.blur(bedrooms);
    expect(screen.getByText(/bedrooms must be zero or a positive number/i)).toBeInTheDocument();
  });

  it("clears the whole-number error immediately once corrected from 1.5 to 2", () => {
    render(<ManualDealEntryForm />);
    const bedrooms = screen.getByLabelText("Bedrooms");
    fireEvent.change(bedrooms, { target: { value: "1.5" } });
    fireEvent.blur(bedrooms);
    expect(screen.getByText(/whole number/i)).toBeInTheDocument();

    fireEvent.change(bedrooms, { target: { value: "2" } });
    expect(screen.queryByText(/whole number/i)).not.toBeInTheDocument();
  });
});

describe("ManualDealEntryForm — Add More Details disclosure", () => {
  it("is a real button (keyboard-operable) and starts collapsed", () => {
    render(<ManualDealEntryForm />);
    const toggle = screen.getByRole("button", { name: /add more details/i });

    expect(toggle.tagName).toBe("BUTTON");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("Down payment")).not.toBeInTheDocument();
  });

  it("reveals optional fields when activated and hides them again when toggled back", () => {
    render(<ManualDealEntryForm />);
    const toggle = screen.getByRole("button", { name: /add more details/i });

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("Down payment")).toBeInTheDocument();
    expect(screen.getByLabelText("Interest rate (%)")).toBeInTheDocument();
    expect(screen.getByLabelText("Loan term (years)")).toBeInTheDocument();
    expect(screen.getByLabelText("Property taxes (monthly)")).toBeInTheDocument();
    expect(screen.getByLabelText("Insurance (monthly)")).toBeInTheDocument();
    expect(screen.getByLabelText("Property management (monthly)")).toBeInTheDocument();
    expect(screen.getByLabelText("Maintenance reserve (monthly)")).toBeInTheDocument();
    expect(screen.getByLabelText("HOA (monthly)")).toBeInTheDocument();
    expect(screen.getByLabelText("Monthly vacancy reserve")).toBeInTheDocument();
    expect(screen.getByLabelText("Utilities (monthly)")).toBeInTheDocument();
    expect(screen.getByLabelText("Number of units")).toBeInTheDocument();
    expect(screen.getByLabelText("Renovation costs")).toBeInTheDocument();
    expect(screen.getByLabelText("Occupancy")).toBeInTheDocument();
    expect(screen.getByLabelText("Section 8 status")).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("Down payment")).not.toBeInTheDocument();
  });
});

describe("ManualDealEntryForm — live recalculation", () => {
  it("computes price per square foot and annual rental income as soon as required fields are filled, with no submit step", () => {
    render(<ManualDealEntryForm />);
    expect(screen.queryByRole("button", { name: /calculate|submit/i })).not.toBeInTheDocument();

    fillRequiredFields();

    expect(screen.getByText("$200.00")).toBeInTheDocument();
    // Scoped to its own row: with every expense blank (treated as $0),
    // Annual NOI is now also $24,000 — the same figure as Annual rental
    // income — so an unscoped query would match both.
    const annualRentalIncomeRow = screen.getByText("Annual rental income").closest("div") as HTMLElement;
    expect(within(annualRentalIncomeRow).getByText("$24,000.00")).toBeInTheDocument();
  });

  it("shows Not calculated with the missing field named when an optional input needed for a metric is blank", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();

    expect(screen.getAllByText(/not calculated/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/down payment/i).length).toBeGreaterThan(0);
  });

  it("recalculates cash flow once every required expense and financing field is filled in", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();

    fireEvent.change(screen.getByLabelText("Down payment"), { target: { value: "50000" } });
    fireEvent.change(screen.getByLabelText("Interest rate (%)"), { target: { value: "6" } });
    fireEvent.change(screen.getByLabelText("Loan term (years)"), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText("Property taxes (monthly)"), { target: { value: "200" } });
    fireEvent.change(screen.getByLabelText("Insurance (monthly)"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Property management (monthly)"), { target: { value: "150" } });
    fireEvent.change(screen.getByLabelText("Maintenance reserve (monthly)"), { target: { value: "75" } });
    fireEvent.change(screen.getByLabelText("HOA (monthly)"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Monthly vacancy reserve"), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText("Utilities (monthly)"), { target: { value: "25" } });

    // Scoped to the "Monthly cash flow" row specifically: several other
    // values on the page (e.g. $200 property taxes, $200.00 price per
    // square foot) would otherwise also match a loose "$200.xx" pattern.
    const cashFlowRow = screen.getByText("Monthly cash flow").closest("div") as HTMLElement;
    expect(within(cashFlowRow).getByText(/^\$200\.\d{2}$/)).toBeInTheDocument();
  });

  it("computes cash flow using $0 for every blank optional expense once financing is filled in", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();

    fireEvent.change(screen.getByLabelText("Down payment"), { target: { value: "50000" } });
    fireEvent.change(screen.getByLabelText("Interest rate (%)"), { target: { value: "6" } });
    fireEvent.change(screen.getByLabelText("Loan term (years)"), { target: { value: "30" } });
    // Every expense field is left blank on purpose.

    const cashFlowRow = screen.getByText("Monthly cash flow").closest("div") as HTMLElement;
    expect(within(cashFlowRow).queryByText(/not calculated/i)).not.toBeInTheDocument();
    expect(within(cashFlowRow).getByText(/^\$\d/)).toBeInTheDocument();
  });
});

describe("ManualDealEntryForm — blank optional expense notice", () => {
  it("shows the notice explaining blank optional expense fields are treated as $0", () => {
    render(<ManualDealEntryForm />);

    expect(
      screen.getByText(/blank optional expense fields are treated as \$0/i),
    ).toBeInTheDocument();
  });
});

describe("ManualDealEntryForm — down payment Amount/Percent toggle", () => {
  it("defaults to Amount ($) mode", () => {
    render(<ManualDealEntryForm />);
    expandDetails();

    const amountRadio = screen.getByRole("radio", { name: "Amount ($)" });
    const percentRadio = screen.getByRole("radio", { name: "Percent (%)" });

    expect(amountRadio).toBeChecked();
    expect(percentRadio).not.toBeChecked();
    expect(screen.getByLabelText("Down payment")).toBeInTheDocument();
    expect(screen.queryByLabelText("Down payment percentage")).not.toBeInTheDocument();
  });

  it("computes a $30,000 down payment exactly as before in Amount mode", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();

    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.change(screen.getByLabelText("Down payment"), { target: { value: "30000" } });

    const loanAmountRow = screen.getByText("Loan amount").closest("div") as HTMLElement;
    expect(within(loanAmountRow).getByText("$120,000.00")).toBeInTheDocument();
  });

  it("converts 20% of a $150,000 purchase price to a $30,000 calculated down payment", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });

    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.change(screen.getByLabelText("Down payment percentage"), { target: { value: "20" } });

    expect(screen.getByText("Calculated down payment: $30,000.00")).toBeInTheDocument();
    const loanAmountRow = screen.getByText("Loan amount").closest("div") as HTMLElement;
    expect(within(loanAmountRow).getByText("$120,000.00")).toBeInTheDocument();
  });

  it("accepts 0% and 100%", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    const percent = screen.getByLabelText("Down payment percentage");
    fireEvent.change(percent, { target: { value: "0" } });
    fireEvent.blur(percent);
    expect(screen.getByText("Calculated down payment: $0.00")).toBeInTheDocument();
    expect(screen.queryByText(/between 0 and 100/i)).not.toBeInTheDocument();

    fireEvent.change(percent, { target: { value: "100" } });
    fireEvent.blur(percent);
    expect(screen.getByText("Calculated down payment: $150,000.00")).toBeInTheDocument();
    expect(screen.queryByText(/between 0 and 100/i)).not.toBeInTheDocument();
  });

  it("rejects a percentage below 0 or above 100 and preserves the entered value", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    const percent = screen.getByLabelText("Down payment percentage");
    fireEvent.change(percent, { target: { value: "-5" } });
    fireEvent.blur(percent);
    expect(screen.getByText(/between 0 and 100/i)).toBeInTheDocument();
    expect(percent).toHaveValue(-5);

    fireEvent.change(percent, { target: { value: "150" } });
    fireEvent.blur(percent);
    expect(screen.getByText(/between 0 and 100/i)).toBeInTheDocument();
    expect(percent).toHaveValue(150);
  });

  it("rejects a dollar amount exceeding the purchase price and preserves the entered value", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });

    const amount = screen.getByLabelText("Down payment");
    fireEvent.change(amount, { target: { value: "200000" } });
    fireEvent.blur(amount);

    expect(screen.getByText(/cannot exceed the purchase price/i)).toBeInTheDocument();
    expect(amount).toHaveValue(200000);
  });

  it("recalculates the percentage-based dollar amount immediately when purchase price changes", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.change(screen.getByLabelText("Down payment percentage"), { target: { value: "20" } });
    expect(screen.getByText("Calculated down payment: $30,000.00")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "300000" } });
    expect(screen.getByText("Calculated down payment: $60,000.00")).toBeInTheDocument();
  });

  it("converts Amount to Percent when switching modes", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.change(screen.getByLabelText("Down payment"), { target: { value: "30000" } });

    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    expect(screen.getByLabelText("Down payment percentage")).toHaveValue(20);
  });

  it("converts Percent to Amount when switching modes", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.change(screen.getByLabelText("Down payment percentage"), { target: { value: "20" } });

    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));
    expect(screen.getByLabelText("Down payment")).toHaveValue(30000);
  });

  it("does not drift after switching modes repeatedly without editing", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.change(screen.getByLabelText("Down payment"), { target: { value: "30000" } });

    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));

    expect(screen.getByLabelText("Down payment")).toHaveValue(30000);
  });

  it("preserves the entered percentage and explains when purchase price is missing, then resumes when it becomes valid", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Down payment percentage"), { target: { value: "20" } });

    expect(screen.getByLabelText("Down payment percentage")).toHaveValue(20);
    expect(
      screen.getByText(/enter a valid purchase price to calculate the down payment amount/i),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    expect(screen.getByLabelText("Down payment percentage")).toHaveValue(20);
    expect(screen.getByText("Calculated down payment: $30,000.00")).toBeInTheDocument();
  });

  it("uses the calculated dollar amount for financing metrics when set via Percent mode", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.change(screen.getByLabelText("Down payment percentage"), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText("Interest rate (%)"), { target: { value: "6" } });
    fireEvent.change(screen.getByLabelText("Loan term (years)"), { target: { value: "30" } });

    const mortgageRow = screen.getByText("Monthly mortgage payment").closest("div") as HTMLElement;
    expect(within(mortgageRow).queryByText(/not calculated/i)).not.toBeInTheDocument();
    expect(within(mortgageRow).getByText(/^\$\d/)).toBeInTheDocument();

    // "Cash-on-cash return" matches both the section heading and the metric
    // row label — the row label is the second (last) match in DOM order.
    const cashOnCashRow = screen.getAllByText("Cash-on-cash return").at(-1)?.closest("div") as HTMLElement;
    expect(within(cashOnCashRow).queryByText(/not calculated/i)).not.toBeInTheDocument();
  });

  it("keeps both mode options keyboard-focusable radio inputs", () => {
    render(<ManualDealEntryForm />);
    expandDetails();

    const amountRadio = screen.getByRole("radio", { name: "Amount ($)" });
    const percentRadio = screen.getByRole("radio", { name: "Percent (%)" });
    expect(amountRadio.tagName).toBe("INPUT");
    expect(percentRadio.tagName).toBe("INPUT");

    percentRadio.focus();
    expect(percentRadio).toHaveFocus();
  });

  it("rejects a dollar amount exceeding the purchase price and blocks the financing metrics that use it, leaving cap rate calculated", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.change(screen.getByLabelText("Down payment"), { target: { value: "200000" } });

    const loanAmountRow = screen.getByText("Loan amount").closest("div") as HTMLElement;
    expect(within(loanAmountRow).getByText(/not calculated/i)).toBeInTheDocument();
    expect(within(loanAmountRow).getByText(/invalid/i)).toBeInTheDocument();
    expect(within(loanAmountRow).getByText(/down payment/i)).toBeInTheDocument();

    // Cap rate does not depend on down payment and must remain unaffected.
    const capRateRow = screen.getByText("Cap rate").closest("div") as HTMLElement;
    expect(within(capRateRow).queryByText(/not calculated/i)).not.toBeInTheDocument();
  });

  it("preserves a dollar down payment entered before purchase price, even after switching to Percent mode and back", () => {
    render(<ManualDealEntryForm />);
    expandDetails();

    // Purchase price is still blank; enter the dollar amount directly.
    fireEvent.change(screen.getByLabelText("Down payment"), { target: { value: "30000" } });

    // Switching to Percent mode with purchase price still blank correctly
    // shows a blank percentage — there isn't enough information yet.
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    expect(screen.getByLabelText("Down payment percentage")).toHaveValue(null);

    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));
    expect(screen.getByLabelText("Down payment")).toHaveValue(30000);
  });

  it("derives the percentage from the preserved dollar amount once purchase price becomes valid, without erasing it, even while Percent mode is still visible", () => {
    render(<ManualDealEntryForm />);
    expandDetails();

    // Enter a dollar amount while purchase price is blank, then switch to
    // Percent mode (still blank there) and only then supply a purchase
    // price — this is the exact out-of-order sequence that used to erase
    // the entered amount.
    fireEvent.change(screen.getByLabelText("Down payment"), { target: { value: "30000" } });
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });

    expect(screen.getByLabelText("Down payment percentage")).toHaveValue(20);

    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));
    expect(screen.getByLabelText("Down payment")).toHaveValue(30000);
  });

  it("preserves a dollar amount entered while purchase price is merely invalid (not just blank), deriving the percentage once purchase price is fixed", () => {
    render(<ManualDealEntryForm />);
    expandDetails();

    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Down payment"), { target: { value: "30000" } });
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    expect(screen.getByLabelText("Down payment percentage")).toHaveValue(null);

    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    expect(screen.getByLabelText("Down payment percentage")).toHaveValue(20);

    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));
    expect(screen.getByLabelText("Down payment")).toHaveValue(30000);
  });
});

describe("ManualDealEntryForm — invalid values never contribute to calculations", () => {
  it("blocks expense-dependent metrics and names HOA when it is negative, leaving unrelated metrics calculated", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();

    fireEvent.change(screen.getByLabelText("HOA (monthly)"), { target: { value: "-50" } });

    const totalExpensesRow = screen
      .getByText("Total monthly operating expenses")
      .closest("div") as HTMLElement;
    expect(within(totalExpensesRow).getByText(/not calculated/i)).toBeInTheDocument();
    expect(within(totalExpensesRow).getByText(/invalid/i)).toBeInTheDocument();
    expect(within(totalExpensesRow).getByText(/hoa/i)).toBeInTheDocument();

    // Unrelated metrics (no expense dependency) must remain calculated.
    expect(screen.getByText("$200.00")).toBeInTheDocument(); // price per sqft
    const annualRentalIncomeRow = screen.getByText("Annual rental income").closest("div") as HTMLElement;
    expect(within(annualRentalIncomeRow).getByText("$24,000.00")).toBeInTheDocument();
  });

  it("restores calculation immediately once the invalid HOA value is corrected", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();

    const hoa = screen.getByLabelText("HOA (monthly)");
    fireEvent.change(hoa, { target: { value: "-50" } });
    let totalExpensesRow = screen.getByText("Total monthly operating expenses").closest("div") as HTMLElement;
    expect(within(totalExpensesRow).getByText(/not calculated/i)).toBeInTheDocument();

    fireEvent.change(hoa, { target: { value: "50" } });
    totalExpensesRow = screen.getByText("Total monthly operating expenses").closest("div") as HTMLElement;
    expect(within(totalExpensesRow).queryByText(/not calculated/i)).not.toBeInTheDocument();
    expect(within(totalExpensesRow).getByText("$50.00")).toBeInTheDocument();
  });
});

describe("ManualDealEntryForm — Property condition field", () => {
  it("renders Property condition as a select with the exact options, defaulting to blank", () => {
    render(<ManualDealEntryForm />);
    expandDetails();

    const select = screen.getByLabelText("Property condition") as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    const optionLabels = Array.from(select.options).map((option) => option.textContent);
    expect(optionLabels).toEqual(["", "Excellent", "Good", "Fair", "Poor", "Needs renovation", "Unknown"]);
    expect(select).toHaveValue("");
  });

  it("shows Property condition as User input with the informational note once selected, and Not provided while blank", () => {
    render(<ManualDealEntryForm />);
    expandDetails();

    // Scoped to "Property summary": the form field's own <label> also reads
    // "Property condition", so an unscoped query is ambiguous.
    const propertySummary = screen.getByRole("region", { name: "Property summary" });
    const conditionRow = within(propertySummary).getByText("Property condition").closest("div") as HTMLElement;
    expect(within(conditionRow).getByText("Not provided")).toBeInTheDocument();
    expect(within(conditionRow).getByText(/not included in these calculations/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Property condition"), { target: { value: "Good" } });

    const updatedRow = within(propertySummary).getByText("Property condition").closest("div") as HTMLElement;
    expect(within(updatedRow).getByText("Good")).toBeInTheDocument();
    expect(within(updatedRow).getByText("User input")).toBeInTheDocument();
    expect(within(updatedRow).getByText(/not included in these calculations/i)).toBeInTheDocument();
  });

  it("does not affect any calculated metric when a property condition is selected", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Property condition"), { target: { value: "Poor" } });

    expect(screen.getByText("$200.00")).toBeInTheDocument(); // price per sqft, unaffected
  });
});

describe("ManualDealEntryForm — down payment percentage is validated independently of purchase price", () => {
  it("shows an accessible error immediately for -1% with purchase price blank, and blocks financing metrics naming Down payment percentage", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "" } });
    expandDetails();
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    const percent = screen.getByLabelText("Down payment percentage");
    fireEvent.change(percent, { target: { value: "-1" } });
    // No blur — the error must appear immediately.
    expect(screen.getByText(/between 0 and 100/i)).toBeInTheDocument();
    expect(percent).toHaveAttribute("aria-invalid", "true");
    expect(percent).toHaveValue(-1);

    const loanAmountRow = screen.getByText("Loan amount").closest("div") as HTMLElement;
    expect(within(loanAmountRow).getByText(/not calculated/i)).toBeInTheDocument();
    expect(within(loanAmountRow).getByText(/invalid/i)).toBeInTheDocument();
    expect(within(loanAmountRow).getByText(/down payment percentage/i)).toBeInTheDocument();
  });

  it("shows an accessible error immediately for 101% with purchase price blank, and blocks financing metrics naming Down payment percentage", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "" } });
    expandDetails();
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    const percent = screen.getByLabelText("Down payment percentage");
    fireEvent.change(percent, { target: { value: "101" } });
    expect(screen.getByText(/between 0 and 100/i)).toBeInTheDocument();
    expect(percent).toHaveAttribute("aria-invalid", "true");
    expect(percent).toHaveValue(101);

    // "Cash-on-cash return" matches both the section heading and the metric
    // row label — the row label is the second (last) match in DOM order.
    const cashOnCashRow = screen.getAllByText("Cash-on-cash return").at(-1)?.closest("div") as HTMLElement;
    expect(within(cashOnCashRow).getByText(/not calculated/i)).toBeInTheDocument();
    expect(within(cashOnCashRow).getByText(/down payment percentage/i)).toBeInTheDocument();
  });

  it("shows an accessible error for -1% with a valid purchase price too, and does not convert it into a dollar amount", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields(); // purchase price = 250000, valid
    expandDetails();
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    const percent = screen.getByLabelText("Down payment percentage");
    fireEvent.change(percent, { target: { value: "-1" } });

    expect(screen.getByText(/between 0 and 100/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Calculated down payment:/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));
    expect(screen.getByLabelText("Down payment")).toHaveValue(null);
  });

  it("shows an accessible error for 101% with a valid purchase price too, and does not convert it into a dollar amount", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    const percent = screen.getByLabelText("Down payment percentage");
    fireEvent.change(percent, { target: { value: "101" } });

    expect(screen.getByText(/between 0 and 100/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Calculated down payment:/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));
    expect(screen.getByLabelText("Down payment")).toHaveValue(null);
  });

  it("clears the error immediately once the percentage is corrected to a valid value, and recalculates", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    const percent = screen.getByLabelText("Down payment percentage");
    fireEvent.change(percent, { target: { value: "150" } });
    expect(screen.getByText(/between 0 and 100/i)).toBeInTheDocument();

    fireEvent.change(percent, { target: { value: "20" } });
    expect(screen.queryByText(/between 0 and 100/i)).not.toBeInTheDocument();
    expect(screen.getByText("Calculated down payment: $50,000.00")).toBeInTheDocument();

    const loanAmountRow = screen.getByText("Loan amount").closest("div") as HTMLElement;
    expect(within(loanAmountRow).queryByText(/not calculated/i)).not.toBeInTheDocument();
  });

  it("preserves the invalid entered percentage rather than clearing it", () => {
    render(<ManualDealEntryForm />);
    expandDetails();
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    const percent = screen.getByLabelText("Down payment percentage");
    fireEvent.change(percent, { target: { value: "-1" } });
    expect(percent).toHaveValue(-1);

    fireEvent.change(percent, { target: { value: "101" } });
    expect(percent).toHaveValue(101);
  });

  it("keeps the percent field keyboard-focusable with correctly wired aria-invalid and aria-describedby", () => {
    render(<ManualDealEntryForm />);
    expandDetails();
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    const percent = screen.getByLabelText("Down payment percentage");
    fireEvent.change(percent, { target: { value: "-1" } });

    expect(percent).toHaveAttribute("aria-invalid", "true");
    const describedBy = percent.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const errorEl = document.getElementById(describedBy as string);
    expect(errorEl).toHaveTextContent(/between 0 and 100/i);
    expect(errorEl).toHaveAttribute("role", "alert");

    percent.focus();
    expect(percent).toHaveFocus();
  });
});

describe("ManualDealEntryForm — down payment provenance survives mode toggling", () => {
  it("keeps a plain 'Down payment' heading and User input tag after switching to view Percent mode, since the user typed the dollar amount", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.change(screen.getByLabelText("Down payment"), { target: { value: "30000" } });

    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    const financing = screen.getByRole("region", { name: "Financing" });
    expect(within(financing).queryByText("Down payment (calculated)")).not.toBeInTheDocument();
    const dollarRow = within(financing).getByText("Down payment").closest("div") as HTMLElement;
    expect(within(dollarRow).getByText("$30,000.00")).toBeInTheDocument();
    expect(within(dollarRow).getByText("User input")).toBeInTheDocument();

    expect(within(financing).queryByText("Down payment percentage")).not.toBeInTheDocument();
    const percentRow = within(financing)
      .getByText("Down payment percentage (calculated)")
      .closest("div") as HTMLElement;
    expect(within(percentRow).getByText("Calculated from user input")).toBeInTheDocument();
  });

  it("keeps a plain 'Down payment percentage' heading and User input tag after switching to view Amount mode, since the user typed the percentage", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.change(screen.getByLabelText("Down payment percentage"), { target: { value: "20" } });

    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));

    const financing = screen.getByRole("region", { name: "Financing" });
    expect(within(financing).queryByText("Down payment")).not.toBeInTheDocument();
    const dollarRow = within(financing).getByText("Down payment (calculated)").closest("div") as HTMLElement;
    expect(within(dollarRow).getByText("$30,000.00")).toBeInTheDocument();
    expect(within(dollarRow).getByText("Calculated from user input")).toBeInTheDocument();
  });

  it("preserves headings and provenance across repeated toggling with no further edits (dollar amount is the source)", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.change(screen.getByLabelText("Down payment"), { target: { value: "30000" } });

    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    const financing = screen.getByRole("region", { name: "Financing" });
    const dollarRow = within(financing).getByText("Down payment").closest("div") as HTMLElement;
    expect(within(dollarRow).getByText("User input")).toBeInTheDocument();
    expect(
      within(financing).getByText("Down payment percentage (calculated)"),
    ).toBeInTheDocument();
  });

  it("preserves headings and provenance across repeated toggling with no further edits (percentage is the source)", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.change(screen.getByLabelText("Down payment percentage"), { target: { value: "20" } });

    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));

    const financing = screen.getByRole("region", { name: "Financing" });
    const dollarRow = within(financing).getByText("Down payment (calculated)").closest("div") as HTMLElement;
    expect(within(dollarRow).getByText("Calculated from user input")).toBeInTheDocument();
  });
});

describe("ManualDealEntryForm — hides stale calculated down payment while percentage is invalid", () => {
  it("hides the previously calculated amount once the percentage becomes invalid, then shows the new correct amount once corrected", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    const percent = screen.getByLabelText("Down payment percentage");
    const financing = screen.getByRole("region", { name: "Financing" });

    // 1. Enter a valid percentage.
    fireEvent.change(percent, { target: { value: "20" } });
    // 2. Confirm the calculated amount.
    let calculatedRow = within(financing).getByText("Down payment (calculated)").closest("div") as HTMLElement;
    expect(within(calculatedRow).getByText("$30,000.00")).toBeInTheDocument();

    // 3. Change to an invalid percentage.
    fireEvent.change(percent, { target: { value: "150" } });
    // 4. Confirm the old calculated amount is hidden.
    calculatedRow = within(financing).getByText("Down payment (calculated)").closest("div") as HTMLElement;
    expect(within(calculatedRow).queryByText("$30,000.00")).not.toBeInTheDocument();
    expect(within(calculatedRow).getByText("Not provided")).toBeInTheDocument();
    expect(within(calculatedRow).queryByText("Calculated from user input")).not.toBeInTheDocument();

    const loanAmountRow = screen.getByText("Loan amount").closest("div") as HTMLElement;
    expect(within(loanAmountRow).getByText(/not calculated/i)).toBeInTheDocument();
    expect(within(loanAmountRow).getByText(/down payment percentage/i)).toBeInTheDocument();

    // 5. Correct the percentage.
    fireEvent.change(percent, { target: { value: "25" } });
    // 6. Confirm the correct new amount returns.
    calculatedRow = within(financing).getByText("Down payment (calculated)").closest("div") as HTMLElement;
    expect(within(calculatedRow).getByText("$37,500.00")).toBeInTheDocument();
    expect(within(calculatedRow).getByText("Calculated from user input")).toBeInTheDocument();
    expect(within(loanAmountRow).queryByText(/not calculated/i)).not.toBeInTheDocument();
  });
});

describe("ManualDealEntryForm — does not convert an invalid percentage after a purchase-price edit", () => {
  it("generates no dollar amount when purchase price changes while the percentage is out of range (150%), and resumes correctly once corrected", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields(); // purchasePrice = 250000
    expandDetails();
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));

    // 1. Enter 150%.
    fireEvent.change(screen.getByLabelText("Down payment percentage"), { target: { value: "150" } });

    // 2. Change purchase price.
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "300000" } });

    // 3. Confirm no dollar amount is generated.
    const financing = screen.getByRole("region", { name: "Financing" });
    const calculatedRow = within(financing).getByText("Down payment (calculated)").closest("div") as HTMLElement;
    expect(within(calculatedRow).getByText("Not provided")).toBeInTheDocument();
    expect(within(calculatedRow).queryByText(/^\$/)).not.toBeInTheDocument();

    const loanAmountRow = screen.getByText("Loan amount").closest("div") as HTMLElement;
    expect(within(loanAmountRow).getByText(/down payment percentage/i)).toBeInTheDocument();

    // 4. Switch to Amount mode.
    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));

    // 5. Confirm no invalid derived amount appears.
    expect(screen.getByLabelText("Down payment")).toHaveValue(null);

    // 6. Correct percentage to a valid value.
    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.change(screen.getByLabelText("Down payment percentage"), { target: { value: "20" } });

    // 7. Confirm conversion resumes correctly (20% of 300000 = 60000).
    expect(screen.getByText("Calculated down payment: $60,000.00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));
    expect(screen.getByLabelText("Down payment")).toHaveValue(60000);
  });

  it("never overwrites a previously valid dollar amount when purchase price changes while the percentage is invalid", () => {
    render(<ManualDealEntryForm />);
    fillRequiredFields();
    expandDetails();
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "150000" } });
    fireEvent.change(screen.getByLabelText("Down payment"), { target: { value: "30000" } });

    fireEvent.click(screen.getByRole("radio", { name: "Percent (%)" }));
    fireEvent.change(screen.getByLabelText("Down payment percentage"), { target: { value: "150" } });

    // Changing purchase price while the percentage is invalid must not
    // overwrite the dollar amount with a value derived from 150%.
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "300000" } });

    fireEvent.click(screen.getByRole("radio", { name: "Amount ($)" }));
    expect(screen.getByLabelText("Down payment")).toHaveValue(30000);
  });
});

const SAMPLE_SEED: ManualDealSeed = {
  values: {
    address: "514 Maple Street, Detroit, MI 48214",
    purchasePrice: "189000",
    bedrooms: "3",
    bathrooms: "1.5",
    squareFootage: "1450",
  },
  seededFields: new Set(["address", "purchasePrice", "bedrooms", "bathrooms", "squareFootage"]),
  statuses: {
    address: "reported",
    purchasePrice: "reported",
    bedrooms: "reported",
    bathrooms: "reported",
    squareFootage: "reported",
  },
};

describe("ManualDealEntryForm — property-seeded deals", () => {
  it("pre-fills every seeded field with the given values", () => {
    render(<ManualDealEntryForm seed={SAMPLE_SEED} />);

    expect(screen.getByLabelText("Address")).toHaveValue("514 Maple Street, Detroit, MI 48214");
    expect(screen.getByLabelText("Purchase price")).toHaveValue(189000);
    expect(screen.getByLabelText("Bedrooms")).toHaveValue(3);
    expect(screen.getByLabelText("Bathrooms")).toHaveValue(1.5);
    expect(screen.getByLabelText("Square footage")).toHaveValue(1450);
  });

  it("leaves monthly rent blank and required, even for a property-seeded deal", () => {
    render(<ManualDealEntryForm seed={SAMPLE_SEED} />);

    const monthlyRent = screen.getByLabelText("Monthly rent");
    expect(monthlyRent).toHaveValue(null);

    fireEvent.focus(monthlyRent);
    fireEvent.blur(monthlyRent);
    expect(screen.getByText(/enter the monthly rent/i)).toBeInTheDocument();
  });

  it("labels every seeded field as From property data until the user edits it", () => {
    render(<ManualDealEntryForm seed={SAMPLE_SEED} />);

    const propertySummary = screen.getByRole("region", { name: "Property summary" });
    const addressRow = within(propertySummary)
      .getByText("514 Maple Street, Detroit, MI 48214")
      .closest("div") as HTMLElement;
    expect(within(addressRow).getByText("From property data")).toBeInTheDocument();

    const priceRow = within(propertySummary).getByText("$189,000.00").closest("div") as HTMLElement;
    expect(within(priceRow).getByText("From property data")).toBeInTheDocument();
  });

  it("relabels a seeded field as From property data (edited) once changed, and never reverts to plain User input", () => {
    render(<ManualDealEntryForm seed={SAMPLE_SEED} />);

    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "200000" } });

    const propertySummary = screen.getByRole("region", { name: "Property summary" });
    let priceRow = within(propertySummary).getByText("$200,000.00").closest("div") as HTMLElement;
    expect(within(priceRow).getByText("From property data (edited)")).toBeInTheDocument();

    // Changing it back to the original seeded value must not erase the fact
    // that it was edited — it never reverts to plain "User input".
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "189000" } });
    priceRow = within(propertySummary).getByText("$189,000.00").closest("div") as HTMLElement;
    expect(within(priceRow).getByText("From property data (edited)")).toBeInTheDocument();
  });

  it("still labels an unseeded field as plain User input once filled in", () => {
    render(<ManualDealEntryForm seed={SAMPLE_SEED} />);

    fireEvent.change(screen.getByLabelText("Monthly rent"), { target: { value: "2000" } });

    const incomeExpenses = screen.getByRole("region", { name: "Income and expenses" });
    const rentRow = within(incomeExpenses).getByText("$2,000.00").closest("div") as HTMLElement;
    expect(within(rentRow).getByText("User input")).toBeInTheDocument();
  });

  it("behaves exactly like manual-only entry when no seed is passed (fields default to User input)", () => {
    render(<ManualDealEntryForm />);

    expect(screen.getByLabelText("Address")).toHaveValue("");
    fireEvent.change(screen.getByLabelText("Address"), { target: { value: "123 Main St" } });

    const propertySummary = screen.getByRole("region", { name: "Property summary" });
    const addressRow = within(propertySummary).getByText("123 Main St").closest("div") as HTMLElement;
    expect(within(addressRow).getByText("User input")).toBeInTheDocument();
  });

  it("shows the property-data status label (Codex finding 1) alongside the seeded provenance tag", () => {
    render(<ManualDealEntryForm seed={SAMPLE_SEED} />);

    const propertySummary = screen.getByRole("region", { name: "Property summary" });
    const priceRow = within(propertySummary).getByText("$189,000.00").closest("div") as HTMLElement;
    expect(within(priceRow).getByText("From property data")).toBeInTheDocument();
    expect(within(priceRow).getByText("Reported")).toBeInTheDocument();
  });
});

describe("ManualDealEntryForm — Codex finding 3: provenance survives clearing/invalidating a seeded field", () => {
  const propertySummaryRegion = () => screen.getByRole("region", { name: "Property summary" });

  it("address: clearing to blank keeps the (edited) tag and shows Not provided, without restoring the original value", () => {
    render(<ManualDealEntryForm seed={SAMPLE_SEED} />);

    fireEvent.change(screen.getByLabelText("Address"), { target: { value: "" } });

    const propertySummary = propertySummaryRegion();
    const addressRow = within(propertySummary).getByText("Address").closest("div") as HTMLElement;
    expect(within(addressRow).getByText("Not provided")).toBeInTheDocument();
    expect(within(addressRow).getByText("From property data (edited)")).toBeInTheDocument();
    expect(within(addressRow).queryByText("514 Maple Street, Detroit, MI 48214")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Address")).toHaveValue("");
  });

  it("purchase price: clearing to blank keeps the (edited) tag; a temporarily invalid value keeps it too and blocks dependent metrics", () => {
    render(<ManualDealEntryForm seed={SAMPLE_SEED} />);

    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "" } });
    let propertySummary = propertySummaryRegion();
    let priceRow = within(propertySummary).getByText("Purchase price").closest("div") as HTMLElement;
    expect(within(priceRow).getByText("Not provided")).toBeInTheDocument();
    expect(within(priceRow).getByText("From property data (edited)")).toBeInTheDocument();

    // Now a present-but-invalid value (negative) — never restores 189000.
    fireEvent.change(screen.getByLabelText("Purchase price"), { target: { value: "-5" } });
    propertySummary = propertySummaryRegion();
    priceRow = within(propertySummary).getByText("Purchase price").closest("div") as HTMLElement;
    expect(within(priceRow).getByText("-$5.00")).toBeInTheDocument();
    expect(within(priceRow).getByText("From property data (edited)")).toBeInTheDocument();
    expect(within(priceRow).queryByText("$189,000.00")).not.toBeInTheDocument();

    const priceSqftRow = within(propertySummary).getByText("Price per square foot").closest("div") as HTMLElement;
    expect(within(priceSqftRow).getByText(/invalid/i)).toBeInTheDocument();
    expect(within(priceSqftRow).getByText(/purchase price/i)).toBeInTheDocument();
  });

  it("bedrooms: clearing to blank keeps the (edited) tag; a fractional (invalid) value keeps it too, without restoring 3", () => {
    render(<ManualDealEntryForm seed={SAMPLE_SEED} />);

    fireEvent.change(screen.getByLabelText("Bedrooms"), { target: { value: "" } });
    let propertySummary = propertySummaryRegion();
    let bedroomsRow = within(propertySummary).getByText("Bedrooms").closest("div") as HTMLElement;
    expect(within(bedroomsRow).getByText("Not provided")).toBeInTheDocument();
    expect(within(bedroomsRow).getByText("From property data (edited)")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Bedrooms"), { target: { value: "3.5" } });
    propertySummary = propertySummaryRegion();
    bedroomsRow = within(propertySummary).getByText("Bedrooms").closest("div") as HTMLElement;
    expect(within(bedroomsRow).getByText("3.5")).toBeInTheDocument();
    expect(within(bedroomsRow).getByText("From property data (edited)")).toBeInTheDocument();
    expect(within(bedroomsRow).queryByText("3")).not.toBeInTheDocument();
  });

  it("bathrooms: clearing to blank keeps the (edited) tag; a negative (invalid) value keeps it too, without restoring 1.5", () => {
    render(<ManualDealEntryForm seed={SAMPLE_SEED} />);

    fireEvent.change(screen.getByLabelText("Bathrooms"), { target: { value: "" } });
    let propertySummary = propertySummaryRegion();
    let bathroomsRow = within(propertySummary).getByText("Bathrooms").closest("div") as HTMLElement;
    expect(within(bathroomsRow).getByText("Not provided")).toBeInTheDocument();
    expect(within(bathroomsRow).getByText("From property data (edited)")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Bathrooms"), { target: { value: "-1" } });
    propertySummary = propertySummaryRegion();
    bathroomsRow = within(propertySummary).getByText("Bathrooms").closest("div") as HTMLElement;
    expect(within(bathroomsRow).getByText("-1")).toBeInTheDocument();
    expect(within(bathroomsRow).getByText("From property data (edited)")).toBeInTheDocument();
    expect(within(bathroomsRow).queryByText("1.5")).not.toBeInTheDocument();
  });

  it("square footage: clearing to blank keeps the (edited) tag; an invalid (zero) value keeps it too, without restoring 1450", () => {
    render(<ManualDealEntryForm seed={SAMPLE_SEED} />);

    fireEvent.change(screen.getByLabelText("Square footage"), { target: { value: "" } });
    let propertySummary = propertySummaryRegion();
    let sqftRow = within(propertySummary).getByText("Square footage").closest("div") as HTMLElement;
    expect(within(sqftRow).getByText("Not provided")).toBeInTheDocument();
    expect(within(sqftRow).getByText("From property data (edited)")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Square footage"), { target: { value: "0" } });
    propertySummary = propertySummaryRegion();
    sqftRow = within(propertySummary).getByText("Square footage").closest("div") as HTMLElement;
    expect(within(sqftRow).getByText("0 sqft")).toBeInTheDocument();
    expect(within(sqftRow).getByText("From property data (edited)")).toBeInTheDocument();
    expect(within(sqftRow).queryByText("1,450 sqft")).not.toBeInTheDocument();
  });

  it("a field that started blank and was filled in manually (never seeded) continues to use plain User input, not property-data provenance", () => {
    render(<ManualDealEntryForm seed={SAMPLE_SEED} />);

    fireEvent.change(screen.getByLabelText("Monthly rent"), { target: { value: "2000" } });
    fireEvent.change(screen.getByLabelText("Monthly rent"), { target: { value: "" } });

    const incomeExpenses = screen.getByRole("region", { name: "Income and expenses" });
    const rentRow = within(incomeExpenses).getByText("Monthly rent").closest("div") as HTMLElement;
    expect(within(rentRow).getByText("Not provided")).toBeInTheDocument();
    expect(within(rentRow).queryByText(/from property data/i)).not.toBeInTheDocument();
    expect(within(rentRow).queryByText("User input")).not.toBeInTheDocument();
  });
});
