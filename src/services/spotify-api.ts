import type {
  ISpotifyApiService,
  SpotifyArtist,
  SpotifyAudioFeatures,
  SpotifyToken,
  SpotifyTokenResponse,
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
 * - Client Credentials Flow 認證
 * - Token 自動管理（過期檢查、自動更新）
 * - 型別安全的 API 呼叫
 * - 完整的錯誤處理
 *
 * Usage:
 *   import { spotifyApi } from '@/services/spotify-api'
 *   await spotifyApi.initialize()
 *   const artist = await spotifyApi.getArtist('artistId')
 */

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

export class SpotifyApiService implements ISpotifyApiService {
  private token: SpotifyToken | null = null;

  /**
   * 初始化 Spotify API (取得 access token)
   * 使用 Client Credentials Flow
   */
  async initialize(): Promise<void> {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new SpotifyApiError(
        "BAD_REQUEST",
        400,
        "Missing Spotify API credentials. Please set VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET environment variables.",
      );
    }

    try {
      const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          if (isSpotifyErrorResponse(errorData)) {
            throw new SpotifyApiError(
              "INVALID_TOKEN",
              errorData.error.status,
              errorData.error.message,
            );
          }
        } catch (jsonError) {
          // 如果無法解析錯誤訊息，使用通用錯誤
          if (jsonError instanceof SpotifyApiError) {
            throw jsonError;
          }
        }
        throw new SpotifyApiError(
          "SERVER_ERROR",
          response.status,
          "Failed to authenticate with Spotify API",
        );
      }

      const data: SpotifyTokenResponse = await response.json();

      // 計算 token 過期時間（提前 5 分鐘過期，避免邊界情況）
      const expiresAt = Date.now() + (data.expires_in - 300) * 1000;

      this.token = {
        accessToken: data.access_token,
        tokenType: data.token_type,
        expiresAt,
      };
    } catch (error) {
      if (error instanceof SpotifyApiError) {
        throw error;
      }
      throw new SpotifyApiError(
        "NETWORK_ERROR",
        0,
        "Network error while authenticating with Spotify API",
        error,
      );
    }
  }

  /**
   * 檢查 token 是否有效
   */
  isTokenValid(): boolean {
    if (!this.token) {
      return false;
    }
    return Date.now() < this.token.expiresAt;
  }

  /**
   * 重新整理 token (當 token 即將過期時)
   */
  async refreshToken(): Promise<void> {
    await this.initialize();
  }

  /**
   * 取得藝人資訊
   */
  async getArtist(artistId: string): Promise<SpotifyArtist> {
    await this.ensureValidToken();
    if (!this.token) {
      throw new SpotifyApiError("INVALID_TOKEN", 401, "Token not available");
    }

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE_URL}/artists/${artistId}`,
        {
          headers: {
            Authorization: `Bearer ${this.token.accessToken}`,
          },
        },
      );

      await this.handleApiError(response);

      const data = await response.json();

      if (!isValidSpotifyArtist(data)) {
        throw new SpotifyApiError(
          "SERVER_ERROR",
          500,
          "Invalid artist data received from Spotify API",
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
        error,
      );
    }
  }

  /**
   * 取得歌曲詳細資訊
   */
  async getTrack(trackId: string, market?: string): Promise<SpotifyTrack> {
    await this.ensureValidToken();
    if (!this.token) {
      throw new SpotifyApiError("INVALID_TOKEN", 401, "Token not available");
    }

    try {
      const url = new URL(`${SPOTIFY_API_BASE_URL}/tracks/${trackId}`);
      if (market) {
        url.searchParams.append("market", market);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.token.accessToken}`,
        },
      });

      await this.handleApiError(response);

      const data = await response.json();

      if (!isValidSpotifyTrack(data)) {
        throw new SpotifyApiError(
          "SERVER_ERROR",
          500,
          "Invalid track data received from Spotify API",
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
        error,
      );
    }
  }

  /**
   * 取得歌曲音樂特徵
   */
  async getAudioFeatures(trackId: string): Promise<SpotifyAudioFeatures> {
    await this.ensureValidToken();
    if (!this.token) {
      throw new SpotifyApiError("INVALID_TOKEN", 401, "Token not available");
    }

    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE_URL}/audio-features/${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${this.token.accessToken}`,
          },
        },
      );

      await this.handleApiError(response);

      const data = await response.json();

      if (!isValidAudioFeatures(data)) {
        throw new SpotifyApiError(
          "SERVER_ERROR",
          500,
          "Invalid audio features data received from Spotify API",
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
        error,
      );
    }
  }

  /**
   * 批次取得音樂特徵 (最多 100 筆)
   */
  async getAudioFeaturesBatch(
    trackIds: string[],
  ): Promise<Map<string, SpotifyAudioFeatures>> {
    if (trackIds.length === 0) {
      return new Map();
    }

    if (trackIds.length > 100) {
      throw new SpotifyApiError(
        "BAD_REQUEST",
        400,
        "Maximum 100 track IDs allowed per batch request",
      );
    }

    await this.ensureValidToken();
    if (!this.token) {
      throw new SpotifyApiError("INVALID_TOKEN", 401, "Token not available");
    }

    try {
      const url = new URL(`${SPOTIFY_API_BASE_URL}/audio-features`);
      url.searchParams.append("ids", trackIds.join(","));

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.token.accessToken}`,
        },
      });

      await this.handleApiError(response);

      const data = await response.json();

      // Spotify API 回傳 { audio_features: [...] }
      const features = data.audio_features as (SpotifyAudioFeatures | null)[];

      const result = new Map<string, SpotifyAudioFeatures>();
      features.forEach((feature) => {
        if (feature && isValidAudioFeatures(feature)) {
          result.set(feature.id, feature);
        }
      });

      return result;
    } catch (error) {
      if (error instanceof SpotifyApiError) {
        throw error;
      }
      throw new SpotifyApiError(
        "NETWORK_ERROR",
        0,
        "Network error while fetching audio features batch",
        error,
      );
    }
  }

  /**
   * 確保 token 有效，若無效則自動更新
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.isTokenValid()) {
      await this.refreshToken();
    }
  }

  /**
   * 處理 API 錯誤回應
   */
  private async handleApiError(response: Response): Promise<void> {
    if (response.ok) {
      return;
    }

    const data = await response.json();

    if (isSpotifyErrorResponse(data)) {
      const errorType = this.mapHttpStatusToErrorType(response.status);
      throw new SpotifyApiError(
        errorType,
        data.error.status,
        data.error.message,
      );
    }

    throw new SpotifyApiError(
      "SERVER_ERROR",
      response.status,
      "Unexpected error from Spotify API",
    );
  }

  /**
   * 將 HTTP status code 映射到錯誤類型
   */
  private mapHttpStatusToErrorType(
    status: number,
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
