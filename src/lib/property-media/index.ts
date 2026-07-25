import { PlaceholderMediaAdapter } from "./placeholder-adapter";
import type { PropertyMediaProvider } from "./provider";

let cachedProvider: PropertyMediaProvider | null = null;

/**
 * Returns the active PropertyMediaProvider. Placeholder graphics are the
 * only implementation until a licensed photo feed is authorized — a real
 * adapter plugs in here without any gallery/card component changing.
 */
export function getPropertyMediaProvider(): PropertyMediaProvider {
  if (!cachedProvider) {
    cachedProvider = new PlaceholderMediaAdapter();
  }
  return cachedProvider;
}
