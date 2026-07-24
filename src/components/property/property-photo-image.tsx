"use client";

import { useState } from "react";
import type { PropertyPhoto } from "@/types/property";
import { PhotoPlaceholder } from "./photo-placeholder";
import { PhotoErrorState } from "./photo-error-state";

type PropertyPhotoImageProps = {
  photo: PropertyPhoto;
  className?: string;
};

/**
 * Renders one photo regardless of provider: a generated placeholder when no
 * real image URL exists yet, or a real <img> with an error fallback once a
 * future PropertyMediaProvider starts returning real URLs — no other
 * component needs to change when that happens.
 */
export function PropertyPhotoImage({ photo, className = "" }: PropertyPhotoImageProps) {
  const [failed, setFailed] = useState(false);

  if (!photo.url) {
    return <PhotoPlaceholder label={photo.altText} className={className} />;
  }

  if (failed) {
    return <PhotoErrorState className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- provider photo URLs aren't known ahead of time, so next/image's remote-domain allowlist can't be configured yet.
    <img
      src={photo.url}
      alt={photo.altText}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
