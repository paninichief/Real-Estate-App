import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ManualDealEntryForm } from "@/components/deal-analyzer/manual-deal-entry-form";

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

    const cashOnCashRow = screen.getByText("Cash-on-cash return").closest("div") as HTMLElement;
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
});
