import type { LocalTrackData } from "@/types/data-schema";
import Fuse from "fuse.js";

/**
 * Search Service
 *
 * Purpose: 使用 Fuse.js 實現客戶端搜尋引擎
 *
 * Features:
 * - 建立搜尋索引（使用 artistName 和 trackName）
 * - 模糊搜尋（threshold: 0.3）
 * - 限制結果數量
 *
 * Usage:
 *   const fuseInstance = createSearchIndex(tracks)
 *   const results = searchArtists(fuseInstance, 'Gorillaz', 12)
 */

/**
 * Fuse.js 搜尋引擎配置
 */
const FUSE_OPTIONS = {
  keys: ["artistName", "trackName"],
  threshold: 0.3, // 容許 30% 的偏差（模糊匹配）
  includeScore: true,
  minMatchCharLength: 1, // 最少匹配字元數
};

const SEARCH_LIMIT = 12; // 預設搜尋結果限制

/**
 * 建立 Fuse.js 搜尋索引
 * @param tracks - 本地追蹤資料
 * @returns Fuse 索引實例
 */
export function createSearchIndex(
  tracks: LocalTrackData[],
): Fuse<LocalTrackData> {
  return new Fuse(tracks, FUSE_OPTIONS);
}

/**
 * 執行藝人搜尋
 * @param fuseInstance - Fuse.js 搜尋引擎實例
 * @param query - 搜尋查詢字串
 * @param limit - 結果限制數量（預設 12）
 * @returns 搜尋結果（根據分數排序）
 */
export function searchArtists(
  fuseInstance: Fuse<LocalTrackData>,
  query: string,
  limit: number = SEARCH_LIMIT,
) {
  if (!query.trim()) {
    return [];
  }

  // 執行搜尋
  const results = fuseInstance.search(query);

  // 限制結果數量並回傳
  return results.slice(0, limit);
}
