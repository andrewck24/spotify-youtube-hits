import { useMemo } from "react";
import type { LocalTrackData } from "@/types/data-schema";
import { createSearchIndex } from "@/lib/search";

/**
 * 搜尋結果中的唯一藝人
 */
interface UniqueArtist {
  artistName: string;
  artistId: string;
}

/**
 * 搜尋結果介面
 */
interface SearchResults {
  artists: UniqueArtist[];
  tracks: LocalTrackData[];
}

/**
 * useSearch Hook
 *
 * Purpose: 使用「一次搜尋，過濾顯示」實作搜尋邏輯
 *
 * Features:
 * - 同時搜尋藝人和歌曲（keys: ["artistName", "trackName"]）
 * - 自動去重藝人（使用 Map 結構）
 * - 使用 useMemo 快取搜尋結果
 * - 空查詢回傳空結果
 *
 * @param tracks - 本地追蹤資料
 * @param query - 搜尋查詢字串
 * @returns 搜尋結果（唯一藝人 + 歌曲）
 *
 * Usage:
 *   const { artists, tracks } = useSearch(tracksDatabase.tracks, query);
 */
export function useSearch(
  tracks: LocalTrackData[],
  query: string,
): SearchResults {
  // 建立 Fuse.js 搜尋索引（快取）
  const fuseInstance = useMemo(() => createSearchIndex(tracks), [tracks]);

  // 執行搜尋並提取結果（快取）
  const results = useMemo(() => {
    if (!query.trim() || !fuseInstance) {
      return { artists: [], tracks: [] };
    }

    // 一次性搜尋（涵蓋 artistName 和 trackName）
    const allResults = fuseInstance.search(query);

    // 使用 Map 去重藝人（O(1) 查找）
    const uniqueArtists = new Map<string, UniqueArtist>();
    const tracksList: LocalTrackData[] = [];

    allResults.forEach((result) => {
      const key = result.item.artistId;

      // 提取唯一藝人
      if (!uniqueArtists.has(key)) {
        uniqueArtists.set(key, {
          artistName: result.item.artistName,
          artistId: result.item.artistId,
        });
      }

      // 收集所有歌曲
      tracksList.push(result.item);
    });

    return {
      artists: Array.from(uniqueArtists.values()),
      tracks: tracksList,
    };
  }, [query, fuseInstance]);

  return results;
}
