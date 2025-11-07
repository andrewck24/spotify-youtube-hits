import { SpotifyApiService } from "@/services/spotify-api";
import { SpotifyApiError } from "@/types/spotify";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Spotify API Service 測試
 *
 * TDD - RED Phase: 先撰寫測試（應該失敗）
 *
 * 測試範圍：
 * - initialize(): 取得 access token (Client Credentials Flow)
 * - isTokenValid(): 驗證 token 有效性
 * - refreshToken(): 重新整理過期 token
 */

describe("SpotifyApiService", () => {
  let service: SpotifyApiService;

  beforeEach(() => {
    // 清除所有 mock
    vi.clearAllMocks();
    // 建立新的 service instance
    service = new SpotifyApiService();
    // Mock 環境變數
    vi.stubEnv("VITE_SPOTIFY_CLIENT_ID", "test_client_id");
    vi.stubEnv("VITE_SPOTIFY_CLIENT_SECRET", "test_client_secret");
  });

  describe("initialize()", () => {
    it("應該成功取得 access token", async () => {
      // Arrange: Mock fetch 回應
      const mockTokenResponse = {
        access_token: "mock_access_token",
        token_type: "Bearer",
        expires_in: 3600,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      // Act: 初始化 service
      await service.initialize();

      // Assert: 驗證 fetch 被正確呼叫
      expect(global.fetch).toHaveBeenCalledWith(
        "https://accounts.spotify.com/api/token",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/x-www-form-urlencoded",
          }),
        }),
      );

      // Assert: 驗證 token 已設定且有效
      expect(service.isTokenValid()).toBe(true);
    });

    it("應該在認證失敗時拋出 SpotifyApiError", async () => {
      // Arrange: Mock 認證失敗的回應
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            status: 401,
            message: "Invalid client credentials",
          },
        }),
      } as Response);

      // Act & Assert: 驗證拋出正確的錯誤
      try {
        await service.initialize();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(SpotifyApiError);
        expect((error as SpotifyApiError).message).toBe(
          "Invalid client credentials",
        );
      }
    });

    it("應該在網路錯誤時拋出 NETWORK_ERROR", async () => {
      // Arrange: Mock 網路錯誤
      global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

      // Act & Assert
      await expect(service.initialize()).rejects.toThrow(SpotifyApiError);
    });
  });

  describe("isTokenValid()", () => {
    it("應該在 token 尚未初始化時回傳 false", () => {
      // Arrange: service 剛建立，token 尚未設定

      // Act & Assert
      expect(service.isTokenValid()).toBe(false);
    });

    it("應該在 token 已過期時回傳 false", async () => {
      // Arrange: Mock 一個已過期的 token
      const mockTokenResponse = {
        access_token: "expired_token",
        token_type: "Bearer",
        expires_in: -1, // 已過期
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      await service.initialize();

      // Act: 等待一小段時間確保過期
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Assert
      expect(service.isTokenValid()).toBe(false);
    });

    it("應該在 token 仍有效時回傳 true", async () => {
      // Arrange
      const mockTokenResponse = {
        access_token: "valid_token",
        token_type: "Bearer",
        expires_in: 3600,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      await service.initialize();

      // Act & Assert
      expect(service.isTokenValid()).toBe(true);
    });
  });

  describe("refreshToken()", () => {
    it("應該成功更新過期的 token", async () => {
      // Arrange: 先初始化一個 token
      const initialTokenResponse = {
        access_token: "initial_token",
        token_type: "Bearer",
        expires_in: 1,
      };

      const refreshedTokenResponse = {
        access_token: "refreshed_token",
        token_type: "Bearer",
        expires_in: 3600,
      };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => initialTokenResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => refreshedTokenResponse,
        } as Response);

      await service.initialize();

      // 等待 token 過期
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Act: 重新整理 token
      await service.refreshToken();

      // Assert: token 應該再次有效
      expect(service.isTokenValid()).toBe(true);
    });

    it("應該在 refresh 失敗時拋出錯誤", async () => {
      // Arrange: Mock refresh 失敗的回應
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            status: 401,
            message: "Invalid client credentials",
          },
        }),
      } as Response);

      // Act & Assert
      await expect(service.refreshToken()).rejects.toThrow(SpotifyApiError);
    });
  });
});
