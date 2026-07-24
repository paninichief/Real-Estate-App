import type { PropertyPhoto } from "@/types/property";
import { PropertyPhotoImage } from "./property-photo-image";
import { PhotoPlaceholder } from "./photo-placeholder";

type PropertyCardThumbnailProps = {
  photos: PropertyPhoto[];
  className?: string;
};

/**
 * Compact single-image thumbnail for search-result cards (spec section
 * 10.6). Not wired into a results page yet — search/cards land in a later
 * milestone — but built now against PropertyMediaProvider so that page
 * doesn't require any photo-UI rework when it arrives.
 */
export function PropertyCardThumbnail({
  photos,
  className = "aspect-[4/3] w-full",
}: PropertyCardThumbnailProps) {
  const primary =
    [...photos].sort((a, b) => a.displayOrder - b.displayOrder).find((p) => p.isPrimary) ??
    photos[0];

  return (
    <div className={`overflow-hidden rounded-md ${className}`}>
      {primary ? (
        <PropertyPhotoImage photo={primary} className="h-full w-full" />
      ) : (
        <PhotoPlaceholder className="h-full w-full" />
      )}
    </div>
  );
}
