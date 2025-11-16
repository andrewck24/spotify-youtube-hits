# Research: 瀏覽器導航與資料快取

**Date**: 2025-11-14
**Related**: [plan.md](./plan.md), [spec.md](./spec.md)

## 目標

解決 [plan.md](./plan.md) Technical Context 中的所有技術決策與最佳實踐研究。

## 研究主題

### 1. RTK Query 最佳實踐

**Decision**: 使用 RTK Query 取代現有的 service-based API 架構

**Rationale**:

- **內建快取**: 自動管理 API 回應快取，無需手動實作
- **重複請求去除**: 自動合併相同參數的請求
- **型別安全**: 完整的 TypeScript 支援，自動生成 hooks
- **標準化**: 符合 Redux 生態系最佳實踐

**實作細節**:

```typescript
// features/api/spotify-api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  SpotifyArtist,
  SpotifyTrack,
  SpotifyAudioFeatures,
} from "@/types/spotify";

export const spotifyApi = createApi({
  reducerPath: "spotifyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "/api/spotify",
  }),
  tagTypes: ["Artist", "Track", "AudioFeatures"],
  endpoints: (build) => ({
    getArtist: build.query<SpotifyArtist, string>({
      query: (artistId) => `/artists/${artistId}`,
      providesTags: (_result, _error, artistId) => [
        { type: "Artist", id: artistId },
      ],
    }),
    getTrack: build.query<SpotifyTrack, string>({
      query: (trackId) => `/tracks/${trackId}`,
      providesTags: (_result, _error, trackId) => [
        { type: "Track", id: trackId },
      ],
    }),
    getAudioFeatures: build.query<SpotifyAudioFeatures, string>({
      query: (trackId) => `/audio-features/${trackId}`,
      providesTags: (_result, _error, trackId) => [
        { type: "AudioFeatures", id: trackId },
      ],
    }),
  }),
});

// 自動生成的 hooks
export const { useGetArtistQuery, useGetTrackQuery, useGetAudioFeaturesQuery } =
  spotifyApi;
```

**快取策略**:

- **Tags**: 使用 `tagTypes` 和 `providesTags` 標記快取項目
- **預設 TTL**: RTK Query 預設保留未使用的快取 60 秒
- **手動失效**: 不需要，本功能不涉及資料變更
- **記憶體管理**: 快取在 Redux store 中，關閉分頁自動清除

**與現有 Redux Store 整合**:

```typescript
// lib/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { spotifyApi } from "@/features/api/spotify-api";
import dataReducer from "@/features/data/data-slice";

export const store = configureStore({
  reducer: {
    data: dataReducer,
    [spotifyApi.reducerPath]: spotifyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(spotifyApi.middleware),
});
```

**Alternatives Considered**:

- **TanStack Query (React Query)**: 功能類似但需額外依賴，與現有 Redux 架構不相容
- **SWR**: 輕量但功能較少，不支援 Redux DevTools
- **手動快取**: 過度設計，違反 MVP 原則

---

### 2. React Router v7 路由配置

**Decision**: 使用 `createBrowserRouter` 搭配物件配置

**Rationale**:

- **推薦 API**: React Router v7 官方推薦使用 `createBrowserRouter`
- **型別安全**: 完整的 TypeScript 支援
- **測試友善**: 可獨立於 React 測試路由邏輯
- **效能優化**: 支援 lazy loading 和 code splitting

**實作細節**:

```tsx
// lib/router.tsx
import { createBrowserRouter } from "react-router";
import HomePage from "@/pages/home-page";
import SearchPage from "@/pages/search-page";
import ArtistPage from "@/pages/artist-page";
import TrackPage from "@/pages/track-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/artist/:artistId",
    element: <ArtistPage />,
  },
  {
    path: "/artist/:artistId/track/:trackId",
    element: <TrackPage />,
  },
]);
```

```tsx
// main.tsx
import { RouterProvider } from "react-router";
import { router } from "@/lib/router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
```

**Alternatives Considered**:

- **JSX 路由配置 (`<Route>`)**: 舊的 API，v7 不推薦
- **TanStack Router**: 功能強大但過度設計，學習曲線陡峭
- **Wouter**: 輕量但功能不足，不支援 data loading

---

### 3. URL Params 響應式觸發

**Decision**: 使用 `useParams` 和 `useSearchParams` 作為資料源，直接傳遞給 RTK Query hooks

**Rationale**:

- **響應式**: URL 變更時 hooks 自動重新執行
- **無需 useEffect**: params 變更自動觸發 RTK Query
- **Single Source of Truth**: URL 即狀態，無需額外同步

**實作模式**:

```tsx
// pages/artist-page.tsx
import { useParams } from "react-router";
import { useGetArtistQuery } from "@/features/api/spotify-api";

export default function ArtistPage() {
  const { artistId } = useParams(); // 響應式

  // artistId 變更時自動觸發新請求
  // skip 防止 undefined 時請求
  const {
    data: artist,
    isLoading,
    error,
  } = useGetArtistQuery(artistId!, { skip: !artistId });

  if (!artistId) return <ErrorPage message="Missing artist ID" />;
  if (isLoading) return <LoadingFallback />;
  if (error) return <ErrorPage error={error} />;

  return <ArtistProfile artist={artist} />;
}
```

```tsx
// pages/search-page.tsx
import { useSearchParams } from "react-router";
import { useAppSelector } from "@/lib/store";
import { performSearch } from "@/features/search/search-service";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // 從 Redux 獲取 fuseInstance
  const fuseInstance = useAppSelector((state) => state.search.fuseInstance);

  // 執行搜尋（純函數，無副作用）
  const results =
    query && fuseInstance ? performSearch(fuseInstance, query) : [];

  // 使用 replace: true 避免污染歷史記錄
  const handleSearchChange = (newQuery: string) => {
    setSearchParams({ q: newQuery }, { replace: true });
  };

  return (
    <SearchResults
      query={query}
      results={results}
      onQueryChange={handleSearchChange}
    />
  );
}
```

**關鍵原則**:

1. **URL 是 Single Source of Truth**: 狀態來自 URL，不存在 Redux
2. **Hook 響應式**: `useParams`/`useSearchParams` 變更自動觸發 re-render
3. **Skip 守衛**: 使用 `{ skip: !id }` 防止無效請求
4. **忘掉 useEffect**: 資料獲取由 RTK Query 自動處理

**Alternatives Considered**:

- **useEffect + fetch**: 手動管理，容易出錯
- **Redux state + URL 同步**: 過度複雜，雙重狀態來源

---

### 4. 搜尋頁面 `replace: true` 使用時機

**Decision**: 在搜尋輸入變更時使用 `setSearchParams(newParams, { replace: true })`

**Rationale**:

- **避免污染歷史**: 每次輸入不應建立新的歷史項目
- **改善 UX**: 使用者按「上一頁」應回到搜尋頁面前的頁面，而非上一個搜尋狀態
- **符合慣例**: Google、YouTube 等搜尋頁面都採用此模式

**實作範例**:

```tsx
// components/search/search-bar.tsx
import { useSearchParams } from "react-router";
import { useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

export function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");

  // Debounce 避免過度頻繁更新 URL
  const updateSearchParams = useDebouncedCallback((query: string) => {
    setSearchParams({ q: query }, { replace: true });
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    updateSearchParams(newValue);
  };

  return (
    <input
      type="search"
      value={inputValue}
      onChange={handleChange}
      placeholder="搜尋歌手..."
    />
  );
}
```

**何時使用 `replace: true`**:

- ✅ 搜尋輸入變更（連續輸入）
- ✅ 篩選條件變更（UI 控制項）
- ✅ 分頁導航（同一頁面內的分頁）
- ❌ 點擊連結導航（應建立新歷史）
- ❌ 表單提交（應建立新歷史）

---

### 5. 首頁推薦策略

**Decision**: 硬編碼 artistId 清單於 `features/recommendations/constants.ts`

**Rationale**:

- **效能**: 避免每次載入首頁時分析 15,833 首歌曲
- **簡單**: 資料不會變動，無需動態計算
- **可維護**: 集中管理，易於更新推薦清單
- **符合 MVP**: 快速實作，後續可優化

**實作**:

```typescript
// lib/constants.ts
/**
 * 首頁推薦歌手清單
 *
 * 選擇標準：
 * 1. 高人氣度（monthlyListeners > 20M）
 * 2. 資料完整性（有多首歌曲）
 * 3. 風格多樣性（不同音樂類型）
 *
 * 資料來源：public/data/tracks.json
 * 最後更新：2025-11-14
 */
export const RECOMMENDED_ARTIST_IDS = [
  "3AA28KZvwAUcZuOKwyblJQ", // Gorillaz (29.8M listeners)
  "6qqNVTkY8uBg9cP3Jd7DAH", // Billie Eilish (100M+ listeners)
  "1Xyo4u8uXC1ZmMpatF05PJ", // The Weeknd (110M+ listeners)
  "0du5cEVh5yTK9QJze8zA0C", // Bruno Mars (80M+ listeners)
  "66CXWjxzNUsdJxJ2JdwvnR", // Ariana Grande (90M+ listeners)
  "06HL4z0CvFAxyc27GXpf02", // Taylor Swift (120M+ listeners)
  "3TVXtAsR1Inumwj472S9r4", // Drake (85M+ listeners)
  "4dpARuHxo51G3z768sgnrY", // Adele (55M+ listeners)
] as const;

export type RecommendedArtistId = (typeof RECOMMENDED_ARTIST_IDS)[number];
```

```tsx
// pages/home-page.tsx
import { RECOMMENDED_ARTIST_IDS } from "@/features/recommendations/constants";
import { useGetArtistQuery } from "@/features/api/spotify-api";

export default function HomePage() {
  return (
    <div>
      <h1>推薦歌手</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {RECOMMENDED_ARTIST_IDS.map((artistId) => (
          <ArtistCard key={artistId} artistId={artistId} />
        ))}
      </div>
    </div>
  );
}

function ArtistCard({ artistId }: { artistId: string }) {
  const { data: artist, isLoading } = useGetArtistQuery(artistId);

  if (isLoading) return <Skeleton />;
  if (!artist) return null;

  return (
    <Link to={`/artist/${artistId}`}>
      <img src={artist.images[0]?.url} alt={artist.name} />
      <h3>{artist.name}</h3>
    </Link>
  );
}
```

**未來優化方向（Out of Scope）**:

- 從 tracks.json 動態計算（需要效能測試）
- 基於使用者瀏覽歷史的個人化推薦
- A/B 測試不同推薦演算法

**Alternatives Considered**:

- **動態分析 tracks.json**: 效能問題，首頁載入會變慢
- **後端 API**: 過度設計，違反靜態部署原則
- **隨機選擇**: 使用者體驗不一致

---

### 6. shadcn/ui 元件整合

**Decision**: 使用 shadcn/ui 作為 UI 元件庫

**Rationale**:

- **已安裝**: package.json 中已包含 shadcn (v3.5.0)
- **可客製化**: Copy-paste 模式，完全掌控程式碼
- **Tailwind 整合**: 與專案現有的 Tailwind CSS v4 完美搭配
- **無需額外依賴**: 不增加 bundle size

**需要的元件**:

- ✅ Button (已存在)
- ✅ Card (已存在)
- ✅ Skeleton (已存在)
- 🆕 Input (搜尋框)
- 🆕 Badge (標籤)
- 🆕 Alert (錯誤訊息)

**安裝方式**:

```bash
npx shadcn@latest add input badge alert
```

**使用範例**:

```tsx
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// 搜尋框
<Input
  type="search"
  placeholder="搜尋歌手..."
  value={query}
  onChange={handleChange}
/>

// 標籤
<Badge variant="secondary">Popular</Badge>

// 錯誤訊息
<Alert variant="destructive">
  <AlertDescription>Failed to load artist data</AlertDescription>
</Alert>
```

---

## 總結

所有技術決策已完成研究並記錄於此文件。關鍵決策：

1. ✅ **RTK Query**: 取代現有 service，提供自動快取
2. ✅ **createBrowserRouter**: 使用 React Router v7 推薦 API
3. ✅ **URL as State**: params/searchParams 響應式觸發 RTK Query
4. ✅ **replace: true**: 搜尋時避免污染歷史記錄
5. ✅ **硬編碼推薦**: 首頁歌手清單硬編碼提升效能
6. ✅ **shadcn/ui**: 使用現有 UI 元件庫

**下一步**: Phase 1 - 建立 data-model.md 和 contracts/
