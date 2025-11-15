# Implementation Plan: 瀏覽器導航與資料快取

**Branch**: `004-routing-and-caching` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-routing-and-caching/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能實作基於 URL 的路由導航系統與 API 資料快取機制。使用者可透過瀏覽器的「上一頁」和「下一頁」按鈕在四個主要頁面之間導航：首頁（歌手推薦）、搜尋結果頁、歌手資訊頁、歌曲資訊頁。

**核心技術方案**：

- **路由管理**：使用 react-router-dom v7 的 `useParams` 和 `useSearchParams` hooks 將 URL 作為 Single Source of Truth。Track 頁面採用扁平結構 `/track/:trackId`，因為 Spotify API 回應已包含完整 artist 資訊
- **資料快取**：遷移至 RTK Query API，利用其內建的自動快取、重複請求去除和標準化查詢機制
- **UI 元件**：使用 shadcn/ui 元件庫構建一致的使用者介面，包含統一的錯誤處理元件與 skeleton UI
- **搜尋體驗**：使用 `setSearchParams(newParams, { replace: true })` 避免污染瀏覽歷史
- **請求管理**：使用 AbortController 取消 pending requests，避免快速導航時的競態條件
- **漸進式載入**：Track 頁面先顯示 track API 的部分 artist 資料與 skeleton UI，待完整 artist 資料載入後更新

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0
**Primary Dependencies**:

- react-router-dom v7.9.3 (路由管理)
- @reduxjs/toolkit v2.9.0 (狀態管理，含 RTK Query)
- shadcn/ui (UI 元件庫)
- Vite 7.1.9 (建置工具)

**Storage**:

- Redux Store (記憶體內狀態管理)
- RTK Query cache (自動管理的 API 資料快取)
- 本地資料：public/data/tracks.json

**Testing**: Vitest 3.2.4 (單元測試), Playwright 1.56.0 (E2E 測試)
**Target Platform**: 現代瀏覽器 (Chrome, Firefox, Safari, Edge), 靜態部署至 Cloudflare Pages
**Project Type**: Web (單頁應用程式 SPA)
**Performance Goals**:

- 首頁載入 <1 秒
- 深度連結載入 <2 秒
- 快取命中時頁面切換 <0.5 秒
- 快取命中率 >90%

**Constraints**:

- 無後端資料庫，依賴 Spotify Web API 和本地 JSON
- 快取僅限瀏覽階段（session-based），不持久化
- URL 必須完整表達應用狀態（可分享、可收藏）

**Scale/Scope**:

- 4 個主要路由頁面
- ~3-5 個 Redux slices 轉換為 RTK Query endpoints
- 預估 10-15 個檔案變更
- 支援深度連結和瀏覽器歷史導航

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ I. TypeScript 生態系最佳實踐

- ✅ 使用 TypeScript 5.9.3 進行型別安全開發
- ✅ 遵循 ESLint 規則
- ✅ 採用函數式元件與 Hooks (useParams, useSearchParams)
- ✅ 使用現代化工具鏈 (Vite 7, React 19, react-router-dom 7)
- ✅ 所有 import 使用 path alias (`@/`)

**狀態**: PASS

### ✅ II. MVP 優先原則

- ✅ 功能分為 P1-P4 優先級，可逐步交付
- ✅ P1 (基本導航) 為核心，P2-P4 為增強功能
- ✅ 每個 User Story 獨立可測試
- ✅ 避免過度設計：使用 RTK Query 內建快取而非自建快取層
- ✅ 優先解決使用者痛點：瀏覽器導航支援

**狀態**: PASS

### ✅ III. 可測試性

- ✅ 關注點分離：
  - 路由邏輯 (react-router-dom)
  - 資料獲取 (RTK Query endpoints)
  - UI 展示 (React 元件)
- ✅ RTK Query 天然支援測試 mock
- ✅ 元件接收 URL 參數作為 props，易於單元測試
- ✅ 無複雜副作用，useParams/useSearchParams 響應式觸發

**狀態**: PASS

### ✅ IV. 靜態部署優先

- ✅ 純前端路由方案 (react-router-dom BrowserRouter)
- ✅ 無需後端路由配置
- ✅ 首頁推薦使用預定義的 8 位歌手 ID 常數（無需動態計算，符合靜態部署原則）
- ✅ API 呼叫透過現有 Cloudflare Worker proxy
- ✅ 部署至 Cloudflare Pages，透過 `wrangler.jsonc` 的 Workers Assets 配置處理 SPA 路由

**狀態**: PASS

### ✅ V. 命名與文件撰寫規則

- ✅ 檔案命名：英文 kebab-case (e.g., `artist-detail.tsx`, `home-page.tsx`)
- ✅ 變數與函數：英文 camelCase
- ✅ 文件：繁體中文 (spec.md, plan.md, research.md)
- ✅ 程式碼註解：避免或使用繁體中文
- ✅ Git commit：英文 Angular Convention (e.g., `feat(routing): add browser navigation`)

**狀態**: PASS

### 📊 總結

**整體評估**: ✅ **PASS** - 無違規，可進入 Phase 0

所有 Constitution 原則皆符合。本功能使用現有工具和最佳實踐，避免過度設計，符合 MVP 精神。

## Project Structure

### Documentation (this feature)

```plaintext
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```plaintext
src/
├── pages/                      # 新增：路由頁面元件
│   ├── home-page.tsx          # 首頁（歌手推薦）
│   ├── search-page.tsx        # 搜尋結果頁
│   ├── artist-page.tsx        # 歌手資訊頁
│   └── track-page.tsx         # 歌曲資訊頁
│
├── features/
│   ├── api/                   # 新增：RTK Query API 定義
│   │   ├── spotify-api.ts    # RTK Query endpoints
│   │   └── index.ts          # 匯出 API 和 hooks
│   │
│   ├── recommendations/       # 新增：首頁推薦
│   │   └── constants.ts      # 硬編碼 artistId 清單
│   │
│   ├── data/                  # 保留：本地資料管理
│   │   ├── data-slice.ts     # 保留
│   │   ├── data-selectors.ts # 保留
│   │   └── data-types.ts     # 保留
│   │
│   ├── search/                # 簡化
│   │   ├── search-service.ts # 保留
│   │   ├── search-types.ts   # 簡化
│   │   ├── [DELETE] search-slice.ts
│   │   └── [DELETE] search-selectors.ts
│   │
│   ├── artist/                # 完全移除
│   │   ├── [DELETE] artist-slice.ts
│   │   ├── [DELETE] artist-selectors.ts
│   │   └── [DELETE] artist-types.ts
│   │
│   ├── track/                 # 完全移除
│   │   ├── [DELETE] track-slice.ts
│   │   ├── [DELETE] track-selectors.ts
│   │   └── [DELETE] track-types.ts
│   │
│   └── spotify/               # 完全移除（經評估後刪除）
│       ├── [DELETED] spotify-slice.ts
│       ├── [DELETED] spotify-selectors.ts
│       └── [DELETED] spotify-types.ts
│
├── components/
│   ├── artist/
│   │   ├── artist-profile.tsx    # 修改
│   │   ├── artist-card.tsx       # 新增
│   │   └── artist-skeleton.tsx   # 新增：skeleton UI
│   ├── track/
│   │   ├── track-detail.tsx      # 修改
│   │   ├── track-list.tsx        # 修改
│   │   ├── feature-chart.tsx     # 保留
│   │   └── popularity-chart.tsx  # 保留
│   ├── error/                    # 新增：錯誤處理元件
│   │   ├── error-boundary.tsx   # 錯誤邊界
│   │   └── error-display.tsx    # 統一錯誤元件（可重試/返回）
│   └── [其他保留]
│
├── hooks/
│   ├── [DELETE] use-artist.ts
│   ├── [DELETE] use-track.ts
│   ├── [DELETE] use-search.ts
│   └── use-data-loader.ts         # 保留
│
├── lib/
│   ├── store.ts                   # 修改
│   └── router.tsx                 # 新增
│
├── services/
│   ├── [DELETE] spotify-api.ts
│   ├── data-loader.ts             # 保留
│   └── storage.ts                 # 保留
│
└── main.tsx                       # 修改

public/
└── data/
    └── tracks.json                # 保留
```

**Structure Decision**: Web SPA 結構

**核心變更**：

- ✅ **完全保留**: data/ (slice, selectors, types 全保留)
- ❌ **完全移除**: artist/, track/, spotify/ (slice, selectors, types 全刪除)
- ⚠️ **部分移除**: search/ (刪除 slice/selectors，保留 service/types)
- 💡 **移除原因 (spotify/)**: Worker 已完全處理 Spotify 認證，前端無需管理 token

### SPA 路由配置說明

**用途**：處理 Cloudflare Pages 的 SPA 路由

**問題背景**：
在 SPA 應用中，使用者可能直接訪問深度連結（例如 `/artist/123` 或 `/track/456`）。但由於這些路徑在伺服器上並不存在實體檔案，伺服器會回傳 404 錯誤。為了讓 react-router 接管這些路由，需要配置伺服器將所有請求重定向到 `index.html`。

**URL 設計決策** (基於 Clarifications):

- Track 頁面採用扁平結構 `/track/:trackId`，無需 artistId
- 理由：Spotify track API 回應已包含完整 artist 資訊（包括 artists 陣列）
- 簡化了深度連結並減少 URL 複雜度

**實作方式**：

透過 `wrangler.jsonc` 的 Workers Assets 配置：

```jsonc
{
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "not_found_handling": "single-page-application",
  },
}
```

**配置說明**：

- `not_found_handling: "single-page-application"`: 當請求的路徑找不到實體檔案時，自動回傳 `index.html`
- 這是 Cloudflare Workers Assets 的原生功能，無需額外配置檔案
- 靜態資源（圖片、CSS、JS）會優先於 SPA fallback，不受影響
- API 路由（`/api/*`）由 Worker 處理，優先級高於 Assets

**運作流程**：

1. 使用者訪問 `https://example.com/artist/3AA28KZvwAUcZuOKwyblJQ`
2. Cloudflare Workers Assets 找不到 `/artist/3AA28KZvwAUcZuOKwyblJQ` 實體檔案
3. 因為 `not_found_handling: "single-page-application"`，回傳 `index.html` 內容（狀態碼 200）
4. 瀏覽器執行 `index.html` 中的 React 應用程式
5. react-router 解析 URL 路徑 `/artist/3AA28KZvwAUcZuOKwyblJQ`
6. 渲染對應的 `ArtistPage` 元件

**注意事項**：

- 此配置已在 `wrangler.jsonc` 中完成，無需建立 `_redirects` 檔案
- 適用於所有部署到 Cloudflare Pages 的場景
- 本地開發使用 Vite dev server，已原生支援 SPA 路由
