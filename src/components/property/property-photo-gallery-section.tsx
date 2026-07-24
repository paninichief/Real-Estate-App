import { getPropertyMediaProvider } from "@/lib/property-media";
import { PropertyPhotoGallery } from "./property-photo-gallery";

type PropertyPhotoGallerySectionProps = {
  propertyId: string;
};

/**
 * Fetches photos independently of the rest of the property page and renders
 * inside a Suspense boundary (see property/[propertyId]/page.tsx), so the
 * photo loading state is genuinely reachable rather than simulated —
 * useful today, and realistic once a real photo provider has real latency.
 */
export async function PropertyPhotoGallerySection({ propertyId }: PropertyPhotoGallerySectionProps) {
  const photos = await getPropertyMediaProvider().getPhotos(propertyId);
  return <PropertyPhotoGallery photos={photos} />;
}
