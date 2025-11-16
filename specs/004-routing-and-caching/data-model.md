# Data Model: 瀏覽器導航與資料快取

**Date**: 2025-11-14
**Related**: [plan.md](./plan.md), [research.md](./research.md), [spec.md](./spec.md)

## 概述

本功能的核心架構決策是 **URL 作為 Single Source of Truth** 和 **RTK Query 自動快取管理**。因此，大部分「狀態」實際上不存在於 Redux store 中，而是由瀏覽器和 RTK Query 自動管理。

## 狀態架構

### 1. URL 狀態（瀏覽器管理）

**來源**: 瀏覽器 URL
**管理方式**: react-router-dom hooks
**生命週期**: 隨瀏覽器歷史記錄

#### Route Parameters

```typescript
// /artist/:artistId
interface ArtistPageParams {
  artistId: string; // Spotify Artist ID
}

// /track/:trackId
interface TrackPageParams {
  trackId: string; // Spotify Track ID
  // 注意：不需要 artistId，因為 Spotify track API 回應已包含完整 artist 資訊
}
```

**存取方式**:

```typescript
import { useParams } from "react-router";

const { artistId } = useParams(); // 響應式，URL 變更自動觸發 re-render
```

#### Search Parameters

```typescript
// /search?q=keyword
interface SearchParams {
  q?: string; // 搜尋關鍵字
}
```

**存取與更新**:

```typescript
import { useSearchParams } from "react-router";

const [searchParams, setSearchParams] = useSearchParams();
const query = searchParams.get("q") || "";

// 更新搜尋，使用 replace: true 避免污染歷史
setSearchParams({ q: newQuery }, { replace: true });
```

---

### 2. API 快取狀態（RTK Query 管理）

**來源**: RTK Query automatic caching
**管理方式**: `@reduxjs/toolkit/query`
**生命週期**: 記憶體內，60 秒 TTL（預設）

#### RTK Query API Slice

```typescript
// features/api/spotify-api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const spotifyApi = createApi({
  reducerPath: "spotifyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "/api/spotify",
  }),
  tagTypes: ["Artist", "Track", "AudioFeatures"],
  endpoints: (build) => ({
    getArtist: build.query<SpotifyArtist, string>({
      /* ... */
    }),
    getTrack: build.query<SpotifyTrack, string>({
      /* ... */
    }),
    getAudioFeatures: build.query<SpotifyAudioFeatures, string>({
      /* ... */
    }),
  }),
});
```

#### 自動生成的 Hooks

```typescript
// 使用範例
const {
  data: artist,
  isLoading,
  error,
} = useGetArtistQuery(
  artistId,
  { skip: !artistId }, // 防止無效請求
);
```

**快取 Key 結構** (RTK Query 自動管理):

```typescript
{
  spotifyApi: {
    queries: {
      'getArtist("3AA28KZvwAUcZuOKwyblJQ")': {
        status: 'fulfilled',
        data: { /* SpotifyArtist */ },
        startedTimeStamp: 1699999999,
        fulfilledTimeStamp: 1700000000,
      },
      'getTrack("0d28khcov6AiegSCpG5TuT")': { /* ... */ },
      'getAudioFeatures("0d28khcov6AiegSCpG5TuT")': { /* ... */ },
    },
  },
}
```

---

### 3. 本地資料載入（React Router Loader）

**來源**: React Router v7 loader API
**管理方式**: `react-router-dom` loaders
**生命週期**: 頁面導航前載入，透過 useRouteLoaderData 存取

#### tracks-loader (新增)

**用途**: 在所有路由渲染前載入本地 tracks.json 資料

**檔案位置**: `src/loaders/tracks-loader.ts`

```typescript
// loaders/tracks-loader.ts
import type { LocalTracksDatabase } from "@/types/data-schema";

export async function tracksLoader() {
  // 1. 檢查 sessionStorage 快取
  const cachedData = sessionStorage.getItem(STORAGE_KEY);
  if (cachedData) {
    return { tracks: JSON.parse(cachedData) };
  }

  // 2. 載入遠端資料
  const response = await fetch("/data/tracks.json");
  const rawData = await response.json();

  // 3. Zod schema 驗證
  const validatedData = localTracksDatabaseSchema.parse(rawData);

  // 4. 儲存至 sessionStorage
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(validatedData));

  return { tracks: validatedData };
}
```

**使用方式**:

```tsx
// 在 router.tsx 中配置
{
  path: "/",
  loader: tracksLoader, // 根路由載入資料
  element: <Outlet />,  // 子路由共享資料
  children: [...]
}

// 在頁面元件中存取
import { useRouteLoaderData } from "react-router-dom";
import type { tracksLoader } from "@/loaders/tracks-loader";

const { tracks: tracksDatabase } = useRouteLoaderData("root") as Awaited<
  ReturnType<typeof tracksLoader>
>;
```

**優勢**:

- ✅ 資料在頁面渲染前載入完成（無 loading 狀態）
- ✅ React Router 自動處理重複請求去除
- ✅ sessionStorage 快取確保單次載入
- ✅ 子路由自動繼承資料（透過 Outlet）
- ✅ TypeScript 類型安全（透過 typeof loader）

---

### 4. Redux 應用狀態

**來源**: Redux slices
**管理方式**: `@reduxjs/toolkit`
**生命週期**: 應用程式執行期間

**Note**: 本專案已移除所有 Redux slices（data, artist, track, search），僅保留 RTK Query API cache

#### 歷史記錄：已移除的 Slices

##### data-slice (已移除，改用 React Router loader)

**重構前**:

```typescript
interface DataState {
  tracks: LocalTrackData[]; // 本地歌曲資料
  version: string; // 資料版本
  loaded: boolean; // 是否已載入
  loading: boolean; // 載入中
  error: string | null; // 錯誤訊息
}
```

**移除原因**: React Router loader 提供更好的資料載入體驗，資料在頁面渲染前完成載入

##### search-slice (已移除)

**重構前**:

```typescript
interface SearchState {
  query: string; // ❌ 移除：改用 URL searchParams
  results: SearchResult[]; // ❌ 移除：改用純函數計算
  fuseInstance: Fuse | null; // ✅ 保留
  loading: boolean; // ❌ 移除
}
```

**移除原因**: query 改用 URL searchParams，results 改用 useMemo 純函數計算，fuseInstance 在元件內建立

##### artist-slice (已移除)

**移除原因**: URL params + RTK Query 完全取代

```typescript
// ❌ 移除前
interface ArtistState {
  currentArtist: SpotifyArtist | null; // 改用 URL + RTK Query
  loading: boolean; // RTK Query 自動管理
  error: string | null; // RTK Query 自動管理
}

// ✅ 移除後：使用 useParams + useGetArtistQuery
const { artistId } = useParams();
const { data: artist, isLoading, error } = useGetArtistQuery(artistId!);
```

##### track-slice (已移除)

**移除原因**: URL params + RTK Query 完全取代

```typescript
// ❌ 移除前
interface TrackState {
  currentTrack: SpotifyTrack | null; // 改用 URL + RTK Query
  audioFeatures: SpotifyAudioFeatures | null; // 改用 RTK Query
  loading: boolean; // RTK Query 自動管理
  error: string | null; // RTK Query 自動管理
}

// ✅ 移除後：使用 useParams + RTK Query
const { trackId } = useParams();
const { data: track } = useGetTrackQuery(trackId!);
const { data: features } = useGetAudioFeaturesQuery(trackId!);
```

#### spotify-slice (已移除)

**評估結果**: Worker 已完全處理認證，前端完全不需要儲存 token

```typescript
// ❌ 已移除 (2025-11-15)
// 原因：
// 1. Worker 完全處理 Spotify 認證 (worker/index.ts)
// 2. 前端透過 RTK Query 呼叫 Worker API，不需要直接管理 token
// 3. 搜尋結果顯示沒有任何地方使用 spotify-selectors 或 dispatch spotify actions
// 4. Worker 的 /api/spotify/token 端點已經處理所有認證需求

// interface SpotifyState {
//   token: string | null;
//   tokenExpiry: number | null;
//   tokenValid: boolean;
//   loading: boolean;
//   error: string | null;
// }
```

**決策**: ✅ 已移除 (包括 spotify-slice.ts, spotify-selectors.ts, spotify-types.ts)

**移除影響**:

- ✅ [src/lib/store.ts](src/lib/store.ts) - 移除 spotifyReducer
- ✅ [tests/utils/test-utils.tsx](tests/utils/test-utils.tsx) - 移除 spotifyReducer
- ✅ Redux store 簡化，僅保留 data 和 spotifyApi

---

### 5. 首頁推薦資料

**來源**: 硬編碼常數
**管理方式**: 靜態匯出
**生命週期**: 應用程式執行期間

```typescript
// features/recommendations/constants.ts
export const RECOMMENDED_ARTIST_IDS = [
  "3AA28KZvwAUcZuOKwyblJQ", // Gorillaz
  "6qqNVTkY8uBg9cP3Jd7DAH", // Billie Eilish
  "1Xyo4u8uXC1ZmMpatF05PJ", // The Weeknd
  "0du5cEVh5yTK9QJze8zA0C", // Bruno Mars
  "66CXWjxzNUsdJxJ2JdwvnR", // Ariana Grande
  "06HL4z0CvFAxyc27GXpf02", // Taylor Swift
  "3TVXtAsR1Inumwj472S9r4", // Drake
  "4dpARuHxo51G3z768sgnrY", // Adele
] as const;
```

**使用方式**:

```typescript
// pages/home-page.tsx
RECOMMENDED_ARTIST_IDS.map((artistId) => (
  <ArtistCard key={artistId} artistId={artistId} />
));
```

每個 `ArtistCard` 內部使用 `useGetArtistQuery(artistId)` 獲取資料。

---

## Redux Store 結構

**重構後的 Store**:

```typescript
{
  // RTK Query (自動管理)
  spotifyApi: {
    queries: {
      'getArtist("xxx")': { status, data, ... },
      'getTrack("yyy")': { status, data, ... },
      'getAudioFeatures("yyy")': { status, data, ... },
    },
    mutations: {}, // 本功能無 mutations
  },

  // 應用狀態
  data: {
    tracks: LocalTrackData[],
    fuseInstance: Fuse | null,  // 從 search 移至此處
    version: string,
    loaded: boolean,
    loading: boolean,
    error: string | null,
  },

  // 以下 slices 移除
  // artist: { ... }   // ❌ 已移除
  // track: { ... }    // ❌ 已移除
  // search: { ... }   // ❌ 已移除（fuseInstance 移至 data）
  // spotify: { ... }  // ❌ 已移除（2025-11-15）
}
```

**變更說明**:

- ✅ **保留**: `spotifyApi` (RTK Query), `data` (本地資料)
- ❌ **移除**: `spotify` (認證由 Worker 處理)

---

## 資料流程

### 情境 1：使用者訪問歌手頁面

1. 使用者點擊 `/artist/3AA28KZvwAUcZuOKwyblJQ`
2. React Router 渲染 `<ArtistPage>`
3. `ArtistPage` 使用 `useParams()` 獲取 `artistId`
4. `useGetArtistQuery(artistId)` 自動：
   - 檢查快取（若有直接返回）
   - 無快取則發送請求
   - 自動管理 loading/error 狀態
5. 元件渲染歌手資料

**無需手動**:

- ❌ `useEffect` 監聽 params 變更
- ❌ 手動 dispatch actions
- ❌ 手動管理 loading 狀態
- ❌ 手動快取邏輯

### 情境 2：使用者搜尋歌手

1. 使用者在搜尋框輸入 "Gorillaz"
2. `setSearchParams({ q: "Gorillaz" }, { replace: true })`
3. URL 更新為 `/search?q=Gorillaz`
4. `SearchPage` re-render，`useSearchParams()` 返回新的 query
5. 呼叫純函數 `performSearch(fuseInstance, query)`
6. 渲染搜尋結果

**無需**:

- ❌ Redux action `performSearch`
- ❌ 將 query 儲存至 Redux
- ❌ 同步 URL 與 Redux 狀態

### 情境 3：使用者按「上一頁」

1. 使用者在 `/artist/XXX/track/YYY`，按瀏覽器「上一頁」
2. 瀏覽器導航回 `/artist/XXX`
3. React Router 渲染 `<ArtistPage>`
4. `useGetArtistQuery(XXX)` 從快取讀取（若未過期）
5. 瞬間顯示，無需重新請求

**RTK Query 自動處理**:

- ✅ 快取命中檢查
- ✅ TTL 管理
- ✅ 重複請求去除

---

## 型別定義

### Spotify API 型別（保留）

```typescript
// types/spotify.ts
export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string; height: number; width: number }>;
  followers: { total: number };
  popularity: number;
  genres: string[];
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: { spotify: string };
}

export interface SpotifyAudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  duration_ms: number;
  time_signature: number;
}
```

### 本地資料型別（保留）

```typescript
// types/data-schema.ts
export interface LocalTrackData {
  trackName: string;
  trackId: string;
  artistName: string;
  artistId: string;
  artistMonthlyListeners: number;
  releaseYear: number;
  popularity: {
    playCount: number;
    youtubeViews: number;
    youtubeLikes: number;
    youtubeComments: number;
  };
  indicator: number;
}

export interface LocalTracksDatabase {
  version: string;
  generatedAt: string;
  totalTracks: number;
  tracks: LocalTrackData[];
}
```

### 搜尋型別（簡化）

```typescript
// features/search/search-types.ts
export interface SearchResult {
  artist: LocalTrackData;
  score?: number;
}

// 移除：SearchState（改用 URL）
```

---

## 驗證規則

### URL Params 驗證

```typescript
// pages/artist-page.tsx
const { artistId } = useParams();

// 驗證：artistId 必須存在
if (!artistId) {
  return <ErrorPage message="Missing artist ID" />;
}

// RTK Query skip 防止無效請求
const { data, error } = useGetArtistQuery(artistId, {
  skip: !artistId || artistId.length === 0,
});
```

### Search Params 驗證

```typescript
// pages/search-page.tsx
const [searchParams] = useSearchParams();
const query = searchParams.get("q") || ""; // 預設空字串

// 空查詢不執行搜尋
const results = query ? performSearch(fuseInstance, query) : [];
```

---

## 遷移計畫

### Step 1: 建立 RTK Query API

- [ ] 建立 `features/api/spotify-api.ts`
- [ ] 定義 getArtist, getTrack, getAudioFeatures endpoints
- [ ] 配置 tags 和 cache 策略
- [ ] 整合至 Redux store

### Step 2: 建立路由配置

- [ ] 建立 `lib/router.tsx`
- [ ] 定義 4 個主要路由
- [ ] 更新 `main.tsx` 使用 RouterProvider

### Step 3: 建立頁面元件

- [ ] `pages/home-page.tsx` - 使用硬編碼推薦清單
- [ ] `pages/search-page.tsx` - 使用 URL searchParams
- [ ] `pages/artist-page.tsx` - 使用 URL params + RTK Query
- [ ] `pages/track-page.tsx` - 使用 URL params + RTK Query

### Step 4: 重構現有元件

- [ ] 更新 `components/artist/artist-profile.tsx` - 改用 props 而非 Redux
- [ ] 更新 `components/track/track-detail.tsx` - 改用 props 而非 Redux
- [ ] 更新 `components/search/search-bar.tsx` - 使用 setSearchParams
- [ ] 更新 `components/search/search-results.tsx` - 從 URL 讀取 query

### Step 5: 移除舊程式碼

- [ ] 移除 `features/artist/` (slice, selectors, types)
- [ ] 移除 `features/track/` (slice, selectors, types)
- [ ] 簡化 `features/search/` (移除 slice, selectors)
- [ ] 移除 `hooks/use-artist.ts`, `use-track.ts`, `use-search.ts`
- [ ] 移除 `services/spotify-api.ts`
- [x] 評估移除 `features/spotify/` (已完成移除 2025-11-15)

### Step 6: 測試與驗證

- [ ] 單元測試：RTK Query hooks
- [ ] E2E 測試：導航流程
- [ ] E2E 測試：深度連結
- [ ] E2E 測試：快取行為

---

## 總結

本功能的資料模型極度簡化，主要依賴：

1. **URL** (瀏覽器管理): 所有「當前狀態」
2. **RTK Query** (自動管理): 所有 API 快取
3. **Redux** (最小化): 僅本地資料 (tracks.json + fuseInstance)

這種架構：

- ✅ 符合 Single Source of Truth 原則
- ✅ 減少手動狀態管理
- ✅ 自動處理快取和重複請求
- ✅ 響應式觸發，無需 useEffect
- ✅ 符合 MVP 精神，避免過度設計
