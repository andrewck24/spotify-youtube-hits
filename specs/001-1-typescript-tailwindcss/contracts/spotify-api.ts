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
  grant_type: "client_credentials"
  client_id: string
  client_secret: string
}

/**
 * Response from token endpoint
 */
export interface SpotifyTokenResponse {
  access_token: string
  token_type: "Bearer"
  expires_in: number // seconds until token expiration
}

/**
 * Internal token state (with expiration tracking)
 */
export interface SpotifyToken {
  accessToken: string
  tokenType: "Bearer"
  expiresAt: number // Unix timestamp (ms)
}

// ============================================================================
// GET /artists/{id}
// ============================================================================

/**
 * Request parameters for fetching artist details
 */
export interface GetArtistRequest {
  id: string // Spotify Artist ID
}

/**
 * Spotify Artist Object (Full)
 * Reference: https://developer.spotify.com/documentation/web-api/reference/get-an-artist
 */
export interface SpotifyArtist {
  // === 基本資訊 ===
  id: string // Spotify Artist ID
  name: string // 藝人名稱
  type: "artist"
  uri: string // Spotify URI (e.g., "spotify:artist:3WrFJ7ztbogyGnTHbHJFl2")
  href: string // API endpoint URL
  external_urls: {
    spotify: string // Spotify Web URL
  }

  // === 視覺資料 ===
  images: SpotifyImage[] // 藝人圖片 (按尺寸排序，[0] 為最大)

  // === 人氣指標 ===
  popularity: number // 0-100，基於歌曲播放次數
  followers: {
    href: null // Always null (Spotify API 規範)
    total: number // 追蹤人數
  }

  // === 分類 ===
  genres: string[] // 音樂風格 (e.g., ["rock", "alternative rock"])
}

/**
 * Spotify Image Object
 */
export interface SpotifyImage {
  url: string // 圖片 URL
  height: number | null // 高度 (px)
  width: number | null // 寬度 (px)
}

// ============================================================================
// GET /tracks/{id}
// ============================================================================

/**
 * Request parameters for fetching track details
 */
export interface GetTrackRequest {
  id: string // Spotify Track ID
  market?: string // ISO 3166-1 alpha-2 country code (e.g., "TW")
}

/**
 * Spotify Track Object (Full)
 * Reference: https://developer.spotify.com/documentation/web-api/reference/get-track
 */
export interface SpotifyTrack {
  // === 基本資訊 ===
  id: string // Spotify Track ID
  name: string // 歌曲名稱
  type: "track"
  uri: string // Spotify URI
  href: string // API endpoint URL
  external_urls: {
    spotify: string // Spotify Web URL
  }
  external_ids: {
    isrc?: string // International Standard Recording Code
    ean?: string // European Article Number
    upc?: string // Universal Product Code
  }

  // === 藝人資訊 ===
  artists: SpotifyArtistSimplified[] // 演唱者清單 (主唱 + 合作藝人)

  // === 專輯資訊 ===
  album: SpotifyAlbumSimplified

  // === 音樂屬性 ===
  duration_ms: number // 時長 (毫秒)
  explicit: boolean // 是否包含露骨內容
  preview_url: string | null // 30 秒預覽 URL (可能為 null)

  // === 人氣指標 ===
  popularity: number // 0-100

  // === 可用性 ===
  is_playable?: boolean // 是否可播放 (依市場而定)
  is_local: boolean // 是否為本地檔案

  // === 其他 ===
  disc_number: number // 光碟編號 (多光碟專輯)
  track_number: number // 曲目編號
}

/**
 * Simplified Artist Object (embedded in Track/Album)
 */
export interface SpotifyArtistSimplified {
  id: string
  name: string
  type: "artist"
  uri: string
  href: string
  external_urls: {
    spotify: string
  }
}

/**
 * Simplified Album Object (embedded in Track)
 */
export interface SpotifyAlbumSimplified {
  id: string
  name: string // 專輯名稱
  type: "album"
  uri: string
  href: string
  external_urls: {
    spotify: string
  }

  // === 視覺資料 ===
  images: SpotifyImage[] // 專輯封面

  // === 發行資訊 ===
  release_date: string // 發行日期 (格式: YYYY-MM-DD 或 YYYY)
  release_date_precision: "year" | "month" | "day"

  // === 藝人資訊 ===
  artists: SpotifyArtistSimplified[]

  // === 其他 ===
  album_type: "album" | "single" | "compilation"
  total_tracks: number
  available_markets?: string[] // ISO 3166-1 alpha-2 country codes
}

// ============================================================================
// GET /audio-features/{id}
// ============================================================================

/**
 * Request parameters for fetching audio features
 */
export interface GetAudioFeaturesRequest {
  id: string // Spotify Track ID
}

/**
 * Spotify Audio Features Object
 * Reference: https://developer.spotify.com/documentation/web-api/reference/get-audio-features
 *
 * 所有數值型指標範圍為 0.0 - 1.0（除非另有說明）
 */
export interface SpotifyAudioFeatures {
  id: string // Spotify Track ID
  type: "audio_features"
  uri: string
  track_href: string // API endpoint URL for the track
  analysis_url: string // Audio analysis endpoint

  // === 音樂特徵指標 (0.0 - 1.0) ===
  acousticness: number // 聲學程度 (1.0 = 純聲學，0.0 = 電子音樂)
  danceability: number // 適合跳舞程度 (基於節奏、穩定性、速度)
  energy: number // 能量 (1.0 = 快速、吵雜、嘈雜)
  instrumentalness: number // 器樂程度 (1.0 = 無人聲)
  liveness: number // 現場錄音可能性 (> 0.8 很可能是現場)
  speechiness: number // 語音內容比例 (> 0.66 可能是 podcast/spoken word)
  valence: number // 音樂正向度 (1.0 = 快樂/歡樂，0.0 = 悲傷/憤怒)

  // === 音樂理論屬性 ===
  key: number // 音調 (0 = C, 1 = C♯/D♭, ..., 11 = B, -1 = 無法偵測)
  mode: 0 | 1 // 調式 (1 = Major, 0 = Minor)
  time_signature: number // 拍號 (3-7，估計值)

  // === 物理屬性 ===
  loudness: number // 響度 (dB，範圍通常 -60 ~ 0)
  tempo: number // 速度 (BPM，每分鐘拍數)
  duration_ms: number // 時長 (毫秒)
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
    status: number // HTTP status code
    message: string // 錯誤訊息
  }
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
  | "NETWORK_ERROR" // Client-side network failure

/**
 * Typed error for better error handling
 */
export class SpotifyApiError extends Error {
  constructor(
    public type: SpotifyErrorType,
    public status: number,
    message: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = "SpotifyApiError"
  }
}

// ============================================================================
// Service Interface (契約定義)
// ============================================================================

/**
 * Spotify API Service 契約
 *
 * 所有與 Spotify API 互動的 service 必須實作此介面
 */
export interface ISpotifyApiService {
  /**
   * 初始化 Spotify API (取得 access token)
   * @throws {SpotifyApiError} 當認證失敗時
   */
  initialize(): Promise<void>

  /**
   * 取得藝人資訊
   * @param artistId Spotify Artist ID
   * @throws {SpotifyApiError} 當 API 呼叫失敗時
   */
  getArtist(artistId: string): Promise<SpotifyArtist>

  /**
   * 取得歌曲詳細資訊
   * @param trackId Spotify Track ID
   * @param market ISO 3166-1 alpha-2 country code (optional)
   * @throws {SpotifyApiError} 當 API 呼叫失敗時
   */
  getTrack(trackId: string, market?: string): Promise<SpotifyTrack>

  /**
   * 取得歌曲音樂特徵
   * @param trackId Spotify Track ID
   * @throws {SpotifyApiError} 當 API 呼叫失敗時
   */
  getAudioFeatures(trackId: string): Promise<SpotifyAudioFeatures>

  /**
   * 批次取得音樂特徵 (最多 100 筆)
   * @param trackIds Spotify Track IDs (max 100)
   * @returns Map<trackId, AudioFeatures>
   * @throws {SpotifyApiError} 當 API 呼叫失敗時
   */
  getAudioFeaturesBatch(
    trackIds: string[]
  ): Promise<Map<string, SpotifyAudioFeatures>>

  /**
   * 檢查 token 是否有效
   */
  isTokenValid(): boolean

  /**
   * 重新整理 token (當 token 即將過期時)
   * @throws {SpotifyApiError} 當認證失敗時
   */
  refreshToken(): Promise<void>
}

// ============================================================================
// Type Guards (執行時型別檢查)
// ============================================================================

/**
 * 檢查是否為 Spotify API 錯誤回應
 */
export function isSpotifyErrorResponse(
  data: unknown
): data is SpotifyErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as SpotifyErrorResponse).error === "object" &&
    "status" in (data as SpotifyErrorResponse).error &&
    "message" in (data as SpotifyErrorResponse).error
  )
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
  )
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
  )
}

/**
 * 檢查是否為有效的 Audio Features
 */
export function isValidAudioFeatures(
  data: unknown
): data is SpotifyAudioFeatures {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "type" in data &&
    (data as SpotifyAudioFeatures).type === "audio_features" &&
    "acousticness" in data &&
    "danceability" in data
  )
}
