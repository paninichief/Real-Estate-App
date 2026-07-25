import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataSourcesPanel } from "@/components/property/data-sources-panel";
import { buildDataSourceRow } from "@/lib/property-data/data-source-row";
import { resolveSourceValues } from "@/lib/property-data/conflict-resolution";

const RETRIEVED_AT = "2026-06-01T09:00:00.000Z";

const rows = [
  buildDataSourceRow(
    "bedrooms",
    "Bedrooms",
    resolveSourceValues([
      { source: "realtor", value: 3, retrievedAt: RETRIEVED_AT },
      { source: "zillow", value: 3, retrievedAt: RETRIEVED_AT },
      { source: "redfin", value: 4, retrievedAt: RETRIEVED_AT },
    ]),
  ),
  buildDataSourceRow("lotSizeSqft", "Lot size", resolveSourceValues<number>([])),
];

describe("DataSourcesPanel", () => {
  it("is collapsed by default", () => {
    render(<DataSourcesPanel rows={rows} />);
    expect(screen.getByRole("button", { name: /view data sources/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByText("Bedrooms")).not.toBeInTheDocument();
  });

  it("shows the selected value, status, and a Not available fact when expanded", () => {
    render(<DataSourcesPanel rows={rows} />);
    fireEvent.click(screen.getByRole("button", { name: /view data sources/i }));

    expect(screen.getByText("Bedrooms")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Lot size")).toBeInTheDocument();
    // "Not available" legitimately appears twice for this fact: once as the
    // displayed value, once as the status badge.
    expect(screen.getAllByText("Not available").length).toBeGreaterThanOrEqual(2);
  });

  it("reveals every conflicting source value under View Other Sources", () => {
    render(<DataSourcesPanel rows={rows} />);
    fireEvent.click(screen.getByRole("button", { name: /view data sources/i }));
    fireEvent.click(screen.getByRole("button", { name: /view other sources/i }));

    expect(screen.getByText("Realtor.com")).toBeInTheDocument();
    expect(screen.getByText("Zillow")).toBeInTheDocument();
    expect(screen.getByText("Redfin")).toBeInTheDocument();
  });
});
