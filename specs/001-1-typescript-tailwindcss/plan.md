# Implementation Plan: Tech Stack 現代化重構

**Branch**: `001-1-typescript-tailwindcss` | **Date**: 2025-10-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-1-typescript-tailwindcss/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

將現有的 Spotify YouTube Hits 專案從 JavaScript + Emotion + Recoil 技術棧重構為 TypeScript + Tailwind CSS + Redux Toolkit，並採用 shadcn/ui 元件庫與 Fuse.js 客戶端搜尋引擎。重構後的應用將提供：

1. **型別安全**：使用 TypeScript 提升程式碼品質與開發體驗
2. **現代化 UI**：採用 Tailwind CSS + shadcn/ui 建立 Dashboard 風格的響應式介面
3. **靜態資料方案**：將 5.5MB dbDataState 拆分為獨立 JSON 檔案，使用 Fuse.js 實現快速模糊搜尋
4. **離線優先**：支援 sessionStorage 緩存，首次載入後可離線運作
5. **Mobile First RWD**：手機（< 768px）單欄、桌面（≥ 768px）雙欄布局

技術方案基於「靜態 JSON 檔案 + 客戶端搜尋引擎」架構，保持靜態部署優勢，無需後端伺服器。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x + React 19.x

**Primary Dependencies**:

- UI Framework: React 19.2.0 (with Suspense + lazy loading)
- Build Tool: Vite 7.x (code splitting, tree shaking)
- Styling: Tailwind CSS 3.x + shadcn/ui (Radix UI primitives)
- State Management: Redux Toolkit 2.x
- Charts: Recharts 3.x (via shadcn/ui chart components)
- Search Engine: Fuse.js 7.x
- Loading UX: shadcn/ui Skeleton + Spinner components
- Type Checking: TypeScript 5.x
- Linting: ESLint 9.x + typescript-eslint

**Storage**: 靜態 JSON 檔案 (public/data/tracks.json, ~5.5MB) + sessionStorage 快取

**Testing**: 架構支援測試但非強制 (未來可導入 Vitest + Testing Library)

**Target Platform**: 現代瀏覽器 (Chrome/Firefox/Safari/Edge 最新兩版) + GitHub Pages 靜態部署

**Project Type**: 單一 Web 應用 (SPA) with progressive loading

**Performance Goals**:

- TTI < 1.5 秒 (使用 lazy loading + code splitting)
- 完整資料載入 < 3 秒 (5.5MB JSON 漸進式載入)
- 搜尋延遲 < 100ms (Fuse.js 記憶體索引)
- 圖表渲染 60 FPS (Recharts + React 19 concurrent features)

**Constraints**:

- 離線優先：首次載入後可離線運作
- 靜態部署：無 server-side rendering，純客戶端運算
- 打包大小：主 bundle < 500KB (gzip)，lazy chunks < 200KB each
- 漸進式增強：loading states + error boundaries

**Scale/Scope**:

- 資料量：2000-5000 筆歌曲 (2023 年靜態快照)
- 預估流量：數百至數千 DAU
- 程式碼規模：50-100 元件，10-20 Redux slices，30-50 TypeScript types

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: TypeScript 生態系最佳實踐 ✅

- ✅ 使用 TypeScript 5.x 進行型別安全開發
- ✅ 遵循 ESLint 9.x + typescript-eslint 規則
- ✅ 採用函數式元件與 Hooks 模式 (React 19)
- ✅ 使用現代化工具鏈 (Vite 7.x, React 19.2.0)
- ✅ 依賴項使用最新穩定版本

**Status**: PASS

### Principle II: MVP 優先原則 ✅

- ✅ 重構範圍明確：僅更換技術棧，不新增功能
- ✅ 優先實作 P1 核心功能（搜尋與瀏覽）
- ✅ 避免過度設計：不引入不必要的抽象層
- ✅ 保持現有功能完整性

**Status**: PASS

### Principle III: 可測試性 ✅

- ✅ Redux Toolkit 提供可測試的狀態管理
- ✅ 關注點分離：
  - 資料層：Redux slices + services
  - 業務邏輯：custom hooks
  - UI 層：presentational components
- ✅ API 呼叫與 UI 分離 (services/)
- ✅ 元件採用 compound component pattern (shadcn/ui)

**Status**: PASS

### Principle IV: 靜態部署優先 ✅

- ✅ 保持 GitHub Pages 靜態部署
- ✅ 使用靜態 JSON 檔案（無資料庫）
- ✅ 客戶端搜尋引擎（Fuse.js）
- ✅ 無後端 API 開發需求

**Status**: PASS

### Principle V: 命名與文件規則 ✅

- ✅ 檔案命名：kebab-case (e.g., `artist-profile.tsx`)
- ✅ 元件命名：PascalCase (e.g., `ArtistProfile`)
- ✅ 文件使用繁體中文 (spec.md, plan.md)
- ✅ 程式碼註解：極少使用，優先使用描述性命名
- ✅ Commit message：英文 + Angular Convention

**Status**: PASS

### Overall Result: ✅ ALL GATES PASSED

無憲章違反，可直接進入 Phase 0 研究。

## Project Structure

### Documentation (this feature)

```text
specs/001-1-typescript-tailwindcss/
├── plan.md              # This file
├── research.md          # Phase 0 output (技術研究與決策)
├── data-model.md        # Phase 1 output (資料模型定義)
├── quickstart.md        # Phase 1 output (快速開始指南)
├── contracts/           # Phase 1 output (API 合約與資料 schema)
│   ├── README.md        # 合約文件使用指南
│   ├── spotify-api.ts   # Spotify Web API 型別定義
│   └── tracks-data-schema.ts  # 本地 JSON 資料 schema
├── checklists/          # Quality checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                      # 應用程式進入點
│   ├── App.tsx              # 主應用元件
│   ├── store.ts             # Redux store 配置
│   └── router.tsx           # 路由配置 (未來擴展用)
│
├── features/                 # 功能模組 (Redux Toolkit slices)
│   ├── artist/
│   │   ├── artist-slice.ts         # Redux slice
│   │   ├── artist-selectors.ts     # Reselect selectors
│   │   └── artist-types.ts         # TypeScript types
│   ├── track/
│   │   ├── track-slice.ts
│   │   ├── track-selectors.ts
│   │   └── track-types.ts
│   └── search/
│       ├── search-slice.ts
│       ├── search-service.ts       # Fuse.js search engine
│       └── search-types.ts
│
├── components/               # UI 元件 (shadcn/ui + custom)
│   ├── ui/                  # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── skeleton.tsx
│   │   ├── spinner.tsx
│   │   └── chart.tsx
│   ├── layout/
│   │   ├── dashboard-layout.tsx
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── artist/
│   │   ├── artist-profile.tsx
│   │   └── artist-list.tsx
│   ├── track/
│   │   ├── track-detail.tsx
│   │   ├── track-list.tsx
│   │   ├── popularity-chart.tsx
│   │   └── feature-chart.tsx
│   └── search/
│       ├── search-bar.tsx
│       └── search-results.tsx
│
├── services/                 # API 與資料服務
│   ├── spotify-api.ts       # Spotify API 呼叫
│   ├── data-loader.ts       # JSON 資料載入 + cache
│   └── storage.ts           # sessionStorage wrapper
│
├── hooks/                    # Custom React hooks
│   ├── use-artist.ts
│   ├── use-track.ts
│   ├── use-search.ts
│   └── use-data-loader.ts
│
├── lib/                      # 工具函式
│   ├── utils.ts             # shadcn/ui utils (cn helper)
│   ├── formatters.ts        # 時間/數字格式化
│   └── constants.ts         # 常數定義
│
├── types/                    # 全域 TypeScript types
│   ├── index.ts
│   ├── artist.ts
│   ├── track.ts
│   └── spotify.ts
│
└── main.tsx                  # Vite 進入點

public/
├── data/
│   └── tracks.json          # 5.5MB 歌曲資料庫
└── index.html

config/
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

**Structure Decision**: 採用單一 Web 應用結構，使用 Feature-First 組織方式：

- **features/**: Redux Toolkit slices 按功能分類（artist, track, search）
- **components/**: UI 元件採用 Atomic Design 概念（ui/ → layout/ → domain specific）
- **services/**: 資料層與 API 呼叫邏輯，與 UI 完全分離
- **hooks/**: 封裝業務邏輯的 custom hooks
- **types/**: 全域型別定義，確保型別一致性

此結構符合憲章「可測試性」原則，資料/業務邏輯/UI 清楚分離。

## Complexity Tracking

_No violations detected. All constitution checks passed._

## Implementation Progress

### Phase 0: Technical Research ✅ COMPLETED

**產出文件**: [research.md](./research.md)

**完成內容**:

- ✅ Tailwind CSS 4.x 技術研究（CSS-first 配置、@theme 指令）
- ✅ Spotify 品牌配色方案（oklch 色彩空間）
- ✅ Loading UX 設計（Skeleton + Spinner）
- ✅ 效能優化策略（lazy loading、code splitting）

### Phase 1: Design Artifacts ✅ COMPLETED

**產出文件**:

- [data-model.md](./data-model.md) - 資料模型定義
- [contracts/](./contracts/) - API 合約與資料 schema
  - [spotify-api.ts](./contracts/spotify-api.ts) - Spotify Web API 型別定義
  - [tracks-data-schema.ts](./contracts/tracks-data-schema.ts) - 本地 JSON 資料 schema
  - [README.md](./contracts/README.md) - 合約使用指南
- [quickstart.md](./quickstart.md) - 快速開始指南

**完成內容**:

- ✅ TypeScript 資料模型（Track, Artist, AudioFeatures, PopularityMetrics）
- ✅ Redux State 結構（5 個 slices: artist, track, search, data, spotify）
- ✅ 資料流程圖（應用啟動、搜尋藝人、點擊藝人、點擊歌曲）
- ✅ Zod 驗證規則（執行時型別檢查）
- ✅ Spotify API Service 介面定義（ISpotifyApiService）
- ✅ 本地資料 schema 與完整性檢查
- ✅ 開發者快速上手指南

### Phase 2: Task Breakdown ⏳ PENDING

**下一步**: 執行 `/speckit.tasks` 指令，根據 Phase 0-1 的設計產出生成詳細的實作任務清單。

**預計產出**: [tasks.md](./tasks.md)

**內容規劃**:

- 專案初始化任務（建立目錄結構、設定 Tailwind CSS 4.x、配置 TypeScript）
- Redux Toolkit 設定（store 配置、5 個 slices 實作）
- shadcn/ui 元件整合（安裝與配置）
- Fuse.js 搜尋引擎實作
- Spotify API Service 實作
- UI 元件開發（Dashboard layout、Artist profile、Track detail、Charts）
- 資料載入與快取邏輯
- 測試與驗證

---

**當前狀態**: Phase 1 設計階段已完成，準備進入 Phase 2 任務拆解階段。

**建議下一步**: 執行 `/speckit.tasks` 指令，生成可執行的實作任務清單。
