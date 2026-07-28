import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

const ORIGINAL_PROVIDER = process.env.PROPERTY_DATA_PROVIDER;

afterEach(() => {
  if (ORIGINAL_PROVIDER === undefined) {
    delete process.env.PROPERTY_DATA_PROVIDER;
  } else {
    process.env.PROPERTY_DATA_PROVIDER = ORIGINAL_PROVIDER;
  }
});

describe("Deal Analyzer property-seeded route (Codex finding 2 — mock-only, never live RentCast)", () => {
  it("renders mock fixture data even when PROPERTY_DATA_PROVIDER is explicitly 'rentcast'", async () => {
    process.env.PROPERTY_DATA_PROVIDER = "rentcast";

    const { default: DealAnalyzerPropertyPage } = await import(
      "@/app/deal-analyzer/property/[propertyId]/page"
    );

    const element = await DealAnalyzerPropertyPage({
      params: Promise.resolve({ propertyId: "prop-maple-514" }),
    });
    render(element);

    expect(screen.getByLabelText("Address")).toHaveValue("514 Maple Street, Detroit, MI 48214");
    expect(screen.getByLabelText("Purchase price")).toHaveValue(189000);
  });

  it("never requires or reads a RentCast API key to resolve the seeded deal", async () => {
    process.env.PROPERTY_DATA_PROVIDER = "rentcast";
    const originalKey = process.env.RENTCAST_API_KEY;
    delete process.env.RENTCAST_API_KEY;

    try {
      const { default: DealAnalyzerPropertyPage } = await import(
        "@/app/deal-analyzer/property/[propertyId]/page"
      );

      const element = await DealAnalyzerPropertyPage({
        params: Promise.resolve({ propertyId: "prop-maple-514" }),
      });
      render(element);

      expect(screen.getByLabelText("Address")).toHaveValue("514 Maple Street, Detroit, MI 48214");
    } finally {
      if (originalKey === undefined) {
        delete process.env.RENTCAST_API_KEY;
      } else {
        process.env.RENTCAST_API_KEY = originalKey;
      }
    }
  });
});
