# Tasks: 全球內容分發優化

**Input**: Design documents from `/specs/002-cloudflare/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Tests are NOT included in this implementation. Testing will rely on existing test suite (Vitest + Playwright) to verify功能正確性。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

本專案採用 **Web Application with Edge Functions** 架構：

```plaintext
# Frontend (existing structure)
src/                      # React 前端程式碼
public/                   # 靜態資源
tests/                    # 測試檔案

# Edge Functions (new - optional, for US4)
worker/                   # Cloudflare Workers 程式碼（Phase 6 實作）

# Infrastructure (new/updated)
wrangler.jsonc           # Cloudflare Workers 配置
vite.config.ts           # Vite 配置（已更新）
package.json             # 依賴管理（已更新）
.dev.vars                # 本地開發環境變數（不 commit）
.dev.vars.example        # 環境變數範本
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 安裝 Cloudflare Workers 工具鏈，建立基礎配置檔案

- [x] T001 [P] [Setup] 安裝 wrangler CLI: `npm install -D wrangler`
- [x] T002 [P] [Setup] 移除 gh-pages 依賴: `npm uninstall gh-pages`
- [x] T003 [P] [Setup] 建立 wrangler.jsonc 配置檔案於專案根目錄
  - 設定 `name: "spotify-youtube-hits"`
  - 設定 `compatibility_date: "2025-11-09"`
  - 設定 `assets.directory: "./dist"`
  - 設定 `assets.not_found_handling: "single-page-application"`
- [x] T004 [P] [Setup] 更新 .gitignore 加入 Cloudflare 相關檔案
  - 新增 `.wrangler/`
  - 新增 `.dev.vars`
- [x] T005 [P] [Setup] 建立 .dev.vars.example 範本檔案
  - 提供 `SPOTIFY_CLIENT_ID` 範例
  - 提供 `SPOTIFY_CLIENT_SECRET` 範例
  - 加入說明註解

**Checkpoint**: 基礎工具與配置檔案就緒

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 更新前端建置配置，使其相容於 Cloudflare Workers 部署

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [Foundation] 更新 vite.config.ts
  - 將 `base` 從 `'/spotify-youtube-hits/'` 改為 `'/'`
  - 保留現有 plugins 配置（react, tailwindcss, svgr）
  - 保留現有 alias 配置（`@` → `./src`）
- [x] T007 [Foundation] 更新 package.json scripts
  - 移除 `predeploy` 與 `deploy` scripts（gh-pages）
  - 新增 `deploy:cf: "npm run build && wrangler deploy"` script
- [x] T008 [Foundation] 執行 `npm run build` 驗證建置成功
  - 確認 dist/ 目錄產生
  - 確認資源使用相對路徑（而非 `/spotify-youtube-hits/` prefix）

**Checkpoint**: Foundation ready - 前端建置配置完成，可開始 user story 實作

---

## Phase 3: User Story 1 - 快速存取應用 (Priority: P1) 🎯 MVP

**Goal**: 將應用部署至 Cloudflare Workers + Workers Assets，達成全球 CDN 加速與 SPA 路由支援

**Independent Test**:

1. 從不同地理位置（亞洲、歐洲、美洲）造訪應用，測量首次載入時間
2. 直接訪問 `/track/{id}` URL，驗證不返回 404 錯誤
3. 檢查資源壓縮（Brotli/Gzip）與 CDN headers

**Success Criteria**:

- ✅ 亞洲地區首次載入時間 < 2 秒
- ✅ 3G 網路主要內容載入 < 3 秒
- ✅ SPA 路由直接訪問正常運作

### Implementation for User Story 1

- [x] T009 [US1] 手動部署測試：執行 `npm run build && npx wrangler deploy`
  - 驗證部署成功 ✅
  - 記錄部署 URL：https://spotify-youtube-hits.andrewck24.workers.dev ✅
  - 註：SSL 證書配置中，需等待 5-10 分鐘後進行後續驗證
- [x] T010 [US1] 驗證首頁載入
  - 瀏覽器訪問部署 URL ✅
  - 檢查 Network tab 確認資源壓縮：**Zstandard (zstd)** ✅✅✅
  - 檢查 Cache-Control headers: `public, max-age=0, must-revalidate` ✅
  - CDN 快取狀態：HIT（JS assets 已快取）✅
  - HTTP/3 支援：alt-svc h3 ✅
- [x] T011 [US1] 驗證 SPA 路由
  - 直接訪問 `/track/0d28khcov6AiegSCpG5TuT` ✅
  - 確認返回 HTML（不是 404）✅
  - 確認頁面正確渲染 ✅
  - SPA not_found_handling 正常運作 ✅
- [x] T012 [US1] 驗證搜尋功能
  - 測試搜尋介面：搜尋 "Gorillaz" 成功 ✅
  - 確認 Fuse.js 搜尋正常運作：顯示 6 筆結果 ✅
  - Clear search 按鈕正常 ✅
- [x] T013 [US1] 驗證歌曲詳情頁
  - 測試歌曲詳情頁面：Feel Good Inc. 成功顯示 ✅
  - 確認圖表顯示正常：Recharts 人氣度對比圖表運作 ✅
  - YouTube 統計資料正確顯示 ✅
  - Spotify 連結正常 ✅
- [x] T014 [US1] 效能測試
  - 使用 Chrome DevTools Performance 測量 ✅
  - **LCP**: 881 ms ✅✅✅ (目標 < 2000 ms)
  - **TTFB**: 333 ms ✅✅✅ (從 500-1000ms 降低 67-80%)
  - **CLS**: 0.00 ✅ (完美無位移)
  - 資源壓縮：Zstandard (zstd) 比 Gzip/Brotli 更高效 ✅

**Checkpoint**: User Story 1 完成 - 應用已部署至 Cloudflare Workers，基本功能驗證通過

---

## Phase 4: User Story 3 - 無縫部署更新 (Priority: P2)

**Goal**: 設定 Cloudflare Git Integration 自動化 CI/CD 流程，實現 push 到 main 自動部署，PR 自動建立預覽環境

**Implementation Method**: Cloudflare Git Integration（替代 GitHub Actions 方案）

**Independent Test**:

1. 提交程式碼到 main 分支，驗證 Cloudflare 自動觸發部署
2. 建立 Pull Request，驗證預覽環境自動建立並提供 URL
3. 測試建置失敗時驗證部署被阻止

**Success Criteria**:

- ✅ Commit 到 main → 10 分鐘內自動部署到生產環境
- ✅ 建立 PR → 5 分鐘內獲得預覽環境 URL
- ✅ 建置失敗 → 部署自動取消

### Implementation for User Story 3

- [x] T015 [US3] 設定 Cloudflare Git Integration
  - 前往 Cloudflare Dashboard → Workers & Pages → 建立應用程式
  - 選擇「連接到 Git」
  - 授權並選擇 GitHub repository: `andrewck24/spotify-youtube-hits` ✅
  - 設定專案名稱: `spotify-youtube-hits` ✅
- [x] T016 [US3] 配置建置設定
  - 組建命令: `npm run build` ✅
  - 部署命令: `npx wrangler deploy` ✅
  - 版本命令: `npx wrangler versions upload` ✅
  - 根目錄: `/` ✅
  - 確認 wrangler.jsonc 已正確配置 ✅
- [x] T017 [US3] 設定環境變數與秘密
  - 在 Cloudflare Dashboard 設定區塊新增環境變數
  - 新增 `SPOTIFY_CLIENT_ID` (變數類型) ✅
  - 新增 `SPOTIFY_CLIENT_SECRET` (秘密類型) ✅
  - 確認秘密已加密存儲 ✅
- [x] T018 [US3] 配置分支控制與 PR 預覽
  - 設定生產分支: `main` ✅
  - 啟用「提取要求預覽」(PR Preview) ✅
  - 確認建置路徑排除設定 (如需要)
- [ ] T019 [US3] 測試自動部署流程
  - 將此 tasks.md 更新 commit 並 merge 到 main 分支
  - 前往 Cloudflare Dashboard → 部署頁面驗證自動觸發
  - 確認建置成功（組建 → 部署 → 完成）
  - 驗證生產環境 URL 已更新
- [ ] T020 [US3] 測試 PR 預覽環境
  - 建立測試 Pull Request（如新增 feature）
  - 驗證 Cloudflare 自動建立預覽部署
  - 在 PR 留言區確認預覽 URL 顯示
  - 訪問預覽 URL 確認功能正常
  - 驗證預覽環境與生產環境隔離
- [ ] T021 [US3] 測試建置失敗情境
  - 建立一個會導致 `npm run build` 失敗的 commit（如故意破壞語法）
  - 驗證 Cloudflare 建置步驟失敗並顯示錯誤訊息
  - 確認生產環境未受影響（仍為上一個成功版本）
  - 修復錯誤並確認可恢復正常部署

**Checkpoint**: User Story 3 完成 - Cloudflare Git Integration 自動化流程就緒，可自動部署與建立預覽環境

---

## Phase 5: User Story 2 - 可靠的服務可用性 (Priority: P2)

**Goal**: 驗證 Cloudflare Workers 內建監控功能，確認高可用性與自動擴展

**Independent Test**:

1. 存取 Cloudflare Dashboard 查看監控指標
2. 透過負載測試工具模擬流量增加
3. 驗證全球多地區存取均正常

**Success Criteria**:

- ✅ Cloudflare Dashboard 顯示即時監控指標
- ✅ 應用可處理流量增加（自動擴展）
- ✅ 全球 300+ 地理位置可用

### Implementation for User Story 2

- [ ] T022 [US2] 驗證 Cloudflare Dashboard 監控功能
  - 前往 Cloudflare Dashboard → Workers & Pages → spotify-youtube-hits
  - 確認可查看以下指標：
    - 請求數量（Requests per second）
    - 回應時間（P50, P95, P99）
    - 錯誤率（Error rate）
    - 地理分布（Geographic distribution）
    - CDN 快取命中率（Cache hit rate）
- [ ] T023 [US2] 記錄基準指標
  - 記錄當前請求數量
  - 記錄當前回應時間
  - 記錄當前錯誤率
- [ ] T024 [US2] 負載測試（可選）
  - 使用 Apache Bench、k6 或類似工具發送高流量請求
  - 觀察 Cloudflare Dashboard 指標變化
  - 確認應用自動擴展並維持正常回應時間
- [ ] T025 [US2] 全球存取驗證
  - 使用 VPN 或 proxy 從不同地區測試（亞洲、歐洲、美洲）
  - 確認所有地區均可正常存取
  - 比較不同地區的載入速度

**Checkpoint**: User Story 2 完成 - 監控與高可用性驗證通過

---

## Phase 6: User Story 4 - 準備未來功能擴展 (Priority: P3)

**Goal**: 實作 Spotify API 伺服器端代理，確保 API 憑證安全存放，並驗證架構可擴展性

**Independent Test**:

1. 呼叫 `/api/spotify/token` 取得 access token
2. 呼叫 `/api/spotify/tracks/{id}` 取得歌曲資訊
3. 驗證 Client Secret 不暴露於前端

**Success Criteria**:

- ✅ Spotify API 代理正常運作
- ✅ API 憑證僅存於 Cloudflare Workers Secrets
- ✅ 前端可透過 `/api/spotify/*` 存取 Spotify 資料

### Implementation for User Story 4

#### 4.1 Edge Functions 基礎架構

- [ ] T026 [P] [US4] 建立 worker/ 目錄結構
  - `worker/index.ts` - Worker entry point
  - `worker/spotify/` - Spotify API 相關邏輯
  - `worker/types/` - TypeScript types
- [ ] T027 [P] [US4] 建立 worker/types/env.ts
  - 定義 `Env` interface（包含 ASSETS, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET）
  - 符合 Cloudflare Workers types

#### 4.2 Spotify API Token Exchange

- [ ] T028 [US4] 實作 worker/spotify/token.ts
  - 定義 `getSpotifyToken` 函數
  - 實作 Client Credentials Flow
  - 實作 in-memory token 快取（55 分鐘 TTL）
  - 錯誤處理（MISSING_ENV_VARS, SPOTIFY_AUTH_FAILED）
- [ ] T029 [US4] 實作 worker/spotify/tracks.ts
  - 定義 `getTrackById` 函數
  - 實作 track ID 驗證（22 字元 base62）
  - 呼叫 Spotify API `/v1/tracks/{id}`
  - 錯誤處理（INVALID_TRACK_ID, TRACK_NOT_FOUND, SPOTIFY_API_ERROR）

#### 4.3 Worker Entry Point

- [ ] T030 [US4] 實作 worker/index.ts
  - 實作 `fetch` handler
  - 路由邏輯：
    - `POST /api/spotify/token` → `getSpotifyToken`
    - `GET /api/spotify/tracks/:id` → `getTrackById`
    - 其他路徑 → `env.ASSETS.fetch(request)`（靜態資源）
  - CORS headers 設定
  - 錯誤處理與標準化錯誤回應格式

#### 4.4 Wrangler 配置更新

- [ ] T031 [US4] 更新 wrangler.jsonc
  - 新增 `main: "worker/index.ts"`
  - 更新 `assets.binding: "ASSETS"`
  - 確保 `assets.not_found_handling: "single-page-application"` 保留

#### 4.5 Cloudflare Secrets 設定

- [x] T032 [US4] 確認 Cloudflare Workers Secrets 配置
  - 確認 Cloudflare Dashboard 已設定 `SPOTIFY_CLIENT_ID`（變數類型）
  - 確認 Cloudflare Dashboard 已設定 `SPOTIFY_CLIENT_SECRET`（秘密類型）✅
  - 註：使用 Cloudflare Git Integration，秘密已在 Phase 4 (T017) 設定完成
  - 更新 .dev.vars 用於本地開發（不 commit）

#### 4.6 Frontend API Integration

- [ ] T033 [US4] 更新 src/services/spotify-api.ts
  - 移除 `import.meta.env.VITE_SPOTIFY_CLIENT_SECRET`（安全漏洞修復）
  - 更新 API endpoint 從 `https://api.spotify.com` 改為 `/api/spotify`
  - 移除手動 token 管理邏輯（由 Worker 處理）
  - 更新錯誤處理以符合新的錯誤格式

#### 4.7 Testing & Validation

- [ ] T034 [US4] 本地測試 Worker
  - 執行 `npx wrangler dev`
  - 測試 `POST /api/spotify/token`（使用 curl 或 Postman）
  - 測試 `GET /api/spotify/tracks/{id}`
  - 驗證靜態資源仍正常服務（訪問 `/`）
- [ ] T035 [US4] 部署 Worker 到 Cloudflare
  - 執行 `npm run deploy:cf`
  - 驗證部署成功
- [ ] T036 [US4] 線上環境驗證
  - 測試前端應用可正常呼叫 Spotify API
  - 檢查 Network tab 確認 API 請求路徑正確（`/api/spotify/*`）
  - 驗證 Client Secret 不出現於前端程式碼或 Network requests
- [ ] T037 [US4] 錯誤情境測試
  - 測試無效的 track ID（應返回 400 INVALID_TRACK_ID）
  - 測試不存在的 track ID（應返回 404 TRACK_NOT_FOUND）
  - 測試 Spotify API 暫時無法存取情境（模擬）

**Checkpoint**: User Story 4 完成 - Spotify API 伺服器端代理實作完成，架構支援未來擴展

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 最終檢查、文件更新、清理舊設定

- [ ] T038 [P] [Polish] 停用 GitHub Pages
  - 前往 GitHub repo → Settings → Pages
  - 選擇 "Disable GitHub Pages"
- [ ] T039 [P] [Polish] 更新 README.md
  - 更新部署 URL（從 GitHub Pages 改為 Cloudflare Workers）
  - 新增 Cloudflare Workers 部署指引
  - 更新本地開發指引（加入 `wrangler dev`）
- [ ] T040 [P] [Polish] 檢查並移除舊環境變數
  - 確認 `VITE_SPOTIFY_CLIENT_SECRET` 不存在於任何 .env 檔案
  - 確認 .gitignore 包含所有 Cloudflare 相關檔案
- [ ] T041 [Polish] 執行完整功能驗證（Smoke Test）
  - 首頁載入 ✅
  - 搜尋功能 ✅
  - 歌曲詳情頁 ✅
  - 藝人頁面 ✅
  - 圖表顯示 ✅
  - SPA 路由 ✅
  - Spotify API 整合（若已實作 US4）✅
- [ ] T042 [Polish] 效能基準測試
  - 使用 WebPageTest 測量首次載入時間
  - 記錄 TTFB、FCP、LCP
  - 與 GitHub Pages 基準比較
  - 確認達成 SC-001 目標（載入時間降低 60%）
- [ ] T043 [P] [Polish] 文件最終檢查
  - 確認 [quickstart.md](./quickstart.md) 步驟正確
  - 確認 [plan.md](./plan.md) 與實際實作一致
  - 確認 [research.md](./research.md) 決策已執行

**Checkpoint**: 所有任務完成 - 遷移成功，應用已部署至 Cloudflare Workers

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T005) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase (T006-T008) - No dependencies on other stories
- **User Story 3 (Phase 4)**: Depends on US1 completion (T009-T014) - Need deployed application for CI/CD
- **User Story 2 (Phase 5)**: Depends on US1 completion (T009-T014) - Need deployed application for monitoring
- **User Story 4 (Phase 6)**: Can start after Foundational (T006-T008) - Independent but recommended after US1
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

```plaintext
Setup (Phase 1)
    ↓
Foundational (Phase 2)
    ↓
    ├─→ US1 (P1) - 快速存取應用 [REQUIRED FOR MVP]
    │       ↓
    │       ├─→ US3 (P2) - CI/CD 自動化
    │       └─→ US2 (P2) - 監控驗證
    │
    └─→ US4 (P3) - Spotify API 代理 [OPTIONAL - Future Enhancement]
            ↓
        Polish & Documentation
```

**Critical Path**: Setup → Foundational → US1 → US3/US2 → Polish

**MVP Scope**: Setup + Foundational + US1 + US3 (基礎架構遷移 + CI/CD)

**Full Feature**: Add US2 (監控驗證) + US4 (Spotify API 代理)

### Within Each User Story

- **US1**: Sequential tasks (T009 → T010 → T011 → T012 → T013 → T014)
- **US2**: Sequential tasks (T022 → T023 → T024/T025 can be parallel)
- **US3**: Configuration first (T015 → T016 → T017 → T018), then validation (T019 → T020 → T021)
- **US4**:
  - T026 [P] T027 can run in parallel (different files)
  - T028 and T029 can run in parallel (different files)
  - T030 depends on T028, T029
  - T031 depends on T030
  - T032 can run in parallel with T031
  - T033 depends on T031, T032
  - T034 → T035 → T036 → T037 (sequential)

### Parallel Opportunities

#### Setup Phase (Phase 1)

```bash
# All setup tasks can run in parallel:
T001 [P] Install wrangler
T002 [P] Remove gh-pages
T003 [P] Create wrangler.jsonc
T004 [P] Update .gitignore
T005 [P] Create .dev.vars.example
```

#### User Story 4 - Worker Implementation

```bash
# Architecture setup (parallel):
T026 [P] Create worker/ directory structure
T027 [P] Create worker/types/env.ts

# API implementation (parallel after architecture):
T028 Implement worker/spotify/token.ts
T029 Implement worker/spotify/tracks.ts

# Configuration (can run in parallel):
T031 Update wrangler.jsonc
T032 Set Cloudflare Secrets
```

#### Polish Phase (Phase 7)

```bash
# Documentation tasks (parallel):
T038 [P] Disable GitHub Pages
T039 [P] Update README.md
T040 [P] Check old environment variables
T043 [P] Final documentation check
```

---

## Parallel Example: User Story 4 (Spotify API Proxy)

```bash
# Step 1: Launch architecture setup together
Task: "Create worker/ directory structure"
Task: "Create worker/types/env.ts"

# Step 2: Launch API implementations together (after Step 1)
Task: "Implement worker/spotify/token.ts"
Task: "Implement worker/spotify/tracks.ts"

# Step 3: Launch configuration tasks together (after Step 2)
Task: "Update wrangler.jsonc"
Task: "Set Cloudflare Secrets"
```

---

## Implementation Strategy

### MVP First (Minimal Deployment)

**Goal**: 快速驗證 Cloudflare Workers 部署與基本功能

**Scope**: Setup + Foundational + US1 + US3（基礎遷移 + CI/CD）

**Estimated Time**: 2-3 小時

**Tasks**: T001-T021

**Value**:

- ✅ 應用已部署至 Cloudflare Workers
- ✅ 全球 CDN 加速生效
- ✅ CI/CD 自動化流程就緒
- ✅ 所有現有功能正常運作

### Incremental Delivery

**Phase 1**: Foundation (Setup + Foundational)

- **Tasks**: T001-T008
- **Validation**: `npm run build` 成功，配置檔案就緒
- **Time**: 30 分鐘

**Phase 2**: Core Deployment (US1)

- **Tasks**: T009-T014
- **Validation**: 應用可從 `*.workers.dev` 存取，效能改善驗證
- **Time**: 1 小時
- **Deploy/Demo**: ✅ MVP ready!

**Phase 3**: Automation (US3)

- **Tasks**: T015-T021
- **Validation**: Cloudflare Git Integration 自動部署成功，PR 預覽環境生成
- **Time**: 1 小時
- **Deploy/Demo**: ✅ Full automation ready!

**Phase 4**: Monitoring (US2) - Optional

- **Tasks**: T022-T025
- **Validation**: 監控指標可查看，高可用性驗證
- **Time**: 30 分鐘
- **Deploy/Demo**: ✅ Production-ready monitoring

**Phase 5**: API Proxy (US4) - Optional

- **Tasks**: T026-T037
- **Validation**: Spotify API 代理運作，前端整合完成
- **Time**: 2-3 小時
- **Deploy/Demo**: ✅ Full feature with secure API integration

**Phase 6**: Polish

- **Tasks**: T038-T043
- **Validation**: 文件更新，舊設定清理
- **Time**: 30 分鐘
- **Deploy/Demo**: ✅ Production release

### Parallel Team Strategy

**Single Developer**: 按優先順序循序執行（Setup → Foundational → US1 → US3 → US2 → US4 → Polish）

**Two Developers**:

1. 共同完成 Setup + Foundational
2. Developer A: US1 + US3（核心部署 + CI/CD）
3. Developer B: US4（Spotify API 代理）- 可在 US1 完成後平行開始
4. 共同完成 US2 + Polish

**Three+ Developers**:

1. 共同完成 Setup + Foundational
2. Developer A: US1（核心部署）
3. Developer B: US3（CI/CD）- 需等待 US1 完成
4. Developer C: US4（API 代理）- 可與 US1 平行
5. Developer D: US2（監控）- 需等待 US1 完成
6. 共同完成 Polish

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable (except US3/US2 depend on US1)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **CI/CD 方式**: 採用 Cloudflare Git Integration（替代 GitHub Actions），配置更簡單且與 Cloudflare 生態整合更佳
- **Spotify API 憑證**: 透過 Cloudflare Dashboard 設定為「秘密」類型，永不 commit 到 git；本地開發使用 `.dev.vars`（不 commit）
- **測試策略**: 使用現有 Vitest + Playwright 測試套件驗證功能，無需新增測試任務
- **回滾機制**: 透過 Cloudflare Dashboard 部署歷史進行版本回滾，或使用 `wrangler rollback` 指令

### Task Estimation Summary

| Phase                  | Task Count   | Estimated Time |
| ---------------------- | ------------ | -------------- |
| Setup (Phase 1)        | 5 tasks      | 30 min         |
| Foundational (Phase 2) | 3 tasks      | 30 min         |
| US1 (Phase 3)          | 6 tasks      | 1 hour         |
| US3 (Phase 4)          | 7 tasks      | 1 hour         |
| US2 (Phase 5)          | 4 tasks      | 30 min         |
| US4 (Phase 6)          | 12 tasks     | 2-3 hours      |
| Polish (Phase 7)       | 6 tasks      | 30 min         |
| **Total**              | **43 tasks** | **6-7 hours**  |

**MVP Scope** (Setup + Foundational + US1 + US3): **21 tasks, 3 hours**

---

**Last Updated**: 2025-11-09
**Generated By**: `/speckit.tasks` command
**Status**: ✅ Ready for Implementation
