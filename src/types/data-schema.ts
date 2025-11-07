/**
 * 本地資料庫 JSON Schema 定義
 *
 * 此檔案定義 public/data/tracks.json 的資料結構與驗證規則。
 * 資料來源：2023 年 Spotify + YouTube 靜態快照
 *
 * @version 1.0.0
 * @date 2025-10-08
 */

import { z } from "zod";

// ============================================================================
// Core Data Types
// ============================================================================

/**
 * 人氣指標（來自本地資料庫）
 */
export interface PopularityMetrics {
  // === Spotify 指標 ===
  playCount?: number; // Spotify 播放次數（若有）
  spotifyPopularity?: number; // 0-100，Spotify 演算法計算（可選）
  spotifyStreams?: number; // 總播放次數（若有）

  // === YouTube 指標 ===
  youtubeViews: number; // 觀看次數
  youtubeLikes: number; // 按讚數
  youtubeComments: number; // 留言數

  // === 綜合指標 ===
  combinedScore?: number; // 自訂綜合分數（可選）
}

/**
 * 本地資料庫的 Track 資料結構
 *
 * NOTE: 這是靜態 JSON 中的資料格式，不包含即時 API 資料（如 AudioFeatures）
 */
export interface LocalTrackData {
  // === 基本資訊 ===
  trackId: string; // Spotify Track ID (primary key)
  trackName: string; // 歌曲名稱
  artistId: string; // Spotify Artist ID
  artistName: string; // 藝人名稱
  artistMonthlyListeners?: number; // 藝人每月聽眾數（快照時間點）
  releaseYear: number; // 發行年份 (YYYY)

  // === 人氣指標 ===
  popularity: PopularityMetrics;

  // === UI 狀態 ===
  indicator: 0 | 1 | 2; // 內部使用的指示器（用途待確認）
}

/**
 * 本地資料庫根結構
 */
export interface LocalTracksDatabase {
  // === Metadata ===
  version: string; // 資料版本 (e.g., "2023.1", "2024.1")
  generatedAt: string; // ISO 8601 timestamp (e.g., "2023-12-31T23:59:59Z")
  totalTracks: number; // 總歌曲數

  // === Data ===
  tracks: LocalTrackData[]; // 歌曲陣列

  // === Index (optional, for performance) ===
  index?: {
    byArtist: Record<string, string[]>; // artistId → trackIds[]
    byYear: Record<number, string[]>; // year → trackIds[]
  };
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

/**
 * 人氣指標驗證規則
 */
export const popularityMetricsSchema = z.object({
  playCount: z.number().int().nonnegative().optional(),
  spotifyPopularity: z.number().int().min(0).max(100).optional(),
  spotifyStreams: z.number().int().nonnegative().optional(),
  youtubeViews: z.number().int().nonnegative(),
  youtubeLikes: z.number().int().nonnegative(),
  youtubeComments: z.number().int().nonnegative(),
  combinedScore: z.number().nonnegative().optional(),
});

/**
 * 單一 Track 驗證規則
 */
export const localTrackDataSchema = z.object({
  trackId: z.string().min(1, "Track ID 不可為空"),
  trackName: z.string().min(1, "歌曲名稱不可為空"),
  artistId: z.string().min(1, "Artist ID 不可為空"),
  artistName: z.string().min(1, "藝人名稱不可為空"),
  artistMonthlyListeners: z.number().int().nonnegative().optional(),
  releaseYear: z
    .number()
    .int()
    .min(1900, "發行年份不得早於 1900")
    .max(new Date().getFullYear() + 1, "發行年份不得超過明年"),
  popularity: popularityMetricsSchema,
  indicator: z.union([z.literal(0), z.literal(1), z.literal(2)]),
});

/**
 * 資料庫根結構驗證規則
 */
export const localTracksDatabaseSchema = z.object({
  version: z.string().regex(/^\d{4}\.\d+$/, "版本格式必須為 YYYY.N"),
  generatedAt: z
    .string()
    .datetime({ message: "必須為有效的 ISO 8601 時間格式" }),
  totalTracks: z.number().int().positive(),
  tracks: z.array(localTrackDataSchema),
  index: z
    .object({
      byArtist: z.record(z.string(), z.array(z.string())),
      byYear: z.record(z.string(), z.array(z.string())),
    })
    .optional(),
});

// ============================================================================
// Type Guards
// ============================================================================

/**
 * 檢查是否為有效的 PopularityMetrics
 */
export function isValidPopularityMetrics(
  data: unknown,
): data is PopularityMetrics {
  try {
    popularityMetricsSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * 檢查是否為有效的 LocalTrackData
 */
export function isValidLocalTrackData(data: unknown): data is LocalTrackData {
  try {
    localTrackDataSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * 檢查是否為有效的 LocalTracksDatabase
 */
export function isValidLocalTracksDatabase(
  data: unknown,
): data is LocalTracksDatabase {
  try {
    localTracksDatabaseSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Data Validation Utilities
// ============================================================================

/**
 * 驗證並解析 tracks.json 資料
 *
 * @param jsonData 原始 JSON 資料
 * @returns 驗證成功的資料庫物件
 * @throws {z.ZodError} 當資料格式不符時
 */
export function validateTracksDatabase(jsonData: unknown): LocalTracksDatabase {
  return localTracksDatabaseSchema.parse(jsonData);
}

/**
 * 安全驗證 tracks.json 資料（不拋出錯誤）
 *
 * @param jsonData 原始 JSON 資料
 * @returns 驗證結果物件
 */
export function safeValidateTracksDatabase(jsonData: unknown): {
  success: boolean;
  data?: LocalTracksDatabase;
  error?: z.ZodError;
} {
  const result = localTracksDatabaseSchema.safeParse(jsonData);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

// ============================================================================
// Data Transformation (Local → Redux State)
// ============================================================================

/**
 * 將本地 Track 資料轉換為 Redux State 格式
 *
 * NOTE: 此轉換僅處理本地資料，不包含 API 資料（features, album）
 */
export interface TrackStateData extends LocalTrackData {
  // Redux 狀態會額外加入以下欄位（由 API 取得）
  features?: {
    acousticness: number;
    danceability: number;
    energy: number;
    instrumentalness: number;
    liveness: number;
    speechiness: number;
    valence: number;
    key: number;
    mode: 0 | 1;
    loudness: number;
    tempo: number;
    timeSignature: number;
  };
  album?: {
    id: string;
    name: string;
    coverUrl: string;
    releaseDate: string;
    totalTracks: number;
  };
}

/**
 * 轉換單一 Track 資料
 */
export function transformLocalTrackToState(
  localTrack: LocalTrackData,
): TrackStateData {
  return {
    ...localTrack,
    // features 與 album 初始為 undefined，由 API 呼叫後填入
  };
}

/**
 * 批次轉換 Tracks 資料
 */
export function transformLocalTracksToState(
  localTracks: LocalTrackData[],
): TrackStateData[] {
  return localTracks.map(transformLocalTrackToState);
}

// ============================================================================
// Data Integrity Checks
// ============================================================================

/**
 * 資料完整性檢查結果
 */
export interface DataIntegrityReport {
  isValid: boolean;
  totalTracks: number;
  issues: DataIntegrityIssue[];
}

export interface DataIntegrityIssue {
  type:
    | "DUPLICATE_TRACK_ID"
    | "MISSING_FIELD"
    | "INVALID_VALUE"
    | "METADATA_MISMATCH";
  trackId?: string;
  field?: string;
  message: string;
}

/**
 * 執行資料完整性檢查
 *
 * @param database 已驗證的資料庫物件
 * @returns 檢查報告
 */
export function checkDataIntegrity(
  database: LocalTracksDatabase,
): DataIntegrityReport {
  const issues: DataIntegrityIssue[] = [];
  const trackIdSet = new Set<string>();

  // 1. 檢查重複的 Track ID
  for (const track of database.tracks) {
    if (trackIdSet.has(track.trackId)) {
      issues.push({
        type: "DUPLICATE_TRACK_ID",
        trackId: track.trackId,
        message: `發現重複的 Track ID: ${track.trackId}`,
      });
    }
    trackIdSet.add(track.trackId);
  }

  // 2. 檢查 metadata 是否與實際資料一致
  if (database.totalTracks !== database.tracks.length) {
    issues.push({
      type: "METADATA_MISMATCH",
      message: `totalTracks (${database.totalTracks}) 與實際歌曲數量 (${database.tracks.length}) 不一致`,
    });
  }

  // 3. 檢查索引資料（若存在）
  if (database.index) {
    const indexedTrackIds = new Set(
      Object.values(database.index.byArtist).flat(),
    );
    const actualTrackIds = new Set(database.tracks.map((t) => t.trackId));

    // 檢查索引中的 Track ID 是否都存在於實際資料中
    for (const indexedId of indexedTrackIds) {
      if (!actualTrackIds.has(indexedId)) {
        issues.push({
          type: "INVALID_VALUE",
          trackId: indexedId,
          message: `索引中的 Track ID "${indexedId}" 不存在於實際資料中`,
        });
      }
    }
  }

  return {
    isValid: issues.length === 0,
    totalTracks: database.tracks.length,
    issues,
  };
}

// ============================================================================
// Mock Data Generator (for testing)
// ============================================================================

/**
 * 產生測試用的 Mock 資料
 *
 * @param count 產生的歌曲數量
 * @returns Mock 資料庫物件
 */
export function generateMockTracksDatabase(
  count: number = 10,
): LocalTracksDatabase {
  const tracks: LocalTrackData[] = Array.from({ length: count }, (_, i) => ({
    trackId: `mock-track-${i + 1}`,
    trackName: `Mock Track ${i + 1}`,
    artistId: `mock-artist-${(i % 3) + 1}`,
    artistName: `Mock Artist ${(i % 3) + 1}`,
    releaseYear: 2020 + (i % 4),
    popularity: {
      spotifyPopularity: Math.floor(Math.random() * 100),
      youtubeViews: Math.floor(Math.random() * 10000000),
      youtubeLikes: Math.floor(Math.random() * 500000),
      youtubeComments: Math.floor(Math.random() * 50000),
    },
    indicator: (i % 2) as 0 | 1,
  }));

  return {
    version: "2023.1",
    generatedAt: new Date().toISOString(),
    totalTracks: count,
    tracks,
  };
}
