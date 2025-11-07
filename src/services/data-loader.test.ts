import { checkDataIntegrity, loadTracksDatabase } from "@/services/data-loader";
import { generateMockTracksDatabase } from "@/types/data-schema";
import { beforeEach, describe, expect, it, vi } from "vitest";

// 使用 data-schema 提供的 mock generator
const mockTracksData = generateMockTracksDatabase(10);

/**
 * Data Loader Service 測試
 *
 * TDD - RED Phase: 先撰寫測試
 *
 * 測試範圍：
 * - loadTracksDatabase(): 載入並驗證 tracks.json
 * - checkDataIntegrity(): 檢查資料完整性
 */

describe("Data Loader Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadTracksDatabase()", () => {
    it("應該成功載入並驗證資料", async () => {
      // Arrange: Mock fetch 回應
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTracksData,
      } as Response);

      // Act
      const result = await loadTracksDatabase();

      // Assert
      expect(global.fetch).toHaveBeenCalledWith("/data/tracks.json");
      expect(result).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.generatedAt).toBeDefined();
      expect(result.tracks).toBeInstanceOf(Array);
      expect(result.tracks.length).toBeGreaterThan(0);
    });

    it("應該在 fetch 失敗時拋出錯誤", async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as Response);

      // Act & Assert
      await expect(loadTracksDatabase()).rejects.toThrow(
        "Failed to load tracks database",
      );
    });

    it("應該在資料驗證失敗時拋出錯誤", async () => {
      // Arrange: Mock 無效的資料
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: "data" }),
      } as Response);

      // Act & Assert
      await expect(loadTracksDatabase()).rejects.toThrow();
    });
  });

  describe("checkDataIntegrity()", () => {
    it("應該檢測重複的 track ID", () => {
      // Arrange: 建立有重複 ID 的資料
      const invalidData = {
        ...mockTracksData,
        totalTracks: 2,
        tracks: [
          mockTracksData.tracks[0],
          { ...mockTracksData.tracks[0] }, // 重複的 track
        ],
      };

      // Act
      const report = checkDataIntegrity(invalidData);

      // Assert
      expect(report.isValid).toBe(false);
      expect(report.issues.length).toBeGreaterThan(0);
      expect(
        report.issues.some((issue) => issue.type === "DUPLICATE_TRACK_ID"),
      ).toBe(true);
    });

    it("應該檢測 metadata 與實際資料不一致", () => {
      // Arrange: metadata totalTracks 與實際數量不符
      const invalidData = {
        ...mockTracksData,
        totalTracks: 999, // 錯誤的數量
      };

      // Act
      const report = checkDataIntegrity(invalidData);

      // Assert
      expect(report.isValid).toBe(false);
      expect(
        report.issues.some((issue) => issue.type === "METADATA_MISMATCH"),
      ).toBe(true);
    });

    it("應該在資料正確時回傳有效的報告", () => {
      // Act
      const report = checkDataIntegrity(mockTracksData);

      // Assert
      expect(report.isValid).toBe(true);
      expect(report.issues).toEqual([]);
      expect(report.totalTracks).toBe(mockTracksData.tracks.length);
    });
  });
});
