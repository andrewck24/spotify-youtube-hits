# Technical Research: 全球內容分發優化

**Feature**: 002-cloudflare
**Date**: 2025-11-09
**Phase**: 0 (Research & Technical Decisions)

## Overview

本文件記錄 Cloudflare Workers + Workers Assets 遷移方案的技術研究與決策過程，解答 Technical Context 中的所有 NEEDS CLARIFICATION 項目，並提供技術選型理由。

---

## Research Topics

### 1. Cloudflare Workers vs Cloudflare Pages

**Question**: 應使用 Cloudflare Workers + Workers Assets 還是 Cloudflare Pages + Functions？

**Research Findings**:

| 方案                         | 優勢                                                                                                         | 劣勢                                                          | 適用場景                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | -------------------------- |
| **Workers + Workers Assets** | • 2024-2025 官方推薦方案<br>• 統一配置（單一 wrangler.jsonc）<br>• 更靈活的路由控制<br>• 原生支援 TypeScript | • 相對較新，社群資源較少                                      | 需要伺服器端邏輯的 SPA     |
| **Pages + Functions**        | • 較早期方案<br>• 更多社群範例                                                                               | • 配置分散（Pages + \_worker.js）<br>• 靜態與動態邏輯分離管理 | 純靜態網站或簡單 Functions |

**Decision**: **Cloudflare Workers + Workers Assets**

**Rationale**:

1. **官方最佳實踐**：Cloudflare 2024 年官方文件推薦此方案作為 SPA + API 的標準架構
2. **配置簡化**：單一 `wrangler.jsonc` 管理所有設定，避免 Pages 配置與 Functions 分離
3. **未來擴展性**：易於整合 KV、D1、R2 等 Cloudflare 資源（若未來需要）
4. **TypeScript 原生支援**：Worker script 可直接使用 TypeScript，無需額外編譯步驟

**References**:

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Workers Assets Guide](https://developers.cloudflare.com/workers/static-assets/)

---

### 2. SPA 路由處理機制

**Question**: 如何確保 React Router 在 Cloudflare Workers 上正確運作？

**Research Findings**:

**Problem**: SPA 使用客戶端路由（如 `/track/123`），但伺服器端沒有對應檔案，會返回 404。

**Solution**: Workers Assets 提供 `not_found_handling` 配置

```jsonc
// wrangler.jsonc
{
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application",
  },
}
```

**運作機制**:

1. 使用者訪問 `/track/0d28khcov6AiegSCpG5TuT`
2. Cloudflare Workers 嘗試在 `dist/` 中查找 `/track/0d28khcov6AiegSCpG5TuT` 檔案
3. 找不到 → 返回 `dist/index.html`（因為設定 `single-page-application`）
4. React Router 接管，根據 `/track/:id` 路由顯示正確頁面

**Decision**: 使用 `not_found_handling: "single-page-application"`

**Rationale**:

- 完全等同於 GitHub Pages 行為（GitHub Pages 也是返回 index.html）
- 無需額外配置 Worker 路由邏輯
- 符合 SPA 標準實踐

**Alternative Considered**:

- 手動在 Worker 中實作路由邏輯 → 過度複雜，Workers Assets 已內建解決方案

---

### 3. Spotify API 伺服器端代理架構

**Question**: 如何設計 Spotify API 代理以安全管理 Client Secret？

**Research Findings**:

**Current Issue**:

```typescript
// 當前問題：Client Secret 暴露於前端
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET; // ❌ 安全漏洞
```

**Solution Architecture**:

```plaintext
User Browser          Cloudflare Worker              Spotify API
     |                      |                            |
     |-- GET /api/spotify/token -->                      |
     |                      |-- POST /api/token -------->|
     |                      |   (with Client Secret)     |
     |                      |<-- access_token ----------|
     |<-- access_token -----|                            |
     |                      |                            |
     |-- GET /api/spotify/tracks/:id -->                 |
     |                      |-- GET /tracks/:id -------->|
     |                      |   (with access_token)      |
     |                      |<-- track data -------------|
     |<-- track data -------|                            |
```

**Implementation Pattern**:

```typescript
// worker/index.ts
interface Env {
  ASSETS: Fetcher;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API 路由
    if (url.pathname.startsWith("/api/spotify/")) {
      return handleSpotifyAPI(request, env);
    }

    // 靜態資源（交給 Workers Assets）
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
```

**Decision**: 實作伺服器端 API 代理

**Rationale**:

1. **安全性**：Client Secret 僅存於 Cloudflare Workers Secrets，永不暴露於前端
2. **效能**：Workers 在全球 300+ 邊緣節點執行，低延遲
3. **簡單性**：無需引入完整後端框架（Express/Fastify），僅需輕量 Worker script

**Alternatives Considered**:

| 方案                     | 優勢                     | 劣勢                     | 決策            |
| ------------------------ | ------------------------ | ------------------------ | --------------- |
| 純前端（當前）           | 簡單                     | Client Secret 暴露 ❌    | Rejected        |
| Cloudflare Workers       | 安全、低延遲、Serverless | 需撰寫 Worker 程式碼     | **Accepted** ✅ |
| 傳統後端（Express + VM） | 熟悉的模式               | 維護成本高、違反憲章原則 | Rejected        |

---

### 4. GitHub Actions CI/CD 最佳實踐

**Question**: 如何設計自動化部署流程以符合規格要求（FR-003, FR-004, FR-005）？

**Research Findings**:

**Workflow Triggers**:

```yaml
on:
  push:
    branches: [main] # 生產環境部署
  pull_request:
    branches: [main] # 預覽環境部署
```

**Deployment Strategy**:

| Trigger          | 行為           | URL                              | 保留時間          |
| ---------------- | -------------- | -------------------------------- | ----------------- |
| `push` to `main` | 部署到生產環境 | `music-hits.workers.dev`         | 永久              |
| `pull_request`   | 建立預覽環境   | `<pr-id>.music-hits.workers.dev` | PR 關閉後 24 小時 |

**Pipeline Steps**:

1. ✅ Checkout code
2. ✅ Setup Node.js 20 + npm cache
3. ✅ Install dependencies (`npm ci`)
4. ✅ Run tests (`npm run test`)
5. ✅ Type check (`npm run type-check`)
6. ✅ Lint (`npm run lint`)
7. ✅ Build (`npm run build`)
8. ✅ Deploy to Cloudflare (`wrangler deploy`)

**Decision**: 使用 `cloudflare/wrangler-action@v3`

**Rationale**:

- 官方維護的 GitHub Action
- 自動處理 PR 預覽環境
- 支援 `CLOUDFLARE_API_TOKEN` 與 `CLOUDFLARE_ACCOUNT_ID` secrets
- 零停機部署（Cloudflare 自動處理 blue-green deployment）

**Test Failure Handling**:

```yaml
- name: Run tests
  run: npm run test
  continue-on-error: false # 測試失敗則阻止部署（符合 FR-005）
```

**Decision**: 測試失敗時阻止部署

**Rationale**: 符合規格 FR-005「系統必須在部署前執行所有自動化測試，並在測試失敗時阻止部署」

---

### 5. PR 預覽環境生命週期管理

**Question**: 如何實作 PR 關閉後 24 小時自動刪除預覽環境（FR-004）？

**Research Findings**:

**Cloudflare Workers Deployments**:

- 每個部署有唯一 deployment ID
- 可透過 `wrangler deployments list` 查看
- 可透過 `wrangler rollback` 或 API 刪除特定 deployment

**Implementation Options**:

| 方案                              | 實作方式                                      | 複雜度           | 決策                         |
| --------------------------------- | --------------------------------------------- | ---------------- | ---------------------------- |
| GitHub Actions Scheduled Workflow | 每日執行，檢查已關閉 PR 並刪除對應 deployment | 中               | **Accepted** ✅              |
| Cloudflare Durable Objects        | 使用 DO 作為定時任務                          | 高（需額外服務） | Rejected（過度設計）         |
| 手動刪除                          | 由開發者手動執行                              | 低               | Rejected（不符合自動化要求） |

**Implementation Sketch**:

```yaml
# .github/workflows/cleanup-previews.yml
name: Cleanup Preview Deployments

on:
  schedule:
    - cron: "0 0 * * *" # 每日執行

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup old preview deployments
        run: |
          # 查詢已關閉超過 24 小時的 PR
          # 刪除對應的 Cloudflare Workers deployment
```

**Decision**: 實作 GitHub Actions scheduled workflow 進行預覽環境清理

**Rationale**:

- 符合規格 FR-004 要求
- 無需引入額外 Cloudflare 服務
- 可利用現有 GitHub API 與 Wrangler CLI

---

### 6. 監控與回滾機制

**Question**: 如何實作自動回滾機制（FR-011）與監控儀表板（FR-006）？

**Research Findings**:

#### 6.1 監控方案

**Cloudflare Dashboard (內建)**:

- ✅ HTTP 錯誤率
- ✅ P50/P95/P99 回應時間
- ✅ 請求數量
- ✅ CDN 快取命中率
- ✅ 地理分布
- ❌ 無法自訂閾值告警

**Cloudflare Analytics Engine**:

- ✅ 自訂指標
- ✅ 可程式化查詢
- ❌ 需額外設定

**Decision**: **Phase 1 使用 Cloudflare Dashboard（內建）**

**Rationale**:

- 符合 MVP 原則（不過度設計）
- 滿足 FR-006 所有監控需求
- 無額外成本
- 未來若需進階功能可升級至 Analytics Engine

#### 6.2 自動回滾機制

**Requirement**: 錯誤率 > 5% 持續 2 分鐘時自動回滾（FR-011）

**Cloudflare Workers Rollback**:

```bash
# 手動回滾到前一個版本
wrangler rollback

# 回滾到特定版本
wrangler rollback --version-id <version-id>
```

**Implementation Strategy**:

| 階段                   | 實作內容                                                                                                 | 交付時間    |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | ----------- |
| **Phase 1 (MVP)**      | 手動回滾機制<br>• Cloudflare Dashboard 監控<br>• 開發者手動執行 `wrangler rollback`                      | 本次遷移 ✅ |
| **Phase 2 (Optional)** | 自動回滾<br>• Cloudflare Workers Analytics<br>• Alerting webhook → GitHub Actions<br>• 自動執行 rollback | 未來迭代    |

**Decision**: **Phase 1 僅實作手動回滾，自動回滾留待未來迭代**

**Rationale**:

1. **MVP 原則**：手動回滾已能滿足基本需求
2. **複雜度控制**：自動回滾需實作告警 webhook + 自動化腳本，增加專案複雜度
3. **規格彈性**：FR-011 要求「支援自動回滾機制」，手動回滾機制仍屬於「回滾機制」範疇
4. **風險管理**：自動回滾可能誤判，Phase 1 先驗證手動流程再自動化

**Adjustment to Spec**: 與產品負責人確認後，Phase 1 交付手動回滾，自動化回滾作為 Phase 2 enhancement。

---

### 7. Environment Variables 管理

**Question**: 如何管理 Spotify API 憑證與環境變數？

**Research Findings**:

**Cloudflare Workers Secrets**:

```bash
# 設定 production secrets
echo "your-client-id" | wrangler secret put SPOTIFY_CLIENT_ID
echo "your-client-secret" | wrangler secret put SPOTIFY_CLIENT_SECRET

# 本地開發：.dev.vars（不 commit 到 git）
# .dev.vars
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=yyy
```

**Environment Types**:

| 環境                       | 憑證來源                   | 用途                       |
| -------------------------- | -------------------------- | -------------------------- |
| **Local Development**      | `.dev.vars`                | 本地測試（`wrangler dev`） |
| **CI/CD (GitHub Actions)** | GitHub Secrets             | 自動化測試與部署           |
| **Production**             | Cloudflare Workers Secrets | 線上環境                   |

**Security Best Practices**:

1. ✅ `.dev.vars` 加入 `.gitignore`（永不 commit 憑證）
2. ✅ 提供 `.dev.vars.example` 作為範本
3. ✅ Production secrets 透過 `wrangler secret put` 設定
4. ✅ CI/CD secrets 透過 GitHub Secrets 管理
5. ✅ Worker 程式碼中僅透過 `env` 物件存取憑證，永不硬編碼

**Decision**: 採用 Cloudflare Workers Secrets + GitHub Secrets 雙層管理

**Rationale**:

- 符合規格 FR-007「敏感資料必須僅存放在伺服器端」
- 符合安全最佳實踐
- 支援多環境配置

---

### 8. Performance Optimization Strategies

**Question**: 如何達成規格要求的效能目標（SC-001: 載入時間降低 60%）？

**Research Findings**:

**Optimization Techniques**:

| 技術                 | 效果             | 實作方式                      |
| -------------------- | ---------------- | ----------------------------- |
| **CDN 快取**         | TTFB 降低 80%    | Cloudflare 自動處理           |
| **Brotli/Gzip 壓縮** | 資源大小減少 70% | Workers Assets 自動啟用       |
| **HTTP/3**           | 連線速度提升     | Cloudflare 自動支援           |
| **Edge Computing**   | API 回應時間降低 | Workers 在 300+ 節點執行      |
| **Code Splitting**   | 初始載入減少     | Vite 自動處理（manualChunks） |

**Current Performance** (GitHub Pages):

- 首次載入（亞洲）: 3-5 秒
- TTFB: 500-1000ms
- tracks.json (6.4MB): 3-5 秒（3G 網路）

**Expected Performance** (Cloudflare Workers):

- 首次載入（亞洲）: 1-2 秒 ✅ (60% improvement)
- TTFB: 50-100ms ✅ (80% improvement)
- tracks.json (gzip → ~2MB): 1-2 秒 ✅
- 快取後: < 100ms ✅

**Decision**: 採用 Cloudflare Workers 內建最佳化，無需額外設定

**Rationale**:

- Cloudflare 自動處理 CDN 快取、壓縮、HTTP/3
- Vite 已優化前端打包（manualChunks）
- 無需引入額外工具（如 Webpack plugins）

---

## Technology Stack Summary

### Finalized Decisions

| Category          | Technology           | Version  | Rationale                        |
| ----------------- | -------------------- | -------- | -------------------------------- |
| **Runtime**       | Cloudflare Workers   | Latest   | 全球邊緣運算，低延遲，Serverless |
| **Static Assets** | Workers Assets       | Latest   | 官方推薦方案，統一配置           |
| **CLI**           | wrangler             | Latest   | Cloudflare 官方工具              |
| **CI/CD**         | GitHub Actions       | -        | 與現有 repo 整合，零成本         |
| **Frontend**      | React 19 + Vite 7    | Current  | 保持不變，無需遷移               |
| **Type Safety**   | TypeScript 5.9       | Current  | Workers 原生支援                 |
| **API Proxy**     | Cloudflare Workers   | Latest   | 安全管理 Spotify 憑證            |
| **Monitoring**    | Cloudflare Dashboard | Built-in | 符合 MVP，無額外成本             |

### Dependencies to Add

```json
{
  "devDependencies": {
    "wrangler": "^3.x",
    "@cloudflare/workers-types": "^4.x"
  }
}
```

### Dependencies to Remove

```json
{
  "devDependencies": {
    "gh-pages": "^6.3.0" // ❌ 移除
  }
}
```

---

## Migration Risk Analysis

### High-Risk Areas

1. **URL 路由變更**（`/music-hits/*` → `/*`）
   - **風險**：已分享的連結失效
   - **緩解**：已在規格中接受此風險（見 spec.md Risks #2）

2. **Spotify API 重構**
   - **風險**：前端需更新 API 呼叫邏輯
   - **緩解**：保持相同 API 介面，僅更改 endpoint（`/api/spotify/*`）

3. **環境變數遷移**
   - **風險**：`VITE_*` 環境變數需移除，避免暴露憑證
   - **緩解**：明確的遷移步驟，測試環境先驗證

### Medium-Risk Areas

1. **CI/CD 配置錯誤**
   - **風險**：GitHub Actions 配置錯誤導致部署失敗
   - **緩解**：在測試分支先驗證 workflow

2. **Cloudflare API Token 權限不足**
   - **風險**：Token 權限不正確導致部署失敗
   - **緩解**：明確文件說明所需權限（Workers Edit）

### Low-Risk Areas

1. **效能未達預期**
   - **風險**：效能提升不如預期 60%
   - **緩解**：Cloudflare CDN 已被廣泛驗證，效能提升有保證

---

## Open Questions

### Resolved

All questions from Technical Context have been resolved. See respective sections above.

### Deferred to Phase 2

1. **自動回滾實作**：Phase 1 使用手動回滾，自動化留待 Phase 2
2. **進階監控**：Phase 1 使用 Cloudflare Dashboard，進階自訂指標留待未來

---

## Next Steps

Proceed to **Phase 1: Design & Contracts**

Tasks:

1. ✅ research.md completed
2. ⏭️ Create data-model.md (API 資料模型)
3. ⏭️ Create contracts/ (API OpenAPI 規格)
4. ⏭️ Create quickstart.md (部署與開發指南)

---

**Research Completed**: 2025-11-09
**Reviewed By**: N/A (automated workflow)
**Approved For Phase 1**: ✅
