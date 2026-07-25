import type { PropertyPhoto } from "@/types/property";
import type { PropertyMediaProvider } from "./provider";

/** Deliberately varied per fixture property so the gallery/thumbnail UI can
 * be exercised against zero, one, and several photos during development. */
const PHOTO_COUNT_OVERRIDES: Record<string, number> = {
  "prop-maple-514": 3,
  "prop-oak-812": 1,
  "prop-birch-215": 0,
};
const DEFAULT_PHOTO_COUNT = 1;

const PLACEHOLDER_LICENSE_NOTES =
  "Generated placeholder graphic — not a photo of the actual property.";

/**
 * The only implementation of PropertyMediaProvider until a licensed photo
 * feed exists. Every photo it returns is a generated placeholder graphic
 * (url is always null — see PropertyPhotoImage for how these render), never
 * a scraped or unlicensed real property image.
 */
export class PlaceholderMediaAdapter implements PropertyMediaProvider {
  readonly id = "placeholder";

  async getPhotos(propertyId: string): Promise<PropertyPhoto[]> {
    const count = PHOTO_COUNT_OVERRIDES[propertyId] ?? DEFAULT_PHOTO_COUNT;

    return Array.from({ length: count }, (_, index) => ({
      id: `${propertyId}-placeholder-${index}`,
      propertyId,
      url: null,
      isPrimary: index === 0,
      displayOrder: index,
      altText:
        index === 0
          ? "Placeholder image — no verified property photo is available yet."
          : `Placeholder image ${index + 1} — no verified property photo is available yet.`,
      source: "placeholder",
      attribution: null,
      licenseNotes: PLACEHOLDER_LICENSE_NOTES,
    }));
  }
}
