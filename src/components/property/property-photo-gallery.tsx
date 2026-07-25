"use client";

import { useState } from "react";
import type { PropertyPhoto } from "@/types/property";
import { PropertyPhotoImage } from "./property-photo-image";
import { PhotoPlaceholder } from "./photo-placeholder";

type PropertyPhotoGalleryProps = {
  photos: PropertyPhoto[];
};

/** Full gallery: primary image plus ordered thumbnails (spec section 8.4/8.5). */
export function PropertyPhotoGallery({ photos }: PropertyPhotoGalleryProps) {
  const ordered = [...photos].sort((a, b) => a.displayOrder - b.displayOrder);
  const [activeId, setActiveId] = useState<string | null>(ordered[0]?.id ?? null);

  if (ordered.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-border-subtle">
        <PhotoPlaceholder
          label="No photos available for this property yet"
          className="aspect-video w-full"
        />
      </div>
    );
  }

  const active = ordered.find((p) => p.id === activeId) ?? ordered[0];

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border-subtle">
        <PropertyPhotoImage photo={active} className="aspect-video w-full" />
      </div>

      {ordered.length > 1 && (
        <div
          role="tablist"
          aria-label="Property photos"
          className="mt-3 flex gap-2 overflow-x-auto"
        >
          {ordered.map((photo) => (
            <button
              key={photo.id}
              type="button"
              role="tab"
              aria-selected={photo.id === active.id}
              aria-label={photo.isPrimary ? `${photo.altText} (primary photo)` : photo.altText}
              onClick={() => setActiveId(photo.id)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                photo.id === active.id ? "border-gold-500" : "border-transparent"
              }`}
            >
              <PropertyPhotoImage photo={photo} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
