# Phase 1: 資料模型設計

**Feature**: 技術棧現代化重構
**Date**: 2025-10-08
**Prerequisites**: spec.md, research.md

## 概述

本文件定義應用程式的核心資料模型、TypeScript 型別定義、狀態管理結構與資料流程。所有型別遵循 TypeScript 5.x 嚴格模式，確保型別安全。

---

## 核心實體 (Core Entities)

### 1. Track (歌曲)

歌曲是應用程式的核心資料實體，包含來自本地資料庫與 Spotify API 的完整資訊。

**TypeScript 定義**:

```typescript
// src/types/track.ts

/**
 * 歌曲完整資料模型
 * 結合本地資料庫 (tracks.json) 與 Spotify API 即時資料
 */
export interface Track {
  // === 基本資訊 (來自本地資料庫) ===
  trackId: string; // Spotify Track ID (e.g., "0d28khcov6AiegSCpG5TuT")
  trackName: string; // 歌曲名稱 (e.g., "Feel Good Inc.")
  artistId: string; // Spotify Artist ID
  artistName: string; // 藝人名稱
  releaseYear: number; // 發行年份 (e.g., 2005)

  // === 人氣指標 (來自本地資料庫 - 2023年快照) ===
  popularity: PopularityMetrics;

  // === 音樂特徵 (來自 Spotify API - 即時查詢) ===
  features?: AudioFeatures; // Optional: 點擊歌曲後才載入

  // === 專輯資訊 (來自 Spotify API - 即時查詢) ===
  album?: AlbumInfo; // Optional: 點擊歌曲後才載入

  // === UI 狀態 ===
  indicator: 0 | 1; // 歌曲熱門度指標 (0=普通, 1=熱門)
}

/**
 * 人氣指標 (來自 YouTube + Spotify)
 */
export interface PopularityMetrics {
  playCount: number; // Spotify 播放數
  youtubeViews: number; // YouTube 觀看數
  youtubeLikes: number; // YouTube 按讚數
  youtubeComments: number; // YouTube 留言數
}

/**
 * Spotify 音樂特徵 (Audio Features)
 * 文件: https://developer.spotify.com/documentation/web-api/reference/get-audio-features
 */
export interface AudioFeatures {
  // === 音樂特性 (0-1 數值) ===
  acousticness: number; // 聲學程度 (0=電子, 1=聲學)
  danceability: number; // 適合跳舞程度
  energy: number; // 能量 (速度、響度)
  instrumentalness: number; // 器樂程度 (無人聲)
  liveness: number; // 現場錄音可能性
  speechiness: number; // 語音內容比例
  valence: number; // 音樂正向度 (快樂度)

  // === 音樂屬性 ===
  key: number; // 音調 (0=C, 1=C#, ..., 11=B)
  mode: 0 | 1; // 調式 (0=小調, 1=大調)
  loudness: number; // 響度 (dB, 通常 -60 到 0)
  tempo: number; // 速度 (BPM)
  timeSignature: number; // 拍號 (e.g., 4 表示 4/4 拍)
}

/**
 * 專輯資訊 (來自 Spotify API)
 */
export interface AlbumInfo {
  name: string; // 專輯名稱
  releaseDate: string; // 發行日期 (YYYY-MM-DD)
  imageUrl: string; // 專輯封面 URL (640x640)
  spotifyUrl: string; // Spotify 專輯連結
}
```

**資料來源**:

| 欄位                                                                          | 資料來源                             | 時機           | 快取策略               |
| ----------------------------------------------------------------------------- | ------------------------------------ | -------------- | ---------------------- |
| `trackId`, `trackName`, `artistId`, `artistName`, `releaseYear`, `popularity` | 本地 JSON (tracks.json)              | 應用啟動時載入 | sessionStorage + Redux |
| `features`                                                                    | Spotify API (`/audio-features/{id}`) | 點擊歌曲時查詢 | Redux state (不持久化) |
| `album`                                                                       | Spotify API (`/tracks/{id}`)         | 點擊歌曲時查詢 | Redux state (不持久化) |

**範例資料**:

```json
{
  "trackId": "0d28khcov6AiegSCpG5TuT",
  "trackName": "Feel Good Inc.",
  "artistId": "3AA28KZvwAUcZuOKwyblJQ",
  "artistName": "Gorillaz",
  "releaseYear": 2005,
  "popularity": {
    "playCount": 1099787791,
    "youtubeViews": 731179688,
    "youtubeLikes": 6492486,
    "youtubeComments": 172321
  },
  "indicator": 1
}
```

---

### 2. Artist (藝人)

藝人資料結合本地資料庫的基本資訊與 Spotify API 的即時資料。

**TypeScript 定義**:

```typescript
// src/types/artist.ts
import type { Track } from "./track";

/**
 * 藝人完整資料模型
 */
export interface Artist {
  // === 基本資訊 ===
  id: string; // Spotify Artist ID
  name: string; // 藝人名稱

  // === Spotify 即時資料 ===
  imageUrl: string; // 藝人頭像 (來自 Spotify API, 640x640)
  spotifyUrl: string; // Spotify 藝人頁面連結
  followers: number; // Spotify 追蹤人數
  popularity: number; // Spotify 人氣指標 (0-100)

  // === 關聯歌曲 (來自本地資料庫) ===
  tracks: Track[]; // 該藝人的所有歌曲清單

  // === 計算欄位 ===
  totalPlayCount: number; // 所有歌曲總播放數
  avgPopularity: number; // 平均人氣 (依 Spotify playCount 計算)
}

/**
 * 藝人簡要資訊 (用於搜尋結果)
 */
export interface ArtistSummary {
  id: string;
  name: string;
  trackCount: number; // 資料庫中該藝人的歌曲數量
  imageUrl?: string; // Optional: 可能尚未載入
}
```

**資料來源**:

| 欄位                                                | 資料來源                                  | 時機           | 快取策略    |
| --------------------------------------------------- | ----------------------------------------- | -------------- | ----------- |
| `id`, `name`                                        | 本地 JSON (從 tracks.json 聚合)           | 應用啟動時計算 | Redux state |
| `imageUrl`, `spotifyUrl`, `followers`, `popularity` | Spotify API (`/artists/{id}`)             | 點擊藝人時查詢 | Redux state |
| `tracks`                                            | 本地 JSON (篩選 `artistId` 相符的 tracks) | 點擊藝人時篩選 | Redux state |

---

### 3. SearchIndex (搜尋索引)

Fuse.js 搜尋引擎使用的索引資料結構。

**TypeScript 定義**:

```typescript
// src/types/search.ts
import type { Track } from "./track";

/**
 * 搜尋索引項目 (用於 Fuse.js)
 */
export interface SearchIndexItem {
  artistId: string; // 藝人 ID
  artistName: string; // 藝人名稱 (搜尋主要欄位)
  trackIds: string[]; // 該藝人的所有歌曲 ID
  trackCount: number; // 歌曲數量
}

/**
 * 搜尋結果 (Fuse.js 回傳格式)
 */
export interface SearchResult {
  item: SearchIndexItem; // 匹配的索引項目
  score?: number; // 匹配分數 (0=完美匹配, 1=最差匹配)
  refIndex: number; // 索引位置
}

/**
 * 搜尋查詢參數
 */
export interface SearchQuery {
  query: string; // 搜尋關鍵字
  limit?: number; // 結果數量限制 (預設 12)
}
```

---

## Redux State 結構

應用程式使用 Redux Toolkit 管理全域狀態，按功能模組分割為獨立 slices。

### 1. Artist Slice

**狀態結構**:

```typescript
// src/features/artist/artist-slice.ts
import type { Artist } from "@/types/artist";

export interface ArtistState {
  // === 當前選擇的藝人 ===
  current: Artist | null;

  // === 載入狀態 ===
  loading: boolean;
  error: string | null;

  // === 快取 (已查詢過的藝人) ===
  cache: Record<string, Artist>; // Key: artistId, Value: Artist data
}

const initialState: ArtistState = {
  current: null,
  loading: false,
  error: null,
  cache: {},
};
```

**Actions**:

```typescript
// Reducers
export const artistSlice = createSlice({
  name: "artist",
  initialState,
  reducers: {
    setCurrentArtist: (state, action: PayloadAction<Artist>) => {
      state.current = action.payload;
      state.cache[action.payload.id] = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});
```

**Async Thunks**:

```typescript
// src/features/artist/artist-thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchSpotifyArtist } from "@/services/spotify-api";
import type { RootState } from "@/app/store";

/**
 * 載入藝人資料 (含 Spotify API 查詢)
 */
export const loadArtist = createAsyncThunk(
  "artist/load",
  async (artistId: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.spotify.accessToken;

    // 1. 從本地資料篩選該藝人的所有歌曲
    const tracks = state.data.tracks.filter((t) => t.artistId === artistId);

    // 2. 查詢 Spotify API 獲取藝人詳細資訊
    const spotifyData = await fetchSpotifyArtist(artistId, token);

    // 3. 組合完整藝人資料
    return {
      id: artistId,
      name: tracks[0]?.artistName ?? "",
      tracks,
      ...spotifyData,
    };
  }
);
```

---

### 2. Track Slice

**狀態結構**:

```typescript
// src/features/track/track-slice.ts
import type { Track, AudioFeatures, AlbumInfo } from "@/types/track";

export interface TrackState {
  // === 當前選擇的歌曲 ===
  currentTrackId: string | null;

  // === 歌曲詳細資料 (來自 Spotify API) ===
  features: Record<string, AudioFeatures>; // Key: trackId
  albums: Record<string, AlbumInfo>; // Key: trackId

  // === 載入狀態 ===
  loadingFeatures: boolean;
  loadingAlbum: boolean;
  error: string | null;
}

const initialState: TrackState = {
  currentTrackId: null,
  features: {},
  albums: {},
  loadingFeatures: false,
  loadingAlbum: false,
  error: null,
};
```

---

### 3. Search Slice

**狀態結構**:

```typescript
// src/features/search/search-slice.ts
import type { SearchIndexItem } from "@/types/search";
import type Fuse from "fuse.js";

export interface SearchState {
  // === 搜尋引擎實例 ===
  fuseInstance: Fuse<SearchIndexItem> | null;

  // === 搜尋結果 ===
  query: string;
  results: SearchIndexItem[];

  // === UI 狀態 ===
  isFocused: boolean; // 搜尋列是否 focus
  isLoading: boolean; // 搜尋進行中
}

const initialState: SearchState = {
  fuseInstance: null,
  query: "",
  results: [],
  isFocused: false,
  isLoading: false,
};
```

---

### 4. Data Slice (本地資料庫)

**狀態結構**:

```typescript
// src/features/data/data-slice.ts
import type { Track } from "@/types/track";

export interface DataState {
  // === 本地資料庫 ===
  tracks: Track[]; // 完整歌曲清單 (來自 tracks.json)

  // === 載入狀態 ===
  loaded: boolean;
  loading: boolean;
  progress: number; // 0-100
  error: string | null;

  // === 快取資訊 ===
  cacheVersion: string; // 資料版本 (用於判斷是否需要更新)
  lastUpdated: number; // 最後更新時間 (timestamp)
}

const initialState: DataState = {
  tracks: [],
  loaded: false,
  loading: false,
  progress: 0,
  error: null,
  cacheVersion: "v1",
  lastUpdated: 0,
};
```

---

### 5. Spotify Slice (Spotify API Token)

**狀態結構**:

```typescript
// src/features/spotify/spotify-slice.ts

export interface SpotifyState {
  // === API Token ===
  accessToken: string | null;
  tokenExpiry: number | null; // Token 過期時間 (timestamp)

  // === 載入狀態 ===
  loading: boolean;
  error: string | null;
}

const initialState: SpotifyState = {
  accessToken: null,
  tokenExpiry: null,
  loading: false,
  error: null,
};
```

---

## 完整 Redux Store 結構

```typescript
// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import artistReducer from "@/features/artist/artist-slice";
import trackReducer from "@/features/track/track-slice";
import searchReducer from "@/features/search/search-slice";
import dataReducer from "@/features/data/data-slice";
import spotifyReducer from "@/features/spotify/spotify-slice";

export const store = configureStore({
  reducer: {
    artist: artistReducer,
    track: trackReducer,
    search: searchReducer,
    data: dataReducer,
    spotify: spotifyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略 Fuse.js 實例（不可序列化）
        ignoredActions: ["search/setFuseInstance"],
        ignoredPaths: ["search.fuseInstance"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**State 樹結構視覺化**:

```plaintext
RootState
├── artist
│   ├── current: Artist | null
│   ├── loading: boolean
│   ├── error: string | null
│   └── cache: Record<string, Artist>
│
├── track
│   ├── currentTrackId: string | null
│   ├── features: Record<string, AudioFeatures>
│   ├── albums: Record<string, AlbumInfo>
│   ├── loadingFeatures: boolean
│   ├── loadingAlbum: boolean
│   └── error: string | null
│
├── search
│   ├── fuseInstance: Fuse<SearchIndexItem> | null
│   ├── query: string
│   ├── results: SearchIndexItem[]
│   ├── isFocused: boolean
│   └── isLoading: boolean
│
├── data
│   ├── tracks: Track[]
│   ├── loaded: boolean
│   ├── loading: boolean
│   ├── progress: number
│   ├── error: string | null
│   ├── cacheVersion: string
│   └── lastUpdated: number
│
└── spotify
    ├── accessToken: string | null
    ├── tokenExpiry: number | null
    ├── loading: boolean
    └── error: string | null
```

---

## 資料流程 (Data Flow)

### 1. 應用啟動流程

```plaintext
1. App Mount
   ↓
2. 初始化 Spotify Token
   dispatch(fetchSpotifyToken())
   ↓
3. 載入本地資料庫
   dispatch(loadTracksData())
   ├─→ 檢查 sessionStorage 快取
   ├─→ 若有快取：直接載入
   └─→ 若無快取：下載 tracks.json + 存入 sessionStorage
   ↓
4. 建立搜尋索引
   dispatch(buildSearchIndex())
   ├─→ 聚合藝人資料 (groupBy artistId)
   └─→ 初始化 Fuse.js 實例
   ↓
5. 載入預設藝人
   dispatch(loadArtist('default-artist-id'))
   ↓
6. App Ready (顯示主介面)
```

### 2. 搜尋藝人流程

```plaintext
1. 使用者輸入搜尋關鍵字
   onChange(event)
   ↓
2. 更新搜尋狀態
   dispatch(setSearchQuery(query))
   ↓
3. 執行模糊搜尋
   fuseInstance.search(query, { limit: 12 })
   ↓
4. 更新搜尋結果
   dispatch(setSearchResults(results))
   ↓
5. 渲染搜尋結果清單
```

### 3. 點擊藝人流程

```plaintext
1. 使用者點擊搜尋結果中的藝人
   onClick(artistId)
   ↓
2. 檢查 Artist 快取
   state.artist.cache[artistId]
   ├─→ 若有快取：直接使用
   └─→ 若無快取：執行以下步驟
   ↓
3. 篩選本地歌曲
   tracks = state.data.tracks.filter(t => t.artistId === artistId)
   ↓
4. 查詢 Spotify API
   artistData = await fetchSpotifyArtist(artistId, token)
   ↓
5. 組合完整資料
   artist = { ...artistData, tracks }
   ↓
6. 更新 Redux State
   dispatch(setCurrentArtist(artist))
   ↓
7. 渲染藝人資訊與歌曲清單
```

### 4. 點擊歌曲流程

```plaintext
1. 使用者點擊歌曲清單中的歌曲
   onClick(trackId)
   ↓
2. 更新當前歌曲 ID
   dispatch(setCurrentTrackId(trackId))
   ↓
3. 檢查 Features/Album 快取
   state.track.features[trackId]
   state.track.albums[trackId]
   ├─→ 若有快取：直接使用
   └─→ 若無快取：並行查詢 Spotify API
   ↓
4. 並行查詢 Spotify API
   Promise.all([
     fetchTrackFeatures(trackId, token),
     fetchTrackInfo(trackId, token),
   ])
   ↓
5. 更新 Redux State
   dispatch(setTrackFeatures(features))
   dispatch(setTrackAlbum(album))
   ↓
6. 渲染歌曲詳細資訊與圖表
```

---

## 驗證規則 (Validation)

### 1. Track 驗證

```typescript
// src/lib/validators.ts
import { z } from "zod";

export const TrackSchema = z.object({
  trackId: z.string().min(1),
  trackName: z.string().min(1),
  artistId: z.string().min(1),
  artistName: z.string().min(1),
  releaseYear: z.number().int().min(1900).max(2100),
  popularity: z.object({
    playCount: z.number().min(0),
    youtubeViews: z.number().min(0),
    youtubeLikes: z.number().min(0),
    youtubeComments: z.number().min(0),
  }),
  indicator: z.union([z.literal(0), z.literal(1)]),
});

export type ValidatedTrack = z.infer<typeof TrackSchema>;
```

### 2. 資料完整性檢查

```typescript
// src/services/data-validator.ts

/**
 * 驗證載入的資料庫是否完整
 */
export function validateTracksData(tracks: unknown[]): Track[] {
  const validated: Track[] = [];
  const errors: string[] = [];

  tracks.forEach((track, index) => {
    try {
      validated.push(TrackSchema.parse(track));
    } catch (error) {
      errors.push(`Track ${index}: ${error.message}`);
    }
  });

  if (errors.length > 0) {
    console.warn(
      `Data validation warnings: ${errors.length} tracks failed`,
      errors
    );
  }

  return validated;
}
```

---

## 效能優化

### 1. Reselect Memoization

使用 Reselect 避免不必要的重新計算。

```typescript
// src/features/artist/artist-selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

export const selectCurrentArtist = (state: RootState) => state.artist.current;

export const selectCurrentArtistTracks = createSelector(
  [selectCurrentArtist],
  (artist) => artist?.tracks ?? []
);

export const selectCurrentArtistTopTracks = createSelector(
  [selectCurrentArtistTracks],
  (tracks) =>
    tracks
      .sort((a, b) => b.popularity.playCount - a.popularity.playCount)
      .slice(0, 10)
);
```

### 2. 分頁與虛擬滾動

若未來需要顯示完整歌曲清單（> 100 首），使用虛擬滾動優化。

```typescript
// 預留介面 (Phase 2 實作)
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}
```

---

## 總結

資料模型設計完成：

- ✅ **型別安全**: 使用 TypeScript 5.x 嚴格模式，所有實體完整型別定義
- ✅ **關注點分離**: Redux slices 按功能模組劃分（artist, track, search, data, spotify）
- ✅ **快取策略**: 多層快取（sessionStorage → Redux → API）
- ✅ **效能優化**: Reselect memoization、懶載入、分頁預留
- ✅ **可測試性**: Pure reducers、獨立 selectors、可 mock 的 async thunks

下一步：建立 API 合約定義 (contracts/)
