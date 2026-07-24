import { describe, it, expect } from "vitest";
import { PlaceholderMediaAdapter } from "@/lib/property-media/placeholder-adapter";
import type { PropertyMediaProvider } from "@/lib/property-media/provider";

const adapter: PropertyMediaProvider = new PlaceholderMediaAdapter();

describe("PlaceholderMediaAdapter", () => {
  it("returns zero photos for a fixture overridden to zero (missing-image state)", async () => {
    const photos = await adapter.getPhotos("prop-birch-215");
    expect(photos).toHaveLength(0);
  });

  it("returns one photo for a fixture overridden to one", async () => {
    const photos = await adapter.getPhotos("prop-oak-812");
    expect(photos).toHaveLength(1);
    expect(photos[0].isPrimary).toBe(true);
  });

  it("returns several ordered photos, with exactly one marked primary", async () => {
    const photos = await adapter.getPhotos("prop-maple-514");
    expect(photos).toHaveLength(3);
    expect(photos.map((p) => p.displayOrder)).toEqual([0, 1, 2]);
    expect(photos.filter((p) => p.isPrimary)).toHaveLength(1);
    expect(photos[0].isPrimary).toBe(true);
  });

  it("falls back to a default photo count for an unknown property id", async () => {
    const photos = await adapter.getPhotos("some-future-rentcast-id");
    expect(photos).toHaveLength(1);
  });

  it("never returns a real image URL — only generated placeholders", async () => {
    const photos = await adapter.getPhotos("prop-maple-514");
    for (const photo of photos) {
      expect(photo.url).toBeNull();
      expect(photo.source).toBe("placeholder");
      expect(photo.altText.length).toBeGreaterThan(0);
    }
  });
});
