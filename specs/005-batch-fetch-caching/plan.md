# Implementation Plan: Batch Fetch & Caching

**Branch**: `005-batch-fetch-caching` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-batch-fetch-caching/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

實作批次資料獲取與快取機制，透過 RTK Query 的 `providesTags` 將 batch API 回傳的多筆資料分配至個別資源快取，使子元件可直接透過 ID 使用 hook 取得快取資料，避免 props drilling。搭配 infinite scroll 與 skeleton loading 優化搜尋頁面使用者體驗。

## Technical Context

**Language/Version**: TypeScript 5.9.3
**Primary Dependencies**: React 19.2.0, Redux Toolkit 2.9.0 (RTK Query), React Router 7.9.3, Tailwind CSS 4.1.14, shadcn/ui
**Storage**: RTK Query in-memory cache (session-based)
**Testing**: Vitest 3.2.4, Playwright 1.56.0
**Target Platform**: Web (SPA deployed to Cloudflare Workers)
**Project Type**: Web application (frontend SPA + Cloudflare Worker backend proxy)
**Performance Goals**:

- 快取命中率 >90%（SC-002）
- 20 筆搜尋結果僅需 2 次 API 請求（SC-001）
- CLS < 0.1（SC-004）

**Constraints**:

- Batch API 每次最多 20 IDs（Spotify API 限制）
- Session-based 快取（頁面重整時清除）
- 永久 TTL（infinite cache lifetime within session）

**Scale/Scope**: 4 頁面（首頁、搜尋、藝人、歌曲）、無限捲動支援 100+ 項目

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. TypeScript 生態系最佳實踐 | ✅ 通過 | 使用 TypeScript + RTK Query，所有 import 使用 path alias |
| II. MVP 優先原則 | ✅ 通過 | 僅實作核心批次獲取功能，不過度設計 |
| III. 可測試性 | ✅ 通過 | RTK Query hooks 可 mock，元件接收 ID 後自行取資料 |
| IV. 標準化前端元件開發 | ✅ 通過 | 優先使用 shadcn/ui 元件，遵循 globals.css 變數 |
| V. 命名與文件撰寫規則 | ✅ 通過 | 檔案 kebab-case，文件繁體中文 |

**User Input 特殊要求**:

- ✅ 使用 shadcn/ui 元件與 `@/globals.css` 變數
- ✅ RTK Query `providesTags` 分配 batch 資源至個別快取
- ✅ 元件透過 ID + hook 取得資料，避免 props drilling

## Project Structure

### Documentation (this feature)

```text
specs/005-batch-fetch-caching/
├── plan.md              # 本文件
├── research.md          # Phase 0 研究成果
├── data-model.md        # Phase 1 資料模型
├── quickstart.md        # Phase 1 快速開始指南
├── contracts/           # Phase 1 API 合約
│   └── batch-api.yaml   # Batch API OpenAPI 規格
└── tasks.md             # Phase 2 任務清單（/speckit.tasks 產生）
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── artist/
│   │   ├── card.tsx              # 現有，需整合 batch 快取
│   │   └── artist-profile.tsx    # 現有
│   ├── search/
│   │   ├── artist-results.tsx    # 需整合 batch fetch + skeleton
│   │   └── track-results.tsx     # 需整合 batch fetch + skeleton
│   ├── track/
│   │   └── item.tsx              # 現有，需整合 batch 快取
│   └── ui/
│       └── skeleton.tsx          # shadcn/ui skeleton（現有）
├── hooks/
│   ├── use-search.ts             # 現有搜尋 hook
│   └── use-infinite-scroll.ts    # 新增：無限捲動 hook
├── services/
│   ├── spotify-api.ts            # 擴展：新增 batch endpoints
│   └── index.ts                  # 統一導出點（保持現有結構）
├── pages/
│   └── search-page.tsx           # 整合 infinite scroll + batch fetch
└── lib/
    └── utils.ts                  # 新增：chunking utility
```

**Structure Decision**: 採用現有 Web SPA 結構，擴展 `spotify-api.ts` 新增 batch endpoints，保持 `index.ts` 作為統一導出點。

## Complexity Tracking

> 無違規需記錄
