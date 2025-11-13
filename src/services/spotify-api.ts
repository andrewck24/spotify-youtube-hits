import type {
  ISpotifyApiService,
  SpotifyArtist,
  SpotifyAudioFeatures,
  SpotifyTrack,
} from "@/types/spotify";
import {
  SpotifyApiError,
  isSpotifyErrorResponse,
  isValidAudioFeatures,
  isValidSpotifyArtist,
  isValidSpotifyTrack,
} from "@/types/spotify";

/**
 * Spotify API Service Implementation
 *
 * Purpose: 處理所有與 Spotify Web API 的互動
 *
 * Features:
 * - 透過 Cloudflare Worker 代理 Spotify API 請求
 * - Worker 處理認證和 token 管理
 * - 型別安全的 API 呼叫
 * - 完整的錯誤處理
 *
 * Usage:
 *   import { spotifyApi } from '@/services/spotify-api'
 *   const artist = await spotifyApi.getArtist('artistId')
 *
 * Note: API 請求會透過 Worker proxy，不需要在前端處理認證
 */

/**
 * Spotify API Base URL
 *
 * Configuration:
 * - Development: http://localhost:8787/api/spotify (direct to Worker dev server)
 * - Production: /api/spotify (relative path, same origin as frontend)
 *
 * Override via environment variable VITE_API_BASE_URL
 * See: .env.development, .env.production, .env.example
 */
const WORKER_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/spotify";

// Development debug logging
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log("[Spotify API Service] Initialized");
  // eslint-disable-next-line no-console
  console.log("[Spotify API Service] Base URL:", WORKER_API_BASE_URL);
  // eslint-disable-next-line no-console
  console.log("[Spotify API Service] Mode:", import.meta.env.MODE);
}

export class SpotifyApiService implements ISpotifyApiService {
  /**
   * 取得藝人資訊
   * Note: 透過 Worker proxy，Worker 處理認證
   */
  async getArtist(artistId: string): Promise<SpotifyArtist> {
    try {
      const url = `${WORKER_API_BASE_URL}/artists/${artistId}`;
      const response = await fetch(url);

      await this.handleApiError(response);

      const data = await response.json();

      if (!isValidSpotifyArtist(data)) {
        throw new SpotifyApiError(
          "SERVER_ERROR",
          500,
          "Invalid artist data received from Spotify API"
        );
      }

      return data;
    } catch (error) {
      if (error instanceof SpotifyApiError) {
        throw error;
      }
      throw new SpotifyApiError(
        "NETWORK_ERROR",
        0,
        "Network error while fetching artist",
        error
      );
    }
  }

  /**
   * 取得歌曲詳細資訊
   * Note: 透過 Worker proxy，Worker 處理認證
   * @param _market ISO 3166-1 alpha-2 country code (currently not supported by Worker)
   */
  async getTrack(trackId: string, _market?: string): Promise<SpotifyTrack> {
    try {
      // Note: Worker endpoint 目前不支援 market 參數
      // 如果需要 market 參數，需要擴展 Worker API
      const url = `${WORKER_API_BASE_URL}/tracks/${trackId}`;

      const response = await fetch(url);

      await this.handleApiError(response);

      const data = await response.json();

      if (!isValidSpotifyTrack(data)) {
        throw new SpotifyApiError(
          "SERVER_ERROR",
          500,
          "Invalid track data received from Spotify API"
        );
      }

      return data;
    } catch (error) {
      if (error instanceof SpotifyApiError) {
        throw error;
      }
      throw new SpotifyApiError(
        "NETWORK_ERROR",
        0,
        "Network error while fetching track",
        error
      );
    }
  }

  /**
   * 取得歌曲音樂特徵
   * Note: 透過 Worker proxy，Worker 處理認證
   */
  async getAudioFeatures(trackId: string): Promise<SpotifyAudioFeatures> {
    try {
      const url = `${WORKER_API_BASE_URL}/audio-features/${trackId}`;
      const response = await fetch(url);

      await this.handleApiError(response);

      const data = await response.json();

      if (!isValidAudioFeatures(data)) {
        throw new SpotifyApiError(
          "SERVER_ERROR",
          500,
          "Invalid audio features data received from Spotify API"
        );
      }

      return data;
    } catch (error) {
      if (error instanceof SpotifyApiError) {
        throw error;
      }
      throw new SpotifyApiError(
        "NETWORK_ERROR",
        0,
        "Network error while fetching audio features",
        error
      );
    }
  }

  /**
   * 處理 API 錯誤回應
   * 支援 Worker 錯誤格式和 Spotify API 錯誤格式
   */
  private async handleApiError(response: Response): Promise<void> {
    if (response.ok) {
      return;
    }

    const data = (await response.json()) as unknown;

    // Worker error format: { error: string, message: string, status: number }
    if (
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string" &&
      "message" in data &&
      typeof data.message === "string" &&
      "status" in data &&
      typeof data.status === "number"
    ) {
      const errorType = this.mapHttpStatusToErrorType(response.status);
      throw new SpotifyApiError(errorType, data.status, data.message);
    }

    // Spotify API error format: { error: { status: number, message: string } }
    if (isSpotifyErrorResponse(data)) {
      const errorType = this.mapHttpStatusToErrorType(response.status);
      throw new SpotifyApiError(
        errorType,
        data.error.status,
        data.error.message
      );
    }

    throw new SpotifyApiError(
      "SERVER_ERROR",
      response.status,
      "Unexpected error from API"
    );
  }

  /**
   * 將 HTTP status code 映射到錯誤類型
   */
  private mapHttpStatusToErrorType(
    status: number
  ):
    | "INVALID_TOKEN"
    | "RATE_LIMIT"
    | "NOT_FOUND"
    | "BAD_REQUEST"
    | "SERVER_ERROR" {
    switch (status) {
      case 401:
        return "INVALID_TOKEN";
      case 429:
        return "RATE_LIMIT";
      case 404:
        return "NOT_FOUND";
      case 400:
        return "BAD_REQUEST";
      default:
        return "SERVER_ERROR";
    }
  }
}

/**
 * Singleton instance of Spotify API Service
 *
 * Usage:
 *   import { spotifyApi } from '@/services/spotify-api'
 */
export const spotifyApi = new SpotifyApiService();
