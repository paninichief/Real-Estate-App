import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PropertyPhotoGallery } from "@/components/property/property-photo-gallery";
import type { PropertyPhoto } from "@/types/property";

function placeholderPhoto(overrides: Partial<PropertyPhoto> = {}): PropertyPhoto {
  return {
    id: "photo-1",
    propertyId: "prop-1",
    url: null,
    isPrimary: true,
    displayOrder: 0,
    altText: "Placeholder image — no verified property photo is available yet.",
    source: "placeholder",
    attribution: null,
    licenseNotes: "Generated placeholder graphic — not a photo of the actual property.",
    ...overrides,
  };
}

describe("PropertyPhotoGallery", () => {
  it("renders a missing-image placeholder with zero photos", () => {
    render(<PropertyPhotoGallery photos={[]} />);
    expect(screen.getByRole("img", { name: /no photos available/i })).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("renders a single primary photo without thumbnails", () => {
    render(<PropertyPhotoGallery photos={[placeholderPhoto()]} />);
    expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("renders ordered thumbnails and switches the active photo on click", () => {
    const photos = [
      placeholderPhoto({ id: "a", displayOrder: 0, isPrimary: true, altText: "Photo A" }),
      placeholderPhoto({ id: "b", displayOrder: 1, isPrimary: false, altText: "Photo B" }),
      placeholderPhoto({ id: "c", displayOrder: 2, isPrimary: false, altText: "Photo C" }),
    ];
    render(<PropertyPhotoGallery photos={photos} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");

    fireEvent.click(tabs[2]);
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
  });
});
