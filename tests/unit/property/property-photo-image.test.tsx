import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PropertyPhotoImage } from "@/components/property/property-photo-image";
import type { PropertyPhoto } from "@/types/property";

const basePhoto: PropertyPhoto = {
  id: "photo-1",
  propertyId: "prop-1",
  url: null,
  isPrimary: true,
  displayOrder: 0,
  altText: "Sample alt text",
  source: "placeholder",
  attribution: null,
  licenseNotes: null,
};

describe("PropertyPhotoImage", () => {
  it("renders the generated placeholder when the photo has no url", () => {
    render(<PropertyPhotoImage photo={basePhoto} />);
    expect(screen.getByRole("img", { name: "Sample alt text" })).toBeInTheDocument();
  });

  it("renders a real <img> when a url is present, and falls back to the error state on load failure", () => {
    const photoWithUrl = { ...basePhoto, url: "https://example.com/photo.jpg" };
    render(<PropertyPhotoImage photo={photoWithUrl} />);

    const img = screen.getByRole("img", { name: "Sample alt text" }) as HTMLImageElement;
    expect(img.tagName).toBe("IMG");

    fireEvent.error(img);

    expect(screen.getByRole("img", { name: /failed to load/i })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Sample alt text" })).not.toBeInTheDocument();
  });
});
