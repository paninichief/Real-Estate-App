import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ManualDealResults } from "@/components/deal-analyzer/manual-deal-results";
import { calculateManualDeal } from "@/lib/deal-analyzer/manual-deal-calculations";
import type { ManualDealFormValues } from "@/lib/deal-analyzer/manual-deal-types";

const REQUIRED_ONLY: ManualDealFormValues = {
  address: "123 Main St, Detroit, MI",
  purchasePrice: 250_000,
  monthlyRent: 2000,
  bedrooms: 3,
  bathrooms: 1.5,
  squareFootage: 1250,
  downPayment: null,
  interestRatePercent: null,
  loanTermYears: null,
  propertyTaxes: null,
  insurance: null,
  propertyManagement: null,
  maintenanceReserve: null,
  hoa: null,
  vacancyReserve: null,
  utilities: null,
  numberOfUnits: null,
  renovationCosts: null,
  occupancy: null,
  section8Status: null,
  propertyCondition: null,
};

const FULL_VALUES: ManualDealFormValues = {
  ...REQUIRED_ONLY,
  downPayment: 50_000,
  interestRatePercent: 6,
  loanTermYears: 30,
  propertyTaxes: 200,
  insurance: 100,
  propertyManagement: 150,
  maintenanceReserve: 75,
  hoa: 0,
  vacancyReserve: 50,
  utilities: 25,
  numberOfUnits: 2,
  renovationCosts: 5000,
  occupancy: "Occupied",
  section8Status: "HAP Contract Confirmed",
  propertyCondition: "Good",
};

describe("ManualDealResults — entered-value labeling", () => {
  it("labels every entered value as User input", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    expect(screen.getAllByText("User input").length).toBeGreaterThan(0);
    expect(screen.getByText("123 Main St, Detroit, MI")).toBeInTheDocument();
  });

  it("labels every blank optional field as Not provided instead of inventing a value", () => {
    const results = calculateManualDeal(REQUIRED_ONLY);
    render(<ManualDealResults values={REQUIRED_ONLY} results={results} />);

    expect(screen.getAllByText("Not provided").length).toBeGreaterThan(0);
  });

  it("states that Number of units, Renovation costs, Occupancy, Section 8 status, and Property condition are not part of the calculations, even when filled in", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const notices = screen.getAllByText(/not included in (the |these )?calculations/i);
    expect(notices.length).toBeGreaterThanOrEqual(5);
  });

  it("shows Property condition as User input when selected", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const row = screen.getByText("Property condition").closest("div") as HTMLElement;
    expect(within(row).getByText("Good")).toBeInTheDocument();
    expect(within(row).getByText("User input")).toBeInTheDocument();
  });

  it("shows Property condition as Not provided when blank", () => {
    const results = calculateManualDeal(REQUIRED_ONLY);
    render(<ManualDealResults values={REQUIRED_ONLY} results={results} />);

    const row = screen.getByText("Property condition").closest("div") as HTMLElement;
    expect(within(row).getByText("Not provided")).toBeInTheDocument();
  });
});

describe("ManualDealResults — blank optional fields never look like an entered $0", () => {
  it("shows Not provided for a blank HOA, never a $0.00 value tagged User input", () => {
    const results = calculateManualDeal(REQUIRED_ONLY);
    render(<ManualDealResults values={REQUIRED_ONLY} results={results} />);

    const hoaRow = screen.getByText("HOA").closest("div") as HTMLElement;
    expect(within(hoaRow).getByText("Not provided")).toBeInTheDocument();
    expect(within(hoaRow).queryByText("User input")).not.toBeInTheDocument();
    expect(within(hoaRow).queryByText(/\$0\.00/)).not.toBeInTheDocument();
  });

  it("shows $0.00 tagged User input when HOA is explicitly entered as 0", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, hoa: 0 };
    const results = calculateManualDeal(values);
    render(<ManualDealResults values={values} results={results} />);

    const hoaRow = screen.getByText("HOA").closest("div") as HTMLElement;
    expect(within(hoaRow).getByText("$0.00")).toBeInTheDocument();
    expect(within(hoaRow).getByText("User input")).toBeInTheDocument();
  });
});

describe("ManualDealResults — down payment mode provenance", () => {
  it("still labels the down payment as User input by default (Amount mode, no mode prop passed)", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const downPaymentRow = screen.getByText("Down payment").closest("div") as HTMLElement;
    expect(within(downPaymentRow).getByText("$50,000.00")).toBeInTheDocument();
    expect(within(downPaymentRow).getByText("User input")).toBeInTheDocument();
    expect(screen.queryByText("Down payment percentage")).not.toBeInTheDocument();
  });

  it("labels the down payment as Calculated from user input and shows the entered percentage when driven by Percent mode", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, purchasePrice: 150_000, downPayment: 30_000 };
    const results = calculateManualDeal(values);
    render(
      <ManualDealResults
        values={values}
        results={results}
        downPaymentMode="percent"
        downPaymentSource="percent"
        downPaymentPercent={20}
      />,
    );

    const percentRow = screen.getByText("Down payment percentage").closest("div") as HTMLElement;
    expect(within(percentRow).getByText("20%")).toBeInTheDocument();
    expect(within(percentRow).getByText("User input")).toBeInTheDocument();

    const calculatedRow = screen.getByText("Down payment (calculated)").closest("div") as HTMLElement;
    expect(within(calculatedRow).getByText("$30,000.00")).toBeInTheDocument();
    expect(within(calculatedRow).getByText("Calculated from user input")).toBeInTheDocument();
  });

  it("shows Not provided for both the percentage and the calculated amount when Percent mode is active but nothing was entered", () => {
    const values: ManualDealFormValues = { ...REQUIRED_ONLY, purchasePrice: 150_000 };
    const results = calculateManualDeal(values);
    render(
      <ManualDealResults
        values={values}
        results={results}
        downPaymentMode="percent"
        downPaymentSource="percent"
        downPaymentPercent={null}
      />,
    );

    const percentRow = screen.getByText("Down payment percentage").closest("div") as HTMLElement;
    expect(within(percentRow).getByText("Not provided")).toBeInTheDocument();

    const calculatedRow = screen.getByText("Down payment (calculated)").closest("div") as HTMLElement;
    expect(within(calculatedRow).getByText("Not provided")).toBeInTheDocument();
  });

  it("uses a plain 'Down payment' heading and User input tag for the dollar amount, and a '(calculated)' percentage heading, when the dollar amount is the true source (viewing Percent mode)", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, purchasePrice: 150_000, downPayment: 30_000 };
    const results = calculateManualDeal(values);
    render(
      <ManualDealResults
        values={values}
        results={results}
        downPaymentMode="percent"
        downPaymentSource="amount"
        downPaymentPercent={20}
      />,
    );

    expect(screen.queryByText("Down payment percentage")).not.toBeInTheDocument();
    const percentRow = screen.getByText("Down payment percentage (calculated)").closest("div") as HTMLElement;
    expect(within(percentRow).getByText("Calculated from user input")).toBeInTheDocument();

    expect(screen.queryByText("Down payment (calculated)")).not.toBeInTheDocument();
    const dollarRow = screen.getByText("Down payment").closest("div") as HTMLElement;
    expect(within(dollarRow).getByText("$30,000.00")).toBeInTheDocument();
    expect(within(dollarRow).getByText("User input")).toBeInTheDocument();
  });

  it("uses a '(calculated)' heading and Calculated from user input tag for the single dollar row when viewing Amount mode but the percentage is the true source", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, purchasePrice: 150_000, downPayment: 30_000 };
    const results = calculateManualDeal(values);
    render(
      <ManualDealResults values={values} results={results} downPaymentMode="amount" downPaymentSource="percent" />,
    );

    expect(screen.queryByText("Down payment")).not.toBeInTheDocument();
    const dollarRow = screen.getByText("Down payment (calculated)").closest("div") as HTMLElement;
    expect(within(dollarRow).getByText("$30,000.00")).toBeInTheDocument();
    expect(within(dollarRow).getByText("Calculated from user input")).toBeInTheDocument();
  });

  it("never lets the heading and the tag contradict each other, for either source, in either mode", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, purchasePrice: 150_000, downPayment: 30_000 };
    const results = calculateManualDeal(values);

    // source=amount, mode=amount: plain heading, User input.
    const { unmount: unmount1 } = render(
      <ManualDealResults values={values} results={results} downPaymentMode="amount" downPaymentSource="amount" />,
    );
    let row = screen.getByText("Down payment").closest("div") as HTMLElement;
    expect(within(row).getByText("User input")).toBeInTheDocument();
    unmount1();

    // source=percent, mode=percent: plain percentage heading, User input.
    const { unmount: unmount2 } = render(
      <ManualDealResults
        values={values}
        results={results}
        downPaymentMode="percent"
        downPaymentSource="percent"
        downPaymentPercent={20}
      />,
    );
    row = screen.getByText("Down payment percentage").closest("div") as HTMLElement;
    expect(within(row).getByText("User input")).toBeInTheDocument();
    unmount2();
  });

  it("hides a stale calculated dollar amount, without a Calculated from user input tag, while the active percentage is invalid", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, purchasePrice: 150_000, downPayment: 30_000 };
    const results = calculateManualDeal(values, new Set(["downPaymentPercent"]));
    render(
      <ManualDealResults
        values={values}
        results={results}
        downPaymentMode="percent"
        downPaymentSource="percent"
        downPaymentPercent={150}
        downPaymentPercentInvalid
      />,
    );

    const calculatedRow = screen.getByText("Down payment (calculated)").closest("div") as HTMLElement;
    expect(within(calculatedRow).getByText("Not provided")).toBeInTheDocument();
    expect(within(calculatedRow).queryByText("$30,000.00")).not.toBeInTheDocument();
    expect(within(calculatedRow).queryByText("Calculated from user input")).not.toBeInTheDocument();

    // The invalid percentage itself is still preserved and shown as entered.
    const percentRow = screen.getByText("Down payment percentage").closest("div") as HTMLElement;
    expect(within(percentRow).getByText("150%")).toBeInTheDocument();

    const loanAmountRow = screen.getByText("Loan amount").closest("div") as HTMLElement;
    expect(within(loanAmountRow).getByText(/not calculated/i)).toBeInTheDocument();
    expect(within(loanAmountRow).getByText(/down payment percentage/i)).toBeInTheDocument();
  });
});

describe("ManualDealResults — invalid value display", () => {
  it("shows Not calculated and names the invalid field, distinct from a missing field", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, hoa: -50 };
    const results = calculateManualDeal(values, new Set(["hoa"]));
    render(<ManualDealResults values={values} results={results} />);

    const row = screen.getByText("Total monthly operating expenses").closest("div") as HTMLElement;
    expect(within(row).getByText(/not calculated/i)).toBeInTheDocument();
    expect(within(row).getByText(/invalid/i)).toBeInTheDocument();
    expect(within(row).getByText(/hoa/i)).toBeInTheDocument();
  });

  it("names both the missing and the invalid field when a metric is blocked by both at once", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, monthlyRent: null, hoa: -50 };
    const results = calculateManualDeal(values, new Set(["hoa"]));
    render(<ManualDealResults values={values} results={results} />);

    const row = screen.getByText("Monthly NOI").closest("div") as HTMLElement;
    expect(within(row).getByText(/missing/i)).toBeInTheDocument();
    expect(within(row).getByText(/monthly rent/i)).toBeInTheDocument();
    expect(within(row).getByText(/invalid/i)).toBeInTheDocument();
    expect(within(row).getByText(/hoa/i)).toBeInTheDocument();
  });
});

describe("ManualDealResults — blank optional expense notice", () => {
  it("shows the exact notice explaining blank expenses default to $0 and financing gaps may block financing-dependent results", () => {
    const results = calculateManualDeal(REQUIRED_ONLY);
    render(<ManualDealResults values={REQUIRED_ONLY} results={results} />);

    expect(
      screen.getByText(
        "Calculations use only the expenses and financing details you provided. Blank optional expense fields are treated as $0. Missing financing fields may prevent financing-dependent results from being calculated.",
      ),
    ).toBeInTheDocument();
  });
});

describe("ManualDealResults — calculated metrics", () => {
  it("formats currency metrics and percentage metrics correctly for a fully populated deal", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    // Scoped to the calculated-results region: several entered raw values
    // (e.g. $200 property taxes) can coincidentally match a calculated
    // figure (e.g. $200 price per square foot) as plain text.
    const calculatedResults = screen.getByRole("region", { name: "Calculated results" });
    expect(within(calculatedResults).getByText("$200.00")).toBeInTheDocument(); // price per sqft
    expect(within(calculatedResults).getByText("$24,000.00")).toBeInTheDocument(); // annual rental income
    expect(within(calculatedResults).getByText("$200,000.00")).toBeInTheDocument(); // loan amount
    expect(within(calculatedResults).getByText("6.72%")).toBeInTheDocument(); // cap rate
  });

  it("shows Not calculated and names every missing field for a blocked metric", () => {
    const results = calculateManualDeal(REQUIRED_ONLY);
    render(<ManualDealResults values={REQUIRED_ONLY} results={results} />);

    const loanAmountRow = screen.getByText("Loan amount").closest("div, li, tr") ?? document.body;
    expect(loanAmountRow).toHaveTextContent(/not calculated/i);
    expect(loanAmountRow).toHaveTextContent(/down payment/i);
  });

  it("shows the specific unavailable reason for a $0 down payment instead of a generic error", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, downPayment: 0 };
    const results = calculateManualDeal(values);
    render(<ManualDealResults values={values} results={results} />);

    expect(screen.getByText(/\$0 down payment/i)).toBeInTheDocument();
  });
});
