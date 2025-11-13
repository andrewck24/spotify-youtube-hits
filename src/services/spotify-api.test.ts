import { describe } from "vitest";

/**
 * Spotify API Service 測試
 *
 * Note: 認證和 token 管理現在完全由 Cloudflare Worker 處理
 * 前端只透過 Worker API endpoints 存取 Spotify 資料
 *
 * TODO: 新增 Worker API proxy 的整合測試
 * - getArtist() 透過 /api/spotify/artists/:id
 * - getTrack() 透過 /api/spotify/tracks/:id
 * - getAudioFeatures() 透過 /api/spotify/audio-features/:id (now using ReccoBeats)
 */

describe("SpotifyApiService", () => {
  // Note: initialize(), isTokenValid() 和 refreshToken() 方法已移除
  // 認證現在完全由 Cloudflare Worker 處理，前端不再管理 token
  //
  // 所有測試將在未來新增為整合測試
});
