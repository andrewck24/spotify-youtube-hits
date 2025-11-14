# Quick Start: 瀏覽器導航與資料快取

**Date**: 2025-11-14
**Branch**: `004-routing-and-caching`

## Overview

本功能實作基於 URL 的路由導航和 RTK Query 自動快取。使用者可使用瀏覽器「上一頁」和「下一頁」按鈕在四個主要頁面之間導航。

## Prerequisites

- [data-model.md](./data-model.md) - 了解資料架構
- [research.md](./research.md) - 了解技術決策
- [contracts/rtk-query-api.md](./contracts/rtk-query-api.md) - 了解 API 規格

## Implementation Order

**優先順序**: 按照 User Story 的 Priority 實作 (P1 → P2 → P3 → P4)

### Phase 1: 建立基礎架構 (P1 核心)

1. **建立 RTK Query API** (`features/api/spotify-api.ts`)
   - 定義 getArtist, getTrack, getAudioFeatures endpoints
   - 整合至 Redux store

2. **建立路由配置** (`lib/router.tsx`)
   - 定義 4 個路由：`/`, `/search`, `/artist/:artistId`, `/track/:trackId` (扁平結構)
   - 更新 `main.tsx` 使用 `<RouterProvider>`

3. **建立頁面元件** (`pages/`)
   - `artist-page.tsx` - 使用 `useParams` + `useGetArtistQuery`
   - `track-page.tsx` - 使用 `useParams` + `useGetTrackQuery` + `useGetAudioFeaturesQuery`

### Phase 2: 首頁推薦 (P2)

1. **建立推薦常數** (`features/recommendations/constants.ts`)
   - 硬編碼 8 位熱門歌手的 artistId

2. **建立首頁** (`pages/home-page.tsx`)
   - 使用 `RECOMMENDED_ARTIST_IDS` 渲染歌手卡片

3. **建立歌手卡片** (`components/artist/artist-card.tsx`)
   - 使用 `useGetArtistQuery` 獲取歌手資料

### Phase 3: 搜尋功能 (P3)

1. **建立搜尋頁面** (`pages/search-page.tsx`)
   - 使用 `useSearchParams` 讀取 query
   - 使用 `performSearch` 純函數執行搜尋

2. **重構搜尋元件**
   - 更新 `search-bar.tsx` 使用 `setSearchParams(params, { replace: true })`
   - 更新 `search-results.tsx` 從 URL 讀取 query

### Phase 4: 清理舊程式碼

1. **移除不必要的 slices**
   - 移除 `features/artist/` (slice, selectors, types)
   - 移除 `features/track/` (slice, selectors, types)
   - 簡化 `features/search/` (移除 slice, selectors，保留 service)

2. **移除舊 hooks**
   - 移除 `use-artist.ts`, `use-track.ts`, `use-search.ts`

3. **移除舊 service**
   - 移除 `services/spotify-api.ts`

## Key Patterns

### Pattern 1: URL → RTK Query

```typescript
// pages/artist-page.tsx
const { artistId } = useParams(); // 從 URL 讀取
const { data, isLoading } = useGetArtistQuery(artistId!, { skip: !artistId });
```

### Pattern 2: Search Params

```typescript
// pages/search-page.tsx
const [searchParams, setSearchParams] = useSearchParams();
const query = searchParams.get("q") || "";

// 更新時使用 replace: true
setSearchParams({ q: newQuery }, { replace: true });
```

### Pattern 3: 導航

```typescript
// components/artist/artist-card.tsx
import { Link } from 'react-router';

<Link to={`/artist/${artistId}`}>
  <img src={artist.images[0]?.url} />
  <h3>{artist.name}</h3>
</Link>
```

## Testing

執行測試前確保所有實作完成：

```bash
# E2E 測試 - 導航
npm run test:e2e -- navigation.spec.ts

# E2E 測試 - 深度連結
npm run test:e2e -- deep-linking.spec.ts

# E2E 測試 - 快取
npm run test:e2e -- caching.spec.ts
```

## Deployment

```bash
# 建置
npm run build

# 本地預覽（測試 SPA 路由）
npm run preview

# 部署至 Cloudflare Pages
npm run deploy:cf
```

**SPA 路由配置**：

- SPA 路由透過 `wrangler.jsonc` 的 `not_found_handling: "single-page-application"` 配置處理
- 此配置已完成，無需額外建立檔案
- 執行 `npm run preview` 可測試 production build 的路由功能
- 確認深度連結（例如直接訪問 `/artist/xxx`）正常運作

## Next Steps

完成實作後，執行 `/speckit.tasks` 生成詳細的任務清單進行實作。
