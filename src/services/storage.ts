import type { LocalTracksDatabase } from "@/types/data-schema";

/**
 * Storage Service
 *
 * Purpose: 管理 sessionStorage 快取
 *
 * Features:
 * - Save/load tracks data from sessionStorage
 * - Handle quota exceeded errors
 * - Version management
 *
 * Usage:
 *   import { storage } from '@/services/storage'
 *   storage.saveTracksData(data)
 */

const STORAGE_KEY = "spotify-youtube-hits:tracks-data";
const VERSION_KEY = "spotify-youtube-hits:data-version";

export class StorageService {
  /**
   * 儲存 tracks 資料至 sessionStorage
   * @returns true if successful, false if quota exceeded
   */
  saveTracksData(data: LocalTracksDatabase): boolean {
    try {
      const serialized = JSON.stringify(data);
      sessionStorage.setItem(STORAGE_KEY, serialized);
      sessionStorage.setItem(VERSION_KEY, data.version);
      return true;
    } catch (error) {
      // Quota exceeded or other errors
      // eslint-disable-next-line no-console
      console.warn("Failed to save to sessionStorage:", error);
      return false;
    }
  }

  /**
   * 從 sessionStorage 讀取 tracks 資料
   * @returns data if exists, null otherwise
   */
  loadTracksData(): LocalTracksDatabase | null {
    try {
      const serialized = sessionStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        return null;
      }
      return JSON.parse(serialized) as LocalTracksDatabase;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to load from sessionStorage:", error);
      return null;
    }
  }

  /**
   * 清除快取資料
   */
  clearTracksData(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(VERSION_KEY);
  }

  /**
   * 取得快取的資料版本
   */
  getDataVersion(): string | null {
    return sessionStorage.getItem(VERSION_KEY);
  }
}

/**
 * Singleton instance
 */
export const storage = new StorageService();
