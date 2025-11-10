# Implementation Plan: 全球內容分發優化

**Branch**: `002-cloudflare` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-cloudflare/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

將 Spotify YouTube Hits 應用從 GitHub Pages 遷移至 Cloudflare Workers + Workers Assets，實現全球內容分發網路加速、自動化 CI/CD 部署，並建立伺服器端 API 代理以安全管理 Spotify API 憑證。此遷移專注於基礎架構優化，不改變應用功能，目標是將亞洲地區首次載入時間從 3-5 秒降低至 1-2 秒（60% 提升），並達成 99.9% 服務可用性。

## Technical Context

**Language/Version**: TypeScript 5.9.3, Node.js 20
**Primary Dependencies**:

- Frontend: React 19.2.0, Vite 7.1.9, TailwindCSS 4.1.14, React Router 7.9.3
- Deployment: wrangler (Cloudflare CLI), @cloudflare/workers-types
- CI/CD: GitHub Actions (cloudflare/wrangler-action@v3)
- Edge Runtime: Cloudflare Workers (V8 Isolates, Web Standard APIs)

**Storage**:

- 靜態資料：JSON 檔案 (tracks.json ~6.4MB)
- 靜態資源：Cloudflare Workers Assets (dist/ 目錄)
- 憑證管理：Cloudflare Workers Secrets (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)

**Testing**:

- Unit/Integration: Vitest 3.2.4, @testing-library/react 16.3.0
- E2E: Playwright 1.56.0
- Linting: ESLint 9.37.0, TypeScript type checking

**Target Platform**:

- Runtime: Cloudflare Workers (300+ 全球邊緣節點)
- Browser: Chrome, Firefox, Safari, Edge (最新兩個主版本)
- Network: HTTP/3, Brotli/Gzip 壓縮, CDN 快取

**Project Type**: Web application (Single Page Application + Edge Functions)

**Performance Goals**:

- 首次載入時間（亞洲）: < 2 秒 (目前 3-5 秒)
- TTFB (Time To First Byte): 50-100ms (目前 500-1000ms)
- P95 回應時間: < 200ms
- CDN 快取命中率: > 90%
- 資源壓縮率: 70% (Brotli/Gzip)

**Constraints**:

- 零停機部署（Zero-downtime deployment）
- 99.9% 服務可用性（每月停機時間 < 43 分鐘）
- Cloudflare Workers 免費額度：100,000 requests/day
- 部署時間：從 commit 到生產 < 10 分鐘
- PR 預覽環境生成：< 5 分鐘

**Scale/Scope**:

- 預期日流量：< 100,000 requests
- 全球 CDN 節點：300+ 地理位置
- 靜態資源：~10-20 MB (含 tracks.json)
- API 端點：2-3 個（Spotify token exchange, track details）
- 預覽環境：每個 PR 一個獨立環境，關閉後保留 24 小時

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ I. TypeScript 生態系最佳實踐

- ✅ 使用 TypeScript 5.9.3 進行型別安全開發（當前專案已使用 TypeScript）
- ✅ 遵循 ESLint 規則，保持程式碼品質（現有 ESLint 配置）
- ✅ 採用函數式元件與 Hooks 模式（React 19 + Hooks）
- ✅ 使用現代化工具鏈（Vite 7, React 19, TailwindCSS 4）
- ✅ 依賴項版本保持更新（使用最新穩定版）
- ⚠️ **Path alias 使用**：需確認現有程式碼是否已統一使用 `@/` 路徑別名

**Decision**: 在遷移過程中保持現有程式碼結構，不強制修改 import 路徑。未來重構時再統一採用 path alias。

### ✅ II. MVP 優先原則

- ✅ **核心功能優先**：本次遷移僅處理基礎架構，不新增功能
- ✅ **可獨立交付**：分階段遷移（靜態資源 → CI/CD → API 代理）
- ✅ **避免過度設計**：使用 Cloudflare Workers Assets（最簡方案），不引入 KV/D1/R2 等進階功能
- ✅ **拒絕 YAGNI**：不實作監控儀表板 UI（使用 Cloudflare Dashboard 內建功能）
- ✅ **解決使用者痛點**：專注於效能提升（載入速度 60% 改善）

**Compliance**: 符合 MVP 原則。所有功能皆有明確規格需求，無過度設計。

### ✅ III. 可測試性

- ✅ **關注點分離**：靜態資源（Workers Assets）與 API 邏輯（Worker script）分離
- ✅ **API 與商業邏輯分離**：Spotify API 代理獨立於前端程式碼
- ✅ **可測試架構**：
  - Frontend: 保持現有測試結構（Vitest + Playwright）
  - Edge Functions: Worker 函數可透過 `wrangler dev --local` 本地測試
  - CI/CD: GitHub Actions workflow 可本地透過 `act` 工具測試

**Compliance**: 符合可測試性原則。架構支援單元測試、整合測試、E2E 測試。

### ⚠️ IV. 靜態部署優先

- ⚠️ **靜態 → 混合架構轉變**：從純靜態（GitHub Pages）轉為靜態 + Edge Functions（Cloudflare Workers）
- ✅ **理由正當**：解決 Spotify API Client Secret 安全問題（規格 FR-013, FR-007）
- ✅ **保持簡單**：不引入傳統後端架構（無資料庫、無 Express/Fastify server）
- ✅ **Serverless 優先**：使用 Cloudflare Workers（Edge Functions），而非 VM 或 Container

**Decision**: 雖引入伺服器端邏輯，但仍符合「Serverless Functions」原則。此為解決安全問題的必要架構變更（符合規格 FR-013）。

**Justification**:

- **問題**：Spotify Client Secret 當前暴露於前端（安全漏洞）
- **替代方案評估**：
  1. 保持純靜態 → 無法解決安全問題（rejected）
  2. 引入傳統後端（Express/Fastify + VM/Container）→ 違反靜態部署原則，維護成本高（rejected）
  3. Cloudflare Workers (Serverless) → 符合 Serverless 原則，零維護成本（**accepted**）

### ✅ V. 命名與文件撰寫規則

- ✅ 檔案命名：英文 kebab-case（wrangler.jsonc, deploy.yml）
- ✅ 變數與函數命名：英文（遵循 TypeScript/JavaScript 慣例）
- ✅ 文件撰寫：繁體中文 zh-tw（本計畫文件、spec.md）
- ✅ 程式碼註解：繁體中文（若需要）
- ✅ Git commit message：英文 Angular Convention（feat(cloudflare): ...）
- ✅ PR 內文：英文標題 + 中文概要

**Compliance**: 完全符合命名與文件規則。

---

### Constitution Check Summary

**Status**: ✅ PASS with justified exceptions

**Exceptions**:

1. **靜態部署原則**：引入 Cloudflare Workers (Edge Functions) 作為伺服器端代理
   - **理由**：解決 Spotify API 憑證安全問題（FR-013）
   - **符合性**：仍屬 Serverless 架構，無傳統後端維護成本

**Re-check after Phase 1**: ✅ **VERIFIED**

Phase 1 設計驗證結果：

- ✅ Edge Functions 架構簡單（僅 token exchange + API proxy，無複雜邏輯）
- ✅ 無過度設計（未引入 KV/D1/R2 等進階功能）
- ✅ 資料模型符合 RESTful 風格（`/api/spotify/token`, `/api/spotify/tracks/:id`）
- ✅ 錯誤處理適度（標準化錯誤格式，不過度複雜）
- ✅ 快取策略簡單（in-memory, 55 min TTL）
- ✅ 監控方案符合 MVP（使用 Cloudflare Dashboard 內建功能）

**Conclusion**: 設計符合憲章所有原則，可進入 Phase 2（任務分解）。

## Project Structure

### Documentation (this feature)

```plaintext
specs/002-cloudflare/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output: Cloudflare Workers 技術研究
├── data-model.md        # Phase 1 output: API 資料模型
├── quickstart.md        # Phase 1 output: 部署與開發指南
├── contracts/           # Phase 1 output: API 合約規格
│   ├── spotify-api.yaml # Spotify API 代理端點規格
│   └── assets.yaml      # 靜態資源服務規格
└── tasks.md             # Phase 2 output: NOT created by /speckit.plan
```

### Source Code (repository root)

```plaintext
# Web application structure (Frontend + Edge Functions)

# Frontend (existing structure preserved)
src/
├── components/         # React components
├── pages/             # Page-level components
├── services/          # API services (將更新為呼叫 Worker API)
│   └── spotify-api.ts # 更新：呼叫 /api/spotify/* 而非直接呼叫 Spotify
├── store/             # Redux Toolkit store
├── types/             # TypeScript types
└── App.tsx            # Main app component

public/
└── data/
    └── tracks.json    # 靜態資料（遷移後由 Workers Assets 服務）

tests/
├── unit/              # Vitest unit tests
├── integration/       # Integration tests
└── e2e/               # Playwright E2E tests
    └── playwright.config.ts

# Edge Functions (new)
worker/
├── index.ts           # Worker entry point (API 代理 + Assets routing)
├── spotify/
│   ├── token.ts       # Spotify token exchange
│   └── tracks.ts      # Spotify tracks API proxy
└── types/
    └── env.ts         # Cloudflare Workers environment types

# Infrastructure (new/updated)
.github/
└── workflows/
    └── deploy.yml     # GitHub Actions CI/CD workflow (new)

wrangler.jsonc         # Cloudflare Workers configuration (new)
.dev.vars.example      # Environment variables template (new)

# Existing build/config files (updated)
vite.config.ts         # Update: base path from '/spotify-youtube-hits/' to '/'
package.json           # Update: add wrangler, remove gh-pages
.gitignore             # Update: add .wrangler/, .dev.vars
```

**Structure Decision**:

採用 **Web Application with Edge Functions** 架構：

1. **Frontend**: 保持現有 `src/` 結構，僅更新 API 呼叫邏輯
2. **Edge Functions**: 新增 `worker/` 目錄存放 Cloudflare Workers 程式碼
3. **Separation of Concerns**:
   - `src/`: React 前端（build 到 `dist/`）
   - `worker/`: Edge Functions（處理 API 代理）
   - `public/data/`: 靜態資料（由 Workers Assets 服務）

**Rationale**:

- 前端程式碼無需大幅重構
- Worker 邏輯獨立，易於測試與維護
- 符合 Cloudflare Workers + Workers Assets 最佳實踐

## Complexity Tracking

(Fill ONLY if Constitution Check has violations that must be justified)

| Violation                       | Why Needed                                                            | Simpler Alternative Rejected Because                                                                                                      |
| ------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 靜態部署 → Serverless Functions | 解決 Spotify API Client Secret 暴露於前端的安全漏洞（FR-013, FR-007） | 1. **純靜態方案**：無法隱藏 Client Secret，安全風險不可接受 2. **傳統後端（VM/Container）**：維護成本高、違反靜態部署原則、不符合專案規模 |

---

## Phase 0: Research & Technical Decisions

(Output: research.md)

See [research.md](./research.md) for detailed research findings.

## Phase 1: Design & Contracts

(Output: data-model.md, contracts/, quickstart.md)

See individual files:

- [data-model.md](./data-model.md) - API 與資料模型設計
- [contracts/](./contracts/) - API 規格定義
- [quickstart.md](./quickstart.md) - 部署與開發指南

## Next Steps

執行以下命令繼續工作流程：

```bash
# Phase 2: 產生任務清單
/speckit.tasks

# Phase 3: 執行實作
/speckit.implement
```

---

**Last Updated**: 2025-11-09
**Plan Version**: 1.0.0
