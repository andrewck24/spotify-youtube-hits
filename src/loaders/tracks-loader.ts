import type { LocalTracksDatabase } from "@/types/data-schema";
import {
  checkDataIntegrity,
  localTracksDatabaseSchema,
} from "@/types/data-schema";

/**
 * Tracks Loader for React Router v7
 *
 * Purpose: Load tracks.json database before page render
 *
 * Features:
 * - sessionStorage caching with version check
 * - Zod schema validation
 * - Data integrity verification
 * - Single load per session (automatic deduplication)
 *
 * Usage:
 *   // In router.tsx
 *   { id: "root", path: "/", loader: tracksLoader, children: [...] }
 *
 *   // In components
 *   const { tracks } = useRouteLoaderData("root") as Awaited<
 *     ReturnType<typeof tracksLoader>
 *   >;
 */

const STORAGE_KEY = "music-hits:tracks-data";
const VERSION_KEY = "music-hits:data-version";

export async function tracksLoader() {
  try {
    // 1. Check sessionStorage cache
    const cachedData = sessionStorage.getItem(STORAGE_KEY);
    const cachedVersion = sessionStorage.getItem(VERSION_KEY);

    if (cachedData && cachedVersion) {
      try {
        const parsed = JSON.parse(cachedData) as LocalTracksDatabase;
        checkDataIntegrity(parsed);
        return { tracks: parsed };
      } catch (error) {
        // Cache corrupted, clear and reload
        // eslint-disable-next-line no-console
        console.warn("Cached tracks data corrupted, reloading:", error);
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(VERSION_KEY);
      }
    }

    // 2. Load from remote
    const response = await fetch("/data/tracks.json");
    if (!response.ok) {
      throw new Error(
        `Failed to load tracks database: ${response.status} ${response.statusText}`,
      );
    }

    const rawData = await response.json();

    // 3. Validate schema
    const validatedData = localTracksDatabaseSchema.parse(rawData);

    // 4. Check data integrity
    checkDataIntegrity(validatedData);

    // 5. Save to sessionStorage
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(validatedData));
      sessionStorage.setItem(VERSION_KEY, validatedData.version);
    } catch (e) {
      // sessionStorage quota exceeded or disabled, continue without caching
      // eslint-disable-next-line no-console
      console.warn("Failed to cache tracks data:", e);
    }

    return { tracks: validatedData };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to load tracks database: ${message}`);
  }
}
