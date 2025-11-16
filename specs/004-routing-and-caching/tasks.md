# Tasks: 瀏覽器導航與資料快取

**Feature Branch**: `004-routing-and-caching`
**Date**: 2025-11-14
**Related**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md)

## Summary

根據 spec.md 的 User Stories 優先級（P1 → P2 → P3 → P4）組織任務，每個 User Story 作為獨立的實作與測試單元。

**總任務數**: 34
**User Story 分布**:

- Setup & Foundational: 6 tasks
- P1 (基本導航): 9 tasks
- P2 (首頁推薦): 4 tasks
- P3 (深度連結): 3 tasks
- P4 (資料快取): 5 tasks
- Polish (跨功能): 7 tasks

**關鍵架構決策** (基於 Clarifications):

- Track URL 採用扁平結構: `/track/:trackId`
- 統一錯誤處理元件（可重試/不可重試）
- 首頁推薦使用預定義 8 位歌手清單
- 使用 AbortController 管理請求取消
- Track 頁面採用漸進式載入（skeleton UI）
- SPA 路由透過 Cloudflare Workers Assets 的 `not_found_handling` 配置處理

---

## Phase 1: Setup & Configuration

基礎專案設定與工具配置。

### T001: 建立 RTK Query API slice [Setup] ✅ DONE

**File**: `src/services/spotify-api.ts`
**Description**: 建立 RTK Query API slice，定義 3 個 endpoints (getArtist, getTrack, getAudioFeatures)
**Dependencies**: None
**Checklist**:

- [x] 使用 `createApi` 與 `fetchBaseQuery`
- [x] Base URL 設定為 `/api/spotify`
- [x] 定義 tagTypes: `["Artist", "Track", "AudioFeatures"]`
- [x] 實作 getArtist endpoint (GET `/artists/:artistId`)
- [x] 實作 getTrack endpoint (GET `/tracks/:trackId`)
- [x] 實作 getAudioFeatures endpoint (GET `/audio-features/:trackId`)
- [x] 每個 endpoint 使用 `providesTags` 標記快取
- [x] 匯出自動生成的 hooks

### T002: 建立 Services index 檔案 [Setup] ✅ DONE

**File**: `src/services/index.ts`
**Description**: 匯出 spotifyApi 與所有 hooks
**Dependencies**: T001
**Checklist**:

- [x] 匯出 `spotifyApi`
- [x] 匯出所有 auto-generated hooks
- [x] 使用 path alias `@/services`

### T003: 整合 RTK Query 至 Redux store [Setup] ✅ DONE

**File**: `src/lib/store.ts`
**Description**: 將 spotifyApi reducer 與 middleware 整合至 Redux store
**Dependencies**: T001
**Checklist**:

- [x] 加入 `spotifyApi.reducerPath` 至 reducer
- [x] 加入 `spotifyApi.middleware` 至 middleware
- [x] 保留現有的 data slice
- [x] 驗證 store 正常運作

### T004: 建立路由配置檔案 [Setup] ✅ DONE

**File**: `src/lib/router.tsx`
**Description**: 使用 react-router-dom v7 建立路由配置（4 個主要路由）
**Dependencies**: None
**Checklist**:

- [x] 使用 `createBrowserRouter`
- [x] 定義 4 個路由: `/`, `/search`, `/artist/:artistId`, `/track/:trackId` (扁平結構)
- [x] 每個路由對應一個頁面元件 (lazy import)
- [x] 使用 `<RouterProvider>` wrapper
- [x] 匯出 router instance

### T005: 更新 main.tsx 使用 RouterProvider [Setup] ✅ DONE

**File**: `src/main.tsx`
**Description**: 將 App 改為使用 RouterProvider
**Dependencies**: T004
**Checklist**:

- [x] 匯入 `router` from `@/lib/router`
- [x] 替換 `<App />` 為 `<RouterProvider router={router} />`
- [x] 保留 Redux Provider 包裹
- [x] 驗證應用程式正常啟動

### T006: 建立首頁推薦常數 [Setup] ✅ DONE

**File**: `src/features/recommendations/constants.ts`
**Description**: 定義預定義的 8 位歌手 ID 清單
**Dependencies**: None
**Checklist**:

- [x] 建立 `RECOMMENDED_ARTIST_IDS` 常數陣列
- [x] 包含 8 位歌手 ID (Gorillaz, Billie Eilish, The Weeknd, Bruno Mars, Ariana Grande, Taylor Swift, Drake, Adele)
- [x] 使用 `as const` 確保型別不可變
- [x] 匯出常數

### ~~T007: 建立 public/\_redirects 檔案 [Setup]~~ ❌ 已移除

**說明**: 此任務已移除。SPA 路由透過 `wrangler.jsonc` 中的 Workers Assets 配置 (`not_found_handling: "single-page-application"`) 處理，不需要 `_redirects` 檔案。

---

## Phase 2: Foundational Components

必須在任何 User Story 之前完成的基礎元件。

---

## Phase 3: P1 - 基本頁面導航 [US1]

**Goal**: 使用者能夠在 4 個主要頁面之間導航，並使用瀏覽器的「上一頁」「下一頁」按鈕。

**Independent Test**: 開啟應用程式 → 點擊歌手 → 點擊歌曲 → 按瀏覽器「上一頁」→ 確認返回歌手頁 → 按「下一頁」→ 確認前進到歌曲頁。

### T008: 建立 HomePage 元件 [US1] ✅ DONE

**File**: `src/pages/home-page.tsx`
**Description**: 首頁框架（暫時顯示佔位內容，P2 再實作推薦）
**Dependencies**: None
**Checklist**:

- [x] 建立 HomePage 元件
- [x] 使用 `<Link to="/search">` 導航到搜尋頁
- [x] 暫時顯示 "Home Page - Artists will be displayed in P2"
- [x] 驗證路由 `/` 正確渲染此元件

### T009: 建立 SearchPage 元件 [US1] ✅ DONE

**File**: `src/pages/search-page.tsx`
**Description**: 搜尋結果頁框架，使用 URL query parameter
**Dependencies**: None
**Checklist**:

- [x] 使用 `useSearchParams` 讀取 `q` 參數
- [x] 顯示當前搜尋關鍵字
- [x] 實作搜尋輸入框，使用 `setSearchParams({ q: newQuery }, { replace: true })`
- [x] 使用現有的 `performSearch` 函數執行搜尋
- [x] 顯示搜尋結果（歌手列表）
- [x] 每個結果連結到 `/artist/:artistId`
- [x] 處理空白搜尋關鍵字（顯示提示訊息）

### T010: 建立 ArtistPage 元件 [US1] ✅ DONE

**File**: `src/pages/artist-page.tsx`
**Description**: 歌手資訊頁，從 URL params 獲取 artistId 並載入資料
**Dependencies**: T001, T002
**Checklist**:

- [x] 使用 `useParams` 獲取 `artistId`
- [x] 使用 `useGetArtistQuery(artistId, { skip: !artistId })` 載入歌手資料
- [x] 處理 loading 狀態（顯示 loading indicator）
- [x] 處理 error 狀態（暫時顯示錯誤訊息，P7 再實作統一錯誤元件）
- [x] 渲染歌手資訊（使用現有的 `ArtistProfile` 元件）
- [x] 顯示歌曲列表，每首歌連結到 `/track/:trackId`
- [x] 驗證瀏覽器「上一頁」「下一頁」正常運作

### T011: 建立 TrackPage 元件 [US1] ✅ DONE

**File**: `src/pages/track-page.tsx`
**Description**: 歌曲資訊頁，從 URL params 獲取 trackId 並載入資料
**Dependencies**: T001, T002
**Checklist**:

- [x] 使用 `useParams` 獲取 `trackId` (無需 artistId)
- [x] 使用 `useGetTrackQuery(trackId, { skip: !trackId })` 載入歌曲資料
- [x] 使用 `useGetAudioFeaturesQuery(trackId, { skip: !trackId })` 載入音樂特徵
- [x] 處理 loading 狀態
- [x] 處理 error 狀態
- [x] 渲染歌曲資訊（使用現有的 `TrackDetail` 元件）
- [x] 從 track 資料中提取 artist 資訊，顯示 artist 連結到 `/artist/:artistId`
- [x] 驗證瀏覽器「上一頁」「下一頁」正常運作

### T012: 更新 ArtistProfile 元件接收 props [US1] ✅ DONE

**File**: `src/components/artist/artist-profile.tsx`
**Description**: 移除 Redux 依賴，改為接收 artist 資料作為 props
**Dependencies**: None
**Checklist**:

- [x] 將元件改為接收 `artist: SpotifyArtist` prop
- [x] 移除所有 Redux selector 引用
- [x] 保留現有的 UI 邏輯
- [x] 更新歌曲列表連結格式為 `/track/:trackId`（扁平結構）
- [x] 驗證元件正常渲染

### T013: 更新 TrackDetail 元件接收 props [US1] ✅ DONE

**File**: `src/components/track/track-detail.tsx`
**Description**: 移除 Redux 依賴，改為接收 track 與 audioFeatures 作為 props
**Dependencies**: None
**Checklist**:

- [x] 將元件改為接收 `track: SpotifyTrack` 和 `audioFeatures?: SpotifyAudioFeatures` props
- [x] 移除所有 Redux selector 引用
- [x] 保留現有的 UI 邏輯（圖表、播放按鈕等）
- [x] 更新 artist 連結格式為 `/artist/:artistId`
- [x] 驗證元件正常渲染

### T014: 移除舊的 artist slice 與相關檔案 [US1] [P] ✅ DONE

**Files**: `src/features/artist/artist-slice.ts`, `src/features/artist/artist-selectors.ts`, `src/features/artist/artist-types.ts`, `src/hooks/use-artist.ts`
**Description**: 刪除已被 RTK Query 取代的 artist slice
**Dependencies**: T010, T012
**Checklist**:

- [x] 刪除 `artist-slice.ts`
- [x] 刪除 `artist-selectors.ts`
- [x] 刪除 `artist-types.ts`
- [x] 刪除 `use-artist.ts`
- [x] 從 store.ts 移除 artist reducer
- [x] 驗證無 import 錯誤

### T015: 移除舊的 track slice 與相關檔案 [US1] [P] ✅ DONE

**Files**: `src/features/track/track-slice.ts`, `src/features/track/track-selectors.ts`, `src/features/track/track-types.ts`, `src/hooks/use-track.ts`
**Description**: 刪除已被 RTK Query 取代的 track slice
**Dependencies**: T011, T013
**Checklist**:

- [x] 刪除 `track-slice.ts`
- [x] 刪除 `track-selectors.ts`
- [x] 刪除 `track-types.ts`
- [x] 刪除 `use-track.ts`
- [x] 從 store.ts 移除 track reducer
- [x] 驗證無 import 錯誤

### T016: 簡化 search slice [US1] [P] ✅ DONE

**Files**: `src/features/search/search-slice.ts`, `src/features/search/search-selectors.ts`
**Description**: 移除 search slice（query 已改用 URL），保留 search service
**Dependencies**: T009
**Checklist**:

- [x] 刪除 `search-slice.ts`
- [x] 刪除 `search-selectors.ts`
- [x] 從 store.ts 移除 search reducer
- [x] 保留 `search-service.ts` (performSearch, createFuseInstance)
- [x] 保留 `search-types.ts`
- [x] 驗證 SearchPage 正常運作

---

**Note**: ✅ Spotify slice 已於 2025-11-15 評估後提前移除

**原因**: Worker 完全處理 Spotify 認證，前端無需管理 token
**移除檔案**:

- `src/features/spotify/spotify-slice.ts`
- `src/features/spotify/spotify-selectors.ts`
- `src/features/spotify/spotify-types.ts`

**更新檔案**:

- `src/lib/store.ts` - 移除 spotifyReducer
- `tests/utils/test-utils.tsx` - 移除 spotifyReducer

**決策依據**: 參見 [data-model.md](./data-model.md#spotify-slice-已移除)

---

**Checkpoint P1**: 所有 4 個頁面可導航，瀏覽器上一頁/下一頁功能正常。

---

## Phase 4: P2 - 首頁歌手推薦 [US2]

**Goal**: 首頁顯示 8 位預定義的熱門歌手推薦列表，點擊可進入歌手資訊頁。

**Independent Test**: 開啟應用程式 → 確認看到 8 位歌手推薦 → 點擊任一歌手 → 確認導航到歌手資訊頁 → 按「上一頁」→ 確認返回首頁。

### T017: 建立 ArtistCard 元件 [US2]

**File**: `src/components/artist/artist-card.tsx`
**Description**: 歌手卡片元件，顯示歌手基本資訊
**Dependencies**: None
**Checklist**:

- [ ] 接收 `artistId: string` prop
- [ ] 使用 `useGetArtistQuery(artistId)` 載入歌手資料
- [ ] 處理 loading 狀態（顯示 skeleton 或 spinner）
- [ ] 處理 error 狀態（顯示錯誤訊息）
- [ ] 顯示歌手照片、名稱、人氣度
- [ ] 整個卡片作為 `<Link to={`/artist/${artistId}`}>` 可點擊
- [ ] 使用 shadcn/ui Card 元件

### T018: 更新 HomePage 顯示推薦歌手 [US2]

**File**: `src/pages/home-page.tsx`
**Description**: 在首頁渲染 8 個 ArtistCard
**Dependencies**: T006, T017
**Checklist**:

- [ ] 匯入 `RECOMMENDED_ARTIST_IDS` from `@/lib/constants`
- [ ] 使用 `.map()` 渲染每個 artistId 為 `<ArtistCard>`
- [ ] 使用 Grid 或 Flex 佈局（響應式）
- [ ] 移除暫時的佔位內容
- [ ] 驗證 8 位歌手正確顯示

### T019: 加入首頁標題與描述 [US2] [P]

**File**: `src/pages/home-page.tsx`
**Description**: 加入頁面標題與說明文字
**Dependencies**: T018
**Checklist**:

- [ ] 加入 `<h1>` 標題："熱門歌手推薦"
- [ ] 加入說明文字："探索 Spotify 上的熱門歌手"
- [ ] 使用 shadcn/ui Typography 樣式
- [ ] 確保樣式一致

### T020: 驗證首頁推薦流程 [US2]

**Description**: E2E 測試首頁推薦功能
**Dependencies**: T018
**Checklist**:

- [ ] 開啟應用程式，確認顯示 8 位歌手
- [ ] 點擊任一歌手卡片，確認導航到正確的歌手資訊頁
- [ ] 按瀏覽器「上一頁」，確認返回首頁
- [ ] 確認推薦列表仍然顯示
- [ ] 驗證所有歌手照片正確載入

**Checkpoint P2**: 首頁顯示 8 位歌手推薦，點擊可導航。

---

## Phase 5: P3 - 深度連結支援 [US3]

**Goal**: 使用者可直接透過 URL 訪問特定頁面，應用程式自動載入對應內容。

**Independent Test**: 直接在瀏覽器輸入 `/artist/3AA28KZvwAUcZuOKwyblJQ` → 確認載入歌手頁 → 輸入 `/track/0d28khcov6AiegSCpG5TuT` → 確認載入歌曲頁。

### T021: 驗證深度連結 - Artist [US3]

**Description**: 測試歌手頁面深度連結
**Dependencies**: Phase 3 (P1)
**Checklist**:

- [ ] 直接輸入 `/artist/3AA28KZvwAUcZuOKwyblJQ` 到瀏覽器
- [ ] 確認頁面載入並顯示 Gorillaz 歌手資訊
- [ ] 確認顯示歌曲列表
- [ ] 重新整理頁面，確認狀態保持
- [ ] 測試無效的 artistId (如 `/artist/invalid`)，確認顯示錯誤

### T022: 驗證深度連結 - Track (含漸進式載入) [US3]

**Description**: 測試歌曲頁面深度連結與漸進式載入
**Dependencies**: Phase 3 (P1), Phase 7 (T032)
**Checklist**:

- [ ] 直接輸入 `/track/0d28khcov6AiegSCpG5TuT` 到瀏覽器
- [ ] 確認先顯示基本歌曲資訊與 skeleton UI
- [ ] 確認 artist 資訊漸進式載入（先顯示 name，後顯示完整資料）
- [ ] 重新整理頁面，確認狀態保持
- [ ] 測試無效的 trackId，確認顯示錯誤

### T023: 驗證深度連結 - Search [US3]

**Description**: 測試搜尋頁面深度連結
**Dependencies**: Phase 3 (P1)
**Checklist**:

- [ ] 直接輸入 `/search?q=Beatles` 到瀏覽器
- [ ] 確認頁面載入並顯示 "Beatles" 搜尋結果
- [ ] 確認搜尋輸入框預填 "Beatles"
- [ ] 重新整理頁面，確認搜尋關鍵字保持
- [ ] 測試空白 query (`/search`)，確認顯示提示訊息
- [ ] 執行 `npm run build` 和 `npm run preview` 測試 SPA 路由
- [ ] 確認所有路由在 production build 中正常運作

**Checkpoint P3**: 所有頁面支援深度連結，URL 可分享與收藏。

---

## Phase 6: P4 - 資料快取優化 [US4]

**Goal**: 已獲取的資料被快取，使用者返回之前瀏覽的頁面時不重新請求，提升載入速度。

**Independent Test**: 開啟應用程式 → 瀏覽歌手頁（記錄 API 請求）→ 瀏覽其他頁面 → 返回同一歌手頁 → 確認無新 API 請求（使用 Network 面板驗證）。

### T025: 配置 RTK Query 快取參數 [US4]

**File**: `src/services/spotify-api.ts`
**Description**: 調整 RTK Query 快取設定
**Dependencies**: T001
**Checklist**:

- [ ] 設定 `keepUnusedDataFor: 60` (保持未使用資料 60 秒)
- [ ] 確認 `refetchOnMountOrArgChange: false` (避免重複請求)
- [ ] 確認 `refetchOnReconnect: true` (斷線重連後重新獲取)
- [ ] 文件註解說明快取策略
- [ ] 驗證設定正常運作

### T026: 實作快取命中率監控 [US4] [P]

**File**: `src/lib/cache-monitor.ts` (optional utility)
**Description**: 開發工具：監控快取命中率
**Dependencies**: T025
**Checklist**:

- [ ] 建立 utility 監聽 RTK Query actions
- [ ] 計算快取命中/未命中次數
- [ ] 僅在 development 模式啟用
- [ ] Console log 快取統計資訊
- [ ] 驗證快取命中率 >90%

### T027: 驗證快取行為 - Artist [US4]

**Description**: 測試歌手資料快取
**Dependencies**: T025
**Checklist**:

- [ ] 開啟 DevTools Network 面板
- [ ] 訪問歌手頁面 A，記錄 API 請求
- [ ] 導航到其他頁面
- [ ] 返回歌手頁面 A
- [ ] 確認沒有發送新的 `/artists/:id` 請求
- [ ] 資料立即顯示（從快取讀取）
- [ ] 在 60 秒內重複測試，確認快取持續有效

### T028: 驗證快取行為 - Track [US4]

**Description**: 測試歌曲資料快取
**Dependencies**: T025
**Checklist**:

- [ ] 開啟 DevTools Network 面板
- [ ] 訪問歌曲頁面 X，記錄 API 請求 (`/tracks/:id`, `/audio-features/:id`)
- [ ] 導航到其他頁面
- [ ] 返回歌曲頁面 X
- [ ] 確認沒有發送新的 track/audio-features 請求
- [ ] 資料立即顯示（從快取讀取）
- [ ] 測試快取命中率 >90%

### T029: 測試快取生命週期 [US4]

**Description**: 測試快取 TTL 與清除行為
**Dependencies**: T025
**Checklist**:

- [ ] 訪問頁面，確認資料被快取
- [ ] 等待 60 秒（TTL 過期）
- [ ] 再次訪問，確認發送新的 API 請求
- [ ] 重新整理頁面，確認快取仍在記憶體中（未清除）
- [ ] 關閉分頁，重新開啟，確認快取已清除（session-based）

**Checkpoint P4**: 快取命中率 >90%，頁面切換時間 <0.5 秒（快取命中時）。

---

## Phase 7: Polish - 錯誤處理與 UX 增強

跨 User Story 的共用功能與 UX 改進。

### T030: 建立統一錯誤元件 [Polish]

**File**: `src/components/error/error-display.tsx`
**Description**: 統一錯誤顯示元件，支援可重試/不可重試錯誤
**Dependencies**: None
**Checklist**:

- [ ] 接收 `error: { status: number, message: string }` prop
- [ ] 接收 `onRetry?: () => void` callback
- [ ] 根據 error.status 判斷錯誤類型：
  - 404: 僅顯示「返回上一頁」按鈕
  - 500, 429, 網路錯誤: 顯示「重試」+「返回上一頁」按鈕
- [ ] 顯示錯誤訊息文字（友善化）
- [ ] 使用 shadcn/ui Alert 元件
- [ ] 「返回上一頁」使用 `useNavigate()` 的 `navigate(-1)`
- [ ] 驗證元件正常渲染

### T031: 更新所有頁面使用統一錯誤元件 [Polish]

**Files**: `src/pages/artist-page.tsx`, `src/pages/track-page.tsx`, `src/pages/search-page.tsx`
**Description**: 替換暫時錯誤訊息為統一錯誤元件
**Dependencies**: T030
**Checklist**:

- [ ] 在 ArtistPage 中處理 error 狀態，使用 `<ErrorDisplay>`
- [ ] 在 TrackPage 中處理 error 狀態，使用 `<ErrorDisplay>`
- [ ] 實作 `onRetry` callback 重新觸發 RTK Query
- [ ] 保持 URL 不變（不導航離開）
- [ ] 驗證 404、500、429 錯誤顯示正確

### T032: 建立 Artist Skeleton 元件 [Polish] [P]

**File**: `src/components/artist/artist-skeleton.tsx`
**Description**: 歌手資料載入中的 skeleton UI
**Dependencies**: None
**Checklist**:

- [ ] 使用 shadcn/ui Skeleton 元件
- [ ] 模擬 ArtistProfile 的佈局（照片、標題、描述）
- [ ] 匯出 `ArtistSkeleton` 元件
- [ ] 在 ArtistPage 和 ArtistCard loading 狀態使用

### T033: 實作 Track 頁面漸進式載入 [Polish]

**File**: `src/pages/track-page.tsx`
**Description**: Track 頁面先顯示 track 資料，artist 資料漸進式載入
**Dependencies**: T011, T032
**Checklist**:

- [ ] 同時發起 `useGetTrackQuery` 和 `useGetAudioFeaturesQuery`
- [ ] 從 track 資料提取 `artists[0].id` 和 `artists[0].name`
- [ ] 使用該 id 發起 `useGetArtistQuery` (獨立請求)
- [ ] Track 資料載入完成時，顯示基本資訊 + artist name
- [ ] Artist 資料未載入時，顯示 `<ArtistSkeleton>`
- [ ] Artist 資料載入完成後，更新為完整 artist 資訊
- [ ] 驗證漸進式載入流程順暢

### T034: 實作 AbortController 請求取消 [Polish]

**File**: `src/services/spotify-api.ts`
**Description**: 配置 RTK Query 支援請求取消
**Dependencies**: T001
**Checklist**:

- [ ] 在 fetchBaseQuery 中配置 `signal` support
- [ ] RTK Query 預設已支援 AbortController
- [ ] 驗證快速導航時，pending requests 被正確取消
- [ ] 測試：快速點擊多個歌手卡片，確認只載入最後一個
- [ ] DevTools Network 面板確認舊請求被 cancelled

### T035: 建立 ErrorBoundary 元件 [Polish] [P]

**File**: `src/components/error/error-boundary.tsx`
**Description**: React Error Boundary 捕捉元件渲染錯誤
**Dependencies**: None
**Checklist**:

- [ ] 實作 `componentDidCatch` 或使用 `react-error-boundary` 套件
- [ ] 顯示友善的錯誤頁面
- [ ] 提供「返回首頁」按鈕
- [ ] 在 router.tsx 中包裹 root route
- [ ] 驗證元件正常運作

### T036: 加入 loading 指示器到搜尋頁 [Polish] [P]

**File**: `src/pages/search-page.tsx`
**Description**: 搜尋結果載入時顯示 loading 狀態
**Dependencies**: None
**Checklist**:

- [ ] 使用 shadcn/ui Skeleton 或 Spinner
- [ ] 在搜尋結果載入時顯示 loading UI
- [ ] 搜尋完成後顯示結果
- [ ] 空結果顯示「未找到結果」訊息
- [ ] 驗證 UX 流暢

**Checkpoint Polish**: 所有錯誤情境正確處理，loading 狀態友善，漸進式載入流暢。

---

## Execution Strategy

### Phase Execution Order

1. **Setup & Foundational** (T001-T006): 可平行執行，無相依性
2. **P1 實作** (T008-T016): 按序執行 pages，平行執行 cleanup tasks
3. **P2 實作** (T017-T020): 依賴 P1 完成
4. **P3 驗證** (T021-T023): 依賴 P1 完成，可在 P2 之前或平行進行
5. **P4 優化** (T025-T029): 依賴 P1 完成，可在 P2/P3 之後進行
6. **Polish** (T030-T036): 可逐步執行，不阻塞其他 phases

### MVP Scope (Minimum Viable Product)

建議 MVP 僅包含 **Phase 1-3 (Setup + P1)**：

- T001-T016: 基本導航功能
- 首頁暫時顯示佔位內容
- 暫時錯誤處理（非統一元件）
- 無 skeleton UI

**MVP Delivery**: 4 個頁面可導航 + 瀏覽器歷史功能正常。

### Parallel Execution Examples

**Setup Phase** (All parallel):

```bash
# Terminal 1
T001: 建立 RTK Query API
T004: 建立路由配置

# Terminal 2
T002: API index
T006: 推薦常數
```

**P1 Pages** (Parallel after setup):

```bash
# Terminal 1
T008: HomePage

# Terminal 2
T009: SearchPage

# Terminal 3
T010: ArtistPage

# Terminal 4
T011: TrackPage
```

**Cleanup** (Parallel after pages done):

```bash
# Terminal 1
T014: 移除 artist slice

# Terminal 2
T015: 移除 track slice

# Terminal 3
T016: 簡化 search slice
```

---

## Dependencies Graph

```text
Setup (T001-T006)
    ├─> P1 Core (T008-T011) [Can run in parallel]
    │     ├─> T012-T013 (Update components)
    │     └─> T014-T016 (Cleanup) [Can run in parallel]
    │
    ├─> P2 Home (T017-T020)
    │     └─ Requires: T006, P1 Complete
    │
    ├─> P3 Deep Links (T021-T023) [Verification tasks]
    │     └─ Requires: P1 Complete
    │
    ├─> P4 Caching (T025-T029)
    │     └─ Requires: P1 Complete
    │
    └─> Polish (T030-T036) [Can start anytime]
          ├─> T030-T031 (Error handling)
          ├─> T032-T033 (Progressive loading) [Parallel]
          └─> T034-T036 (Request management, boundaries) [Parallel]
```

---

## Validation Checklist

完成所有任務後，驗證以下項目：

### P1 驗證

- [ ] 可在 4 個主要頁面之間導航
- [ ] 瀏覽器「上一頁」「下一頁」按鈕正常運作
- [ ] URL 正確更新（`/`, `/search?q=...`, `/artist/:id`, `/track/:id`）
- [ ] 所有舊 slices 已移除 (artist, track, search)

### P2 驗證

- [ ] 首頁顯示 8 位預定義歌手
- [ ] 點擊歌手卡片導航到歌手頁
- [ ] 歌手照片、名稱、人氣度正確顯示

### P3 驗證

- [ ] 直接訪問 `/artist/:id` 正常載入
- [ ] 直接訪問 `/track/:id` 正常載入（含漸進式載入）
- [ ] 直接訪問 `/search?q=...` 正常載入
- [ ] 重新整理頁面保持當前狀態

### P4 驗證

- [ ] 快取命中率 >90%
- [ ] 頁面切換時間 <0.5 秒（快取命中時）
- [ ] 無重複 API 請求（60 秒內）
- [ ] 關閉分頁後快取清除

### Polish 驗證

- [ ] 所有錯誤情境顯示統一錯誤元件
- [ ] 404 僅顯示「返回」，500/429 顯示「重試」+「返回」
- [ ] Loading 狀態顯示 skeleton UI
- [ ] Track 頁面 artist 資料漸進式載入
- [ ] 快速導航時舊請求被取消

---

## Notes

1. **測試策略**: 規格未明確要求測試，因此任務清單不包含單元測試或 E2E 測試框架。驗證任務 (T021-T023, T027-T029) 為手動測試檢查點。

2. **User Story 獨立性**: P2、P3、P4 均依賴 P1 完成，但彼此之間獨立。可根據優先級調整實作順序。

3. **Clarifications Impact**:
   - Track URL 扁平化（T011, T012, T013）
   - 統一錯誤元件設計（T030-T031）
   - 漸進式載入策略（T032-T033）
   - AbortController 整合（T034）
   - SPA 路由透過 Cloudflare Workers Assets 處理（移除 T007, T024）

4. **Performance Goals**:
   - 首頁載入 <1 秒 (T018)
   - 深度連結載入 <2 秒 (T021-T023)
   - 快取命中切換 <0.5 秒 (T028)

5. **Deployment**: SPA 路由透過 `wrangler.jsonc` 中的 `not_found_handling: "single-page-application"` 自動處理，無需額外配置。在 T023 中驗證 production build 的路由功能。

6. **data-slice 重構** (2025-11-15):
   - **背景**: T003 原計畫保留 data-slice 用於管理本地 tracks.json 資料
   - **重構決策**: 改用 React Router v7 loader API 替代 Redux data-slice
   - **實作內容**:
     - 建立 `src/loaders/tracks-loader.ts` 載入 tracks.json
     - 在 router.tsx 根路由配置 loader（子路由透過 Outlet 共享資料）
     - 更新 SearchPage 和 ArtistPage 使用 `useRouteLoaderData("root")` 取得資料
     - 移除 `src/features/data/` 目錄（data-slice.ts, data-selectors.ts, data-types.ts）
     - 移除 `src/hooks/use-data-loader.ts`
     - 移除 `src/services/data-loader.ts` 和其測試檔案
     - 更新 store.ts 移除 data reducer
     - 更新 test-utils.tsx 移除 data reducer
   - **優勢**:
     - ✅ 資料在頁面渲染前載入完成（無 loading 狀態）
     - ✅ React Router 自動處理重複請求去除
     - ✅ sessionStorage 快取確保單次載入
     - ✅ 子路由自動繼承資料（透過 Outlet）
     - ✅ TypeScript 類型安全（透過 typeof loader）
   - **影響檔案**: T003（更新 Redux store 配置），各頁面元件資料載入方式
