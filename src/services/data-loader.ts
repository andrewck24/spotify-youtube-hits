import {
  checkDataIntegrity as checkIntegrity,
  localTracksDatabaseSchema,
  type LocalTracksDatabase,
} from "@/types/data-schema";

/**
 * Data Loader Service
 *
 * Purpose: 載入並驗證本地 tracks.json 資料庫
 *
 * Features:
 * - Fetch tracks.json from public directory
 * - Validate data with Zod schema
 * - Check data integrity (duplicates, inconsistencies)
 *
 * Usage:
 *   import { loadTracksDatabase } from '@/services/data-loader'
 *   const data = await loadTracksDatabase()
 */

/**
 * 載入並驗證本地資料庫
 * @throws {Error} 當載入或驗證失敗時
 */
export async function loadTracksDatabase(): Promise<LocalTracksDatabase> {
  try {
    // 使用相對路徑以支援 GitHub Pages 的 base path
    const response = await fetch("data/tracks.json");

    if (!response.ok) {
      throw new Error(
        `Failed to load tracks database: ${response.status} ${response.statusText}`,
      );
    }

    const rawData = await response.json();

    // 使用 Zod schema 驗證資料
    const validatedData = localTracksDatabaseSchema.parse(rawData);

    return validatedData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load tracks database: ${error.message}`);
    }
    throw new Error("Failed to load tracks database: Unknown error");
  }
}

/**
 * 檢查資料完整性
 * Re-export from data-schema for convenience
 */
export const checkDataIntegrity = checkIntegrity;
