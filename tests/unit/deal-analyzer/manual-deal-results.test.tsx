import { describe, it, expect } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
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

const SECTION_NAMES = [
  "Property summary",
  "Financing",
  "Income and expenses",
  "NOI and cap rate",
  "Cash flow",
  "Cash-on-cash return",
  "Missing or invalid inputs",
  "Metric explanations",
];

describe("ManualDealResults — organized sections", () => {
  it("renders all 8 named sections as accessible regions, in order", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const regions = screen.getAllByRole("region");
    const regionNames = regions.map((region) => region.getAttribute("aria-label"));
    expect(regionNames).toEqual(SECTION_NAMES);
  });

  it("groups property facts and price per square foot under Property summary", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const section = screen.getByRole("region", { name: "Property summary" });
    expect(within(section).getByText("123 Main St, Detroit, MI")).toBeInTheDocument();
    expect(within(section).getByText("$250,000.00")).toBeInTheDocument();
    expect(within(section).getByText("$200.00")).toBeInTheDocument(); // price per sqft
  });

  it("groups down payment, interest rate, loan term, loan amount, and mortgage payment under Financing", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const section = screen.getByRole("region", { name: "Financing" });
    expect(within(section).getByText("Down payment")).toBeInTheDocument();
    expect(within(section).getByText("Interest rate")).toBeInTheDocument();
    expect(within(section).getByText("Loan term")).toBeInTheDocument();
    expect(within(section).getByText("Loan amount")).toBeInTheDocument();
    expect(within(section).getByText("Monthly mortgage payment")).toBeInTheDocument();
    expect(within(section).getByText("$200,000.00")).toBeInTheDocument(); // loan amount value
  });

  it("groups rent, itemized expenses, and their totals under Income and expenses", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const section = screen.getByRole("region", { name: "Income and expenses" });
    expect(within(section).getByText("Monthly rent")).toBeInTheDocument();
    expect(within(section).getByText("Property taxes")).toBeInTheDocument();
    expect(within(section).getByText("Annual rental income")).toBeInTheDocument();
    expect(within(section).getByText("$24,000.00")).toBeInTheDocument();
    expect(within(section).getByText("Total monthly operating expenses")).toBeInTheDocument();
    expect(within(section).getByText("Total annual operating expenses")).toBeInTheDocument();
  });

  it("groups monthly/annual NOI and cap rate under NOI and cap rate", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const section = screen.getByRole("region", { name: "NOI and cap rate" });
    expect(within(section).getByText("Monthly NOI")).toBeInTheDocument();
    expect(within(section).getByText("Annual NOI")).toBeInTheDocument();
    expect(within(section).getByText("Cap rate")).toBeInTheDocument();
    expect(within(section).getByText("6.72%")).toBeInTheDocument();
  });

  it("groups monthly and annual cash flow under Cash flow", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const section = screen.getByRole("region", { name: "Cash flow" });
    expect(within(section).getByText("Monthly cash flow")).toBeInTheDocument();
    expect(within(section).getByText("Annual cash flow")).toBeInTheDocument();
  });

  it("puts cash-on-cash return in its own section", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const section = screen.getByRole("region", { name: "Cash-on-cash return" });
    // Both the section heading and the metric row label read "Cash-on-cash
    // return" — confirm the metric row (with its dt/dd pair) is present.
    expect(within(section).getAllByText("Cash-on-cash return")).toHaveLength(2);
  });

  it("groups the informational-only fields under Property summary, still excluded from calculations", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const section = screen.getByRole("region", { name: "Property summary" });
    expect(within(section).getByText("Property condition")).toBeInTheDocument();
    const notices = within(section).getAllByText(/not included in (the |these )?calculations/i);
    expect(notices.length).toBeGreaterThanOrEqual(5);
  });
});

describe("ManualDealResults — consolidated missing/invalid summary", () => {
  it("shows a deduplicated top-of-page summary naming every missing field once, even when several metrics share it", () => {
    const results = calculateManualDeal(REQUIRED_ONLY);
    render(<ManualDealResults values={REQUIRED_ONLY} results={results} />);

    // "Down payment" blocks both Loan amount and Cash-on-cash return but
    // must appear only once in the consolidated summary.
    const banner = screen.getByRole("status", { name: "Missing or invalid inputs summary" });
    const downPaymentMentions = within(banner).getAllByText(/down payment/i);
    expect(downPaymentMentions).toHaveLength(1);
  });

  it("does not render the top summary banner when every metric is calculated", () => {
    const values: ManualDealFormValues = {
      ...FULL_VALUES,
      downPayment: 50_000,
      interestRatePercent: 6,
      loanTermYears: 30,
    };
    const results = calculateManualDeal(values);
    render(<ManualDealResults values={values} results={results} />);

    expect(screen.queryByRole("status", { name: "Missing or invalid inputs summary" })).not.toBeInTheDocument();
  });

  it("retains a dedicated Missing or invalid inputs section listing both missing and invalid fields", () => {
    const values: ManualDealFormValues = { ...FULL_VALUES, monthlyRent: null, hoa: -50 };
    const results = calculateManualDeal(values, new Set(["hoa"]));
    render(<ManualDealResults values={values} results={results} />);

    const section = screen.getByRole("region", { name: "Missing or invalid inputs" });
    expect(within(section).getByText(/monthly rent/i)).toBeInTheDocument();
    expect(within(section).getByText(/hoa/i)).toBeInTheDocument();
  });

  it("shows a success message in the dedicated section when nothing is missing or invalid", () => {
    const values: ManualDealFormValues = {
      ...FULL_VALUES,
      downPayment: 50_000,
      interestRatePercent: 6,
      loanTermYears: 30,
    };
    const results = calculateManualDeal(values);
    render(<ManualDealResults values={values} results={results} />);

    const section = screen.getByRole("region", { name: "Missing or invalid inputs" });
    expect(within(section).getByText(/present and valid/i)).toBeInTheDocument();
  });
});

describe("ManualDealResults — Metric explanations", () => {
  it("renders a closed disclosure that reveals plain-language definitions when opened", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const section = screen.getByRole("region", { name: "Metric explanations" });
    const details = within(section).getByText("Metric explanations").closest("details") as HTMLDetailsElement;
    expect(details).not.toBeNull();
    expect(details.open).toBe(false);

    fireEvent.click(within(section).getByText("Metric explanations"));
    expect(details.open).toBe(true);
    expect(within(section).getByText(/cap rate/i)).toBeInTheDocument();
    expect(within(section).getByText(/cash-on-cash return/i)).toBeInTheDocument();
  });
});

describe("ManualDealResults — field provenance (property-seeded deals)", () => {
  it("labels a field seeded from property data as From property data", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(
      <ManualDealResults
        values={FULL_VALUES}
        results={results}
        fieldProvenance={{ address: "from_property_data", purchasePrice: "from_property_data" }}
      />,
    );

    const section = screen.getByRole("region", { name: "Property summary" });
    const addressRow = within(section).getByText("123 Main St, Detroit, MI").closest("div") as HTMLElement;
    expect(within(addressRow).getByText("From property data")).toBeInTheDocument();
  });

  it("labels an edited, previously seeded field as From property data (edited), never reverting to plain User input", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(
      <ManualDealResults
        values={FULL_VALUES}
        results={results}
        fieldProvenance={{ purchasePrice: "from_property_data_edited" }}
      />,
    );

    const section = screen.getByRole("region", { name: "Property summary" });
    const priceRow = within(section).getByText("$250,000.00").closest("div") as HTMLElement;
    expect(within(priceRow).getByText("From property data (edited)")).toBeInTheDocument();
  });

  it("still labels an untouched, unseeded field as User input by default", () => {
    const results = calculateManualDeal(FULL_VALUES);
    render(<ManualDealResults values={FULL_VALUES} results={results} />);

    const section = screen.getByRole("region", { name: "Property summary" });
    const addressRow = within(section).getByText("123 Main St, Detroit, MI").closest("div") as HTMLElement;
    expect(within(addressRow).getByText("User input")).toBeInTheDocument();
  });
});

describe("ManualDealResults — entered-value labeling", () => {
  it("labels every entered value as User input by default", () => {
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

    const financing = screen.getByRole("region", { name: "Financing" });
    const downPaymentRow = within(financing).getByText("Down payment").closest("div") as HTMLElement;
    expect(within(downPaymentRow).getByText("$50,000.00")).toBeInTheDocument();
    expect(within(downPaymentRow).getByText("User input")).toBeInTheDocument();
    expect(within(financing).queryByText("Down payment percentage")).not.toBeInTheDocument();
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

    const financing = screen.getByRole("region", { name: "Financing" });
    const percentRow = within(financing).getByText("Down payment percentage").closest("div") as HTMLElement;
    expect(within(percentRow).getByText("20%")).toBeInTheDocument();
    expect(within(percentRow).getByText("User input")).toBeInTheDocument();

    const calculatedRow = within(financing).getByText("Down payment (calculated)").closest("div") as HTMLElement;
    expect(within(calculatedRow).getByText("$30,000.00")).toBeInTheDocument();
    expect(within(calculatedRow).getByText("Calculated from user input")).toBeInTheDocument();
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

    const financing = screen.getByRole("region", { name: "Financing" });
    const calculatedRow = within(financing).getByText("Down payment (calculated)").closest("div") as HTMLElement;
    expect(within(calculatedRow).getByText("Not provided")).toBeInTheDocument();
    expect(within(calculatedRow).queryByText("$30,000.00")).not.toBeInTheDocument();
    expect(within(calculatedRow).queryByText("Calculated from user input")).not.toBeInTheDocument();

    const percentRow = within(financing).getByText("Down payment percentage").closest("div") as HTMLElement;
    expect(within(percentRow).getByText("150%")).toBeInTheDocument();

    const loanAmountRow = within(financing).getByText("Loan amount").closest("div") as HTMLElement;
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

    // Each assertion is scoped to its own new section: several entered raw
    // values (e.g. $200 property taxes, now in Income and expenses) can
    // coincidentally match a calculated figure elsewhere (e.g. $200 price
    // per square foot, now in Property summary) as plain text.
    const propertySummary = screen.getByRole("region", { name: "Property summary" });
    expect(within(propertySummary).getByText("$200.00")).toBeInTheDocument(); // price per sqft

    const incomeExpenses = screen.getByRole("region", { name: "Income and expenses" });
    expect(within(incomeExpenses).getByText("$24,000.00")).toBeInTheDocument(); // annual rental income

    const financing = screen.getByRole("region", { name: "Financing" });
    expect(within(financing).getByText("$200,000.00")).toBeInTheDocument(); // loan amount

    const noiCapRate = screen.getByRole("region", { name: "NOI and cap rate" });
    expect(within(noiCapRate).getByText("6.72%")).toBeInTheDocument(); // cap rate
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
