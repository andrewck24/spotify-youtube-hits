import type { LocalTrackData } from "@/types/data-schema";
import Fuse from "fuse.js";
import { useMemo } from "react";

/**
 * 搜尋結果中的唯一藝人
 */
export interface UniqueArtist {
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
 * Fuse.js 搜尋引擎配置
 */
const FUSE_OPTIONS_BASE = {
  threshold: 0.3, // 容許 30% 的偏差（模糊匹配）
  includeScore: true,
  minMatchCharLength: 1, // 最少匹配字元數
};

/**
 * useSearch Hook
 *
 * Purpose: 分開搜尋藝人和歌曲，確保結果精確度
 *
 * Features:
 * - 獨立搜尋藝人（key: "artistName"）
 * - 獨立搜尋歌曲（key: "trackName"）
 * - 自動去重藝人（使用 Map 結構）
 * - 使用 useMemo 快取搜尋結果
 * - 空查詢回傳空結果
 *
 * @param tracks - 本地追蹤資料
 * @param query - 搜尋查詢字串
 * @returns 搜尋結果（唯一藝人 + 歌曲）
 */
export function useSearch(
  tracks: LocalTrackData[],
  query: string,
): SearchResults {
  // 建立 Fuse.js 搜尋索引（快取）
  // 藝人搜尋索引：只搜尋 artistName
  const artistFuse = useMemo(
    () =>
      new Fuse(tracks, {
        ...FUSE_OPTIONS_BASE,
        keys: ["artistName"],
      }),
    [tracks],
  );

  // 歌曲搜尋索引：只搜尋 trackName
  const trackFuse = useMemo(
    () =>
      new Fuse(tracks, {
        ...FUSE_OPTIONS_BASE,
        keys: ["trackName"],
      }),
    [tracks],
  );

  // 執行搜尋並提取結果（快取）
  const results = useMemo(() => {
    if (!query.trim()) {
      return { artists: [], tracks: [] };
    }

    // 1. 搜尋藝人
    const artistResults = artistFuse.search(query);

    // 使用 Map 去重藝人
    const uniqueArtists = new Map<string, UniqueArtist>();
    artistResults.forEach((result) => {
      const key = result.item.artistId;
      if (!uniqueArtists.has(key)) {
        uniqueArtists.set(key, {
          artistName: result.item.artistName,
          artistId: result.item.artistId,
        });
      }
    });

    // 2. 搜尋歌曲
    const trackResults = trackFuse.search(query);
    const tracksList = trackResults.map((result) => result.item);

    return {
      artists: Array.from(uniqueArtists.values()),
      tracks: tracksList,
    };
  }, [query, artistFuse, trackFuse]);

  return results;
}
