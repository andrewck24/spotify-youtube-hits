/**
 * Spotify Web API 型別定義
 *
 * 此檔案定義與 Spotify API 互動的合約介面，確保型別安全。
 * 基於 Spotify Web API Reference: https://developer.spotify.com/documentation/web-api/reference/
 *
 * @version 1.0.0
 * @date 2025-10-08
 */

// ============================================================================
// Authentication (Client Credentials Flow)
// ============================================================================

/**
 * POST https://accounts.spotify.com/api/token
 *
 * Request body for obtaining access token
 */
export interface SpotifyTokenRequest {
  grant_type: "client_credentials";
  client_id: string;
  client_secret: string;
}

/**
 * Response from token endpoint
 */
export interface SpotifyTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number; // seconds until token expiration
}

/**
 * Internal token state (with expiration tracking)
 */
export interface SpotifyToken {
  accessToken: string;
  tokenType: "Bearer";
  expiresAt: number; // Unix timestamp (ms)
}

// ============================================================================
// GET /artists/{id}
// ============================================================================

/**
 * Request parameters for fetching artist details
 */
export interface GetArtistRequest {
  id: string; // Spotify Artist ID
}

/**
 * Spotify Artist Object (Full)
 * Reference: https://developer.spotify.com/documentation/web-api/reference/get-an-artist
 */
export interface SpotifyArtist {
  // === 基本資訊 ===
  id: string; // Spotify Artist ID
  name: string; // 藝人名稱
  type: "artist";
  uri: string; // Spotify URI (e.g., "spotify:artist:3WrFJ7ztbogyGnTHbHJFl2")
  href: string; // API endpoint URL
  external_urls: {
    spotify: string; // Spotify Web URL
  };

  // === 視覺資料 ===
  images: SpotifyImage[]; // 藝人圖片 (按尺寸排序，[0] 為最大)

  // === 人氣指標 ===
  popularity: number; // 0-100，基於歌曲播放次數
  followers: {
    href: null; // Always null (Spotify API 規範)
    total: number; // 追蹤人數
  };

  // === 分類 ===
  genres: string[]; // 音樂風格 (e.g., ["rock", "alternative rock"])
}

/**
 * Spotify Image Object
 */
export interface SpotifyImage {
  url: string; // 圖片 URL
  height: number | null; // 高度 (px)
  width: number | null; // 寬度 (px)
}

// ============================================================================
// GET /tracks/{id}
// ============================================================================

/**
 * Request parameters for fetching track details
 */
export interface GetTrackRequest {
  id: string; // Spotify Track ID
  market?: string; // ISO 3166-1 alpha-2 country code (e.g., "TW")
}

/**
 * Spotify Track Object (Full)
 * Reference: https://developer.spotify.com/documentation/web-api/reference/get-track
 */
export interface SpotifyTrack {
  // === 基本資訊 ===
  id: string; // Spotify Track ID
  name: string; // 歌曲名稱
  type: "track";
  uri: string; // Spotify URI
  href: string; // API endpoint URL
  external_urls: {
    spotify: string; // Spotify Web URL
  };
  external_ids: {
    isrc?: string; // International Standard Recording Code
    ean?: string; // European Article Number
    upc?: string; // Universal Product Code
  };

  // === 藝人資訊 ===
  artists: SpotifyArtistSimplified[]; // 演唱者清單 (主唱 + 合作藝人)

  // === 專輯資訊 ===
  album: SpotifyAlbumSimplified;

  // === 音樂屬性 ===
  duration_ms: number; // 時長 (毫秒)
  explicit: boolean; // 是否包含露骨內容
  preview_url: string | null; // 30 秒預覽 URL (可能為 null)

  // === 人氣指標 ===
  popularity: number; // 0-100

  // === 可用性 ===
  is_playable?: boolean; // 是否可播放 (依市場而定)
  is_local: boolean; // 是否為本地檔案

  // === 其他 ===
  disc_number: number; // 光碟編號 (多光碟專輯)
  track_number: number; // 曲目編號
}

/**
 * Simplified Artist Object (embedded in Track/Album)
 */
export interface SpotifyArtistSimplified {
  id: string;
  name: string;
  type: "artist";
  uri: string;
  href: string;
  external_urls: {
    spotify: string;
  };
}

/**
 * Simplified Album Object (embedded in Track)
 */
export interface SpotifyAlbumSimplified {
  id: string;
  name: string; // 專輯名稱
  type: "album";
  uri: string;
  href: string;
  external_urls: {
    spotify: string;
  };

  // === 視覺資料 ===
  images: SpotifyImage[]; // 專輯封面

  // === 發行資訊 ===
  release_date: string; // 發行日期 (格式: YYYY-MM-DD 或 YYYY)
  release_date_precision: "year" | "month" | "day";

  // === 藝人資訊 ===
  artists: SpotifyArtistSimplified[];

  // === 其他 ===
  album_type: "album" | "single" | "compilation";
  total_tracks: number;
  available_markets?: string[]; // ISO 3166-1 alpha-2 country codes
}

// ============================================================================
// GET /audio-features/{id}
// ============================================================================

/**
 * Request parameters for fetching audio features
 */
export interface GetAudioFeaturesRequest {
  id: string; // Spotify Track ID
}

/**
 * Spotify Audio Features Object
 * Reference: https://developer.spotify.com/documentation/web-api/reference/get-audio-features
 *
 * 所有數值型指標範圍為 0.0 - 1.0（除非另有說明）
 */
/**
 * Audio Features from ReccoBeats API
 *
 * Simplified interface containing 9 core audio features.
 * Migrated from Spotify Audio Features API which is now deprecated.
 *
 * See: data-model.md for field descriptions and validation rules
 */
export interface SpotifyAudioFeatures {
  // === 核心音樂特徵指標 (ReccoBeats 提供) ===

  /** 聲學程度 (0.0-1.0): 音樂是否為原聲樂器演奏。1.0 表示高度確信為原聲演奏 */
  acousticness: number;

  /** 適合跳舞程度 (0.0-1.0): 基於節奏穩定性、速度、拍子強度。1.0 表示最適合跳舞 */
  danceability: number;

  /** 能量 (0.0-1.0): 音樂的強度與活力。1.0 表示高能量（快速、響亮、嘈雜） */
  energy: number;

  /** 器樂程度 (0.0-1.0): 音樂是否不含人聲。接近 1.0 表示高機率為器樂曲 */
  instrumentalness: number;

  /** 現場錄音可能性 (0.0-1.0): 音樂是否為現場演出錄音。>0.8 表示高機率為現場錄音 */
  liveness: number;

  /** 響度 (dB, -60 to 0): 整首歌曲的平均音量。典型範圍為 -60 到 0 dB */
  loudness: number;

  /** 語音內容比例 (0.0-1.0): 音樂中語音（非歌唱）的比例。>0.66 表示可能為 podcast 或有聲書 */
  speechiness: number;

  /** 速度 (BPM): 每分鐘拍數，表示音樂的節奏快慢 */
  tempo: number;

  /** 音樂正向度/快樂度 (0.0-1.0): 音樂傳達的情緒正向程度。1.0 = 快樂，0.0 = 悲傷 */
  valence: number;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Spotify API Error Response
 * Reference: https://developer.spotify.com/documentation/web-api/concepts/api-calls#regular-error-object
 */
export interface SpotifyErrorResponse {
  error: {
    status: number; // HTTP status code
    message: string; // 錯誤訊息
  };
}

/**
 * Common Spotify API error types
 */
export type SpotifyErrorType =
  | "INVALID_TOKEN" // 401: Token expired or invalid
  | "RATE_LIMIT" // 429: Too many requests
  | "NOT_FOUND" // 404: Resource not found
  | "BAD_REQUEST" // 400: Invalid request parameters
  | "SERVER_ERROR" // 5xx: Spotify server error
  | "NETWORK_ERROR"; // Client-side network failure

/**
 * Typed error for better error handling
 */
export class SpotifyApiError extends Error {
  constructor(
    public type: SpotifyErrorType,
    public status: number,
    message: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "SpotifyApiError";
  }
}

// ============================================================================
// Service Interface (契約定義)
// ============================================================================

/**
 * Spotify API Service 契約
 *
 * 所有與 Spotify API 互動的 service 必須實作此介面
 *
 * Note: 認證由 Cloudflare Worker 處理，前端服務不需要 initialize 方法
 */
export interface ISpotifyApiService {
  /**
   * 取得藝人資訊
   * @param artistId Spotify Artist ID
   * @throws {SpotifyApiError} 當 API 呼叫失敗時
   */
  getArtist(artistId: string): Promise<SpotifyArtist>;

  /**
   * 取得歌曲詳細資訊
   * @param trackId Spotify Track ID
   * @param market ISO 3166-1 alpha-2 country code (optional)
   * @throws {SpotifyApiError} 當 API 呼叫失敗時
   */
  getTrack(trackId: string, market?: string): Promise<SpotifyTrack>;

  /**
   * 取得歌曲音樂特徵
   * @param trackId Spotify Track ID
   * @throws {SpotifyApiError} 當 API 呼叫失敗時
   */
  getAudioFeatures(trackId: string): Promise<SpotifyAudioFeatures>;
}

// ============================================================================
// Type Guards (執行時型別檢查)
// ============================================================================

/**
 * 檢查是否為 Spotify API 錯誤回應
 */
export function isSpotifyErrorResponse(
  data: unknown,
): data is SpotifyErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as SpotifyErrorResponse).error === "object" &&
    "status" in (data as SpotifyErrorResponse).error &&
    "message" in (data as SpotifyErrorResponse).error
  );
}

/**
 * 檢查是否為有效的 Spotify Artist
 */
export function isValidSpotifyArtist(data: unknown): data is SpotifyArtist {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    "type" in data &&
    (data as SpotifyArtist).type === "artist"
  );
}

/**
 * 檢查是否為有效的 Spotify Track
 */
export function isValidSpotifyTrack(data: unknown): data is SpotifyTrack {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    "type" in data &&
    (data as SpotifyTrack).type === "track"
  );
}

/**
 * 檢查是否為有效的 Audio Features (ReccoBeats API)
 *
 * Validates all 9 required fields:
 * - acousticness, danceability, energy, instrumentalness, liveness
 * - loudness, speechiness, tempo, valence
 *
 * Validation ranges per data-model.md:
 * - [0.0 - 1.0]: acousticness, danceability, energy, instrumentalness, liveness, speechiness, valence
 * - [-60 to 0]: loudness (dB)
 * - positive number: tempo (BPM)
 */
export function isValidAudioFeatures(
  data: unknown,
): data is SpotifyAudioFeatures {
  if (typeof data !== "object" || data === null) return false;

  const af = data as Record<string, unknown>;

  // Check all 9 required fields exist and have correct types
  return (
    typeof af.acousticness === "number" &&
    af.acousticness >= 0 &&
    af.acousticness <= 1 &&
    typeof af.danceability === "number" &&
    af.danceability >= 0 &&
    af.danceability <= 1 &&
    typeof af.energy === "number" &&
    af.energy >= 0 &&
    af.energy <= 1 &&
    typeof af.instrumentalness === "number" &&
    af.instrumentalness >= 0 &&
    af.instrumentalness <= 1 &&
    typeof af.liveness === "number" &&
    af.liveness >= 0 &&
    af.liveness <= 1 &&
    typeof af.loudness === "number" &&
    af.loudness >= -60 &&
    af.loudness <= 0 &&
    typeof af.speechiness === "number" &&
    af.speechiness >= 0 &&
    af.speechiness <= 1 &&
    typeof af.tempo === "number" &&
    af.tempo > 0 &&
    typeof af.valence === "number" &&
    af.valence >= 0 &&
    af.valence <= 1
  );
}

/**
 * 檢查是否為有效的 Spotify Track ID 格式
 *
 * Format: 22 characters, Base-62 (a-z, A-Z, 0-9)
 * Example: "06HL4z0CvFAxyc27GXpf02"
 *
 * See: data-model.md for format specification
 */
export function isValidTrackId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    /^[a-zA-Z0-9]{22}$/.test(id)
  );
}
