# API 與資料合約定義

**版本**: 1.0.0
**建立日期**: 2025-10-08
**目的**: 定義前端與外部 API、資料源之間的型別安全合約

## 概述

此目錄包含所有與外部系統互動的 TypeScript 型別定義與驗證規則。所有合約遵循「契約優先」原則，確保：

1. **型別安全**：所有 API 回應與資料格式有明確的 TypeScript 介面
2. **執行時驗證**：使用 Zod schema 進行資料驗證
3. **錯誤處理**：定義標準化的錯誤型別與處理流程
4. **可測試性**：提供 Type Guards 與 Mock 資料產生器

## 檔案結構

```text
contracts/
├── README.md                    # 本文件
├── spotify-api.ts               # Spotify Web API 合約
└── tracks-data-schema.ts        # 本地 JSON 資料 schema
```

## 合約文件說明

### 1. `spotify-api.ts`

定義與 Spotify Web API 互動的所有型別與介面。

#### 主要內容

- **認證**：Client Credentials Flow 的 request/response types
- **API 端點**：
  - `GET /artists/{id}` → `SpotifyArtist`
  - `GET /tracks/{id}` → `SpotifyTrack`
  - `GET /audio-features/{id}` → `SpotifyAudioFeatures`
- **錯誤處理**：`SpotifyApiError` 與 `SpotifyErrorResponse`
- **Service 介面**：`ISpotifyApiService` (所有 Spotify API service 必須實作)

#### 使用範例

```typescript
import {
  ISpotifyApiService,
  SpotifyArtist,
  SpotifyApiError,
  isValidSpotifyArtist,
} from "@/specs/001-1-typescript-tailwindcss/contracts/spotify-api"

// 實作 Spotify API Service
class SpotifyApiService implements ISpotifyApiService {
  async getArtist(artistId: string): Promise<SpotifyArtist> {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      }
    )

    if (!response.ok) {
      throw new SpotifyApiError("NOT_FOUND", 404, "Artist not found")
    }

    const data = await response.json()

    // 執行時驗證
    if (!isValidSpotifyArtist(data)) {
      throw new SpotifyApiError("BAD_REQUEST", 400, "Invalid artist data")
    }

    return data
  }
  // ... 其他方法實作
}
```

#### 型別覆蓋範圍

- ✅ Authentication (Client Credentials Flow)
- ✅ Artist Object (Full + Simplified)
- ✅ Track Object (Full)
- ✅ Album Object (Simplified)
- ✅ Audio Features Object
- ✅ Image Object
- ✅ Error Response
- ✅ Type Guards

### 2. `tracks-data-schema.ts`

定義本地資料庫 `public/data/tracks.json` 的資料結構與驗證規則。

#### 主要內容

- **資料模型**：
  - `LocalTrackData`：單一歌曲資料
  - `PopularityMetrics`：人氣指標（Spotify + YouTube）
  - `LocalTracksDatabase`：資料庫根結構（含 metadata 與索引）
- **Zod Schema**：執行時資料驗證
- **資料轉換**：Local → Redux State 的轉換函數
- **資料完整性檢查**：檢測重複 ID、metadata 不一致等問題
- **Mock 資料產生器**：用於測試

#### 使用範例

```typescript
import {
  validateTracksDatabase,
  safeValidateTracksDatabase,
  checkDataIntegrity,
  transformLocalTracksToState,
  generateMockTracksDatabase,
} from "@/specs/001-1-typescript-tailwindcss/contracts/tracks-data-schema"

// 1. 載入並驗證資料
async function loadTracksDatabase() {
  const response = await fetch("/data/tracks.json")
  const jsonData = await response.json()

  // 驗證資料格式（拋出錯誤）
  const database = validateTracksDatabase(jsonData)

  // 或使用安全驗證（不拋出錯誤）
  const result = safeValidateTracksDatabase(jsonData)
  if (!result.success) {
    console.error("資料驗證失敗：", result.error)
    return null
  }

  return result.data
}

// 2. 資料完整性檢查
const database = await loadTracksDatabase()
const integrityReport = checkDataIntegrity(database)

if (!integrityReport.isValid) {
  console.warn("發現資料完整性問題：", integrityReport.issues)
}

// 3. 轉換為 Redux State
const tracks = transformLocalTracksToState(database.tracks)
dispatch(setTracks(tracks))

// 4. 測試用 Mock 資料
const mockDatabase = generateMockTracksDatabase(100) // 產生 100 筆測試資料
```

#### Zod Schema 驗證範例

```typescript
import { localTrackDataSchema } from "@/specs/001-1-typescript-tailwindcss/contracts/tracks-data-schema"

// 驗證單一 Track
const result = localTrackDataSchema.safeParse({
  trackId: "abc123",
  trackName: "Feel Good Inc.",
  artistId: "xyz789",
  artistName: "Gorillaz",
  releaseYear: 2005,
  popularity: {
    spotifyPopularity: 85,
    youtubeViews: 500000000,
    youtubeLikes: 3000000,
    youtubeComments: 150000,
  },
  indicator: 1,
})

if (!result.success) {
  console.error("驗證失敗：", result.error.flatten())
}
```

#### 資料完整性檢查範例

```typescript
const report = checkDataIntegrity(database)

if (!report.isValid) {
  report.issues.forEach((issue) => {
    console.error(`[${issue.type}] ${issue.message}`)
  })
}

// 輸出範例：
// [DUPLICATE_TRACK_ID] 發現重複的 Track ID: abc123
// [METADATA_MISMATCH] totalTracks (1000) 與實際歌曲數量 (999) 不一致
```

## 型別匯入路徑

建議在 `tsconfig.json` 中設定路徑別名：

```json
{
  "compilerOptions": {
    "paths": {
      "@contracts/*": ["./specs/001-1-typescript-tailwindcss/contracts/*"]
    }
  }
}
```

使用範例：

```typescript
import type { SpotifyArtist, SpotifyTrack } from "@contracts/spotify-api"
import type { LocalTracksDatabase } from "@contracts/tracks-data-schema"
```

## 資料流程整合

```text
┌─────────────────────────────────────────────────────────────┐
│                       應用啟動流程                             │
└─────────────────────────────────────────────────────────────┘

1. 初始化 Spotify Token
   ↓ (spotify-api.ts - SpotifyTokenResponse)

2. 載入本地資料庫
   ↓ (tracks-data-schema.ts - LocalTracksDatabase)

3. 驗證資料格式
   ↓ (tracks-data-schema.ts - validateTracksDatabase)

4. 檢查資料完整性
   ↓ (tracks-data-schema.ts - checkDataIntegrity)

5. 轉換為 Redux State
   ↓ (tracks-data-schema.ts - transformLocalTracksToState)

6. 建立搜尋索引 (Fuse.js)
   ↓

7. App Ready

┌─────────────────────────────────────────────────────────────┐
│                    使用者互動流程                              │
└─────────────────────────────────────────────────────────────┘

1. 搜尋藝人
   ↓ (本地資料查詢)

2. 點擊藝人
   ↓ (spotify-api.ts - getArtist)

3. 顯示藝人資訊與歌曲清單
   ↓ (本地資料 + Spotify API)

4. 點擊歌曲
   ↓ (並行呼叫兩個 API)
   ├─ spotify-api.ts - getTrack (專輯資訊)
   └─ spotify-api.ts - getAudioFeatures (音樂特徵)

5. 顯示歌曲詳情與圖表
```

## 錯誤處理策略

### Spotify API 錯誤

```typescript
import { SpotifyApiError } from "@contracts/spotify-api"

try {
  const artist = await spotifyApi.getArtist(artistId)
} catch (error) {
  if (error instanceof SpotifyApiError) {
    switch (error.type) {
      case "INVALID_TOKEN":
        // 重新整理 token
        await spotifyApi.refreshToken()
        break
      case "RATE_LIMIT":
        // 顯示「伺服器忙碌中」訊息
        showErrorToast("伺服器忙碌中，請稍後再試")
        break
      case "NOT_FOUND":
        // 顯示「查無此藝人」訊息
        showErrorToast("查無相關藝人")
        break
      default:
        // 其他錯誤
        showErrorToast("載入失敗，請重試")
    }
  }
}
```

### 本地資料驗證錯誤

```typescript
import { safeValidateTracksDatabase } from "@contracts/tracks-data-schema"

const result = safeValidateTracksDatabase(jsonData)

if (!result.success) {
  // Zod error 包含詳細的錯誤資訊
  const errors = result.error.flatten()
  console.error("資料驗證失敗：", errors)

  // 顯示使用者友善訊息
  showErrorDialog({
    title: "資料載入失敗",
    message: "資料格式不正確，請聯繫管理員",
    details: errors.formErrors.join("\n"),
  })
}
```

## 測試建議

### 單元測試範例

```typescript
import { describe, it, expect } from "vitest"
import {
  generateMockTracksDatabase,
  checkDataIntegrity,
  validateTracksDatabase,
} from "@contracts/tracks-data-schema"

describe("tracks-data-schema", () => {
  it("should generate valid mock database", () => {
    const mockDb = generateMockTracksDatabase(100)
    expect(() => validateTracksDatabase(mockDb)).not.toThrow()
  })

  it("should detect duplicate track IDs", () => {
    const invalidDb = {
      version: "2023.1",
      generatedAt: new Date().toISOString(),
      totalTracks: 2,
      tracks: [
        {
          trackId: "duplicate-id",
          trackName: "Track 1",
          artistId: "artist-1",
          artistName: "Artist 1",
          releaseYear: 2020,
          popularity: {
            spotifyPopularity: 80,
            youtubeViews: 1000000,
            youtubeLikes: 50000,
            youtubeComments: 5000,
          },
          indicator: 0,
        },
        {
          trackId: "duplicate-id", // 重複 ID
          trackName: "Track 2",
          artistId: "artist-2",
          artistName: "Artist 2",
          releaseYear: 2021,
          popularity: {
            spotifyPopularity: 70,
            youtubeViews: 500000,
            youtubeLikes: 25000,
            youtubeComments: 2500,
          },
          indicator: 1,
        },
      ],
    }

    const report = checkDataIntegrity(invalidDb as any)
    expect(report.isValid).toBe(false)
    expect(report.issues).toHaveLength(1)
    expect(report.issues[0].type).toBe("DUPLICATE_TRACK_ID")
  })
})
```

### 整合測試範例

```typescript
import { describe, it, expect, beforeAll } from "vitest"
import { SpotifyApiService } from "@/services/spotify-api"
import { loadTracksDatabase } from "@/services/data-loader"

describe("Spotify API Integration", () => {
  let spotifyApi: SpotifyApiService

  beforeAll(async () => {
    spotifyApi = new SpotifyApiService()
    await spotifyApi.initialize()
  })

  it("should fetch artist details", async () => {
    const database = await loadTracksDatabase()
    const firstTrack = database.tracks[0]

    const artist = await spotifyApi.getArtist(firstTrack.artistId)

    expect(artist.id).toBe(firstTrack.artistId)
    expect(artist.name).toBe(firstTrack.artistName)
    expect(artist.type).toBe("artist")
  })
})
```

## 版本管理

### 資料版本格式

本地資料庫使用 `YYYY.N` 格式標記版本：

- `2023.1`：2023 年第 1 版
- `2024.1`：2024 年第 1 版
- `2024.2`：2024 年第 2 版（更新）

### 版本相容性檢查

```typescript
const MIN_SUPPORTED_VERSION = "2023.1"

function isVersionSupported(version: string): boolean {
  const [year, revision] = version.split(".").map(Number)
  const [minYear, minRevision] = MIN_SUPPORTED_VERSION.split(".").map(Number)

  if (year < minYear) return false
  if (year === minYear && revision < minRevision) return false

  return true
}

// 使用範例
const database = await loadTracksDatabase()
if (!isVersionSupported(database.version)) {
  showWarningDialog("資料版本過舊，部分功能可能無法正常運作")
}
```

## 變更日誌

### v1.0.0 (2025-10-08)

- ✨ 初始版本
- ✅ 建立 Spotify API 合約 (`spotify-api.ts`)
- ✅ 建立本地資料 schema (`tracks-data-schema.ts`)
- ✅ 新增 Zod 驗證規則
- ✅ 新增資料完整性檢查
- ✅ 新增 Mock 資料產生器

## 後續計畫

- [ ] 新增 `GET /albums/{id}` 支援（若需要完整專輯資訊）
- [ ] 新增批次 API 呼叫支援 (`GET /tracks?ids=...`)
- [ ] 新增資料版本自動遷移腳本
- [ ] 新增 JSON Schema 匯出（用於文件生成）
