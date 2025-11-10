# Quickstart Guide: Cloudflare Workers 部署

**Feature**: 002-cloudflare
**Date**: 2025-11-09
**Audience**: 開發團隊

## Overview

本指南提供 Cloudflare Workers + Workers Assets 遷移的完整部署步驟、本地開發設定、疑難排解，以及驗收測試指引。

---

## Prerequisites

### Required Tools

| Tool               | Version   | Purpose             |
| ------------------ | --------- | ------------------- |
| Node.js            | 20.x      | Runtime environment |
| npm                | 10.x      | Package manager     |
| Git                | Latest    | Version control     |
| Cloudflare Account | Free Tier | Workers deployment  |
| GitHub Account     | -         | CI/CD integration   |

### Required Access

- ✅ Cloudflare account with Workers enabled
- ✅ GitHub repository admin access (for Secrets)
- ✅ Spotify Developer account (Client ID & Secret)

---

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
# Navigate to project root
cd /path/to/spotify-youtube-hits

# Install wrangler CLI
npm install -D wrangler

# Remove gh-pages (no longer needed)
npm uninstall gh-pages
```

### 2. Create Wrangler Configuration

Create `wrangler.jsonc` in project root:

```jsonc
{
  "name": "spotify-youtube-hits",
  "compatibility_date": "2025-01-09",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application",
  },
}
```

**Key Configuration**:

- `name`: Worker 名稱（會變成 `spotify-youtube-hits.workers.dev`）
- `not_found_handling`: SPA 路由支援（所有未匹配路由返回 index.html）

### 3. Update Vite Configuration

Edit `vite.config.ts`:

```typescript
export default defineConfig({
  base: "/", // 改為根路徑（從 '/spotify-youtube-hits/' 改為 '/'）
  plugins: [react(), tailwindcss(), svgr()],
  // ... rest of config
});
```

### 4. Update package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy:cf": "npm run build && wrangler deploy" // 新增
  }
}
```

### 5. Local Testing

```bash
# Build the project
npm run build

# Preview locally (Vite preview server)
npm run preview

# Or test with Wrangler (simulates Workers environment)
npx wrangler dev
```

---

## Cloudflare Setup (10 Minutes)

### Step 1: Create API Token

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **My Profile** → **API Tokens**
2. 點擊 **Create Token**
3. 選擇 **Custom Token**
4. 設定權限：
   - **Account** → **Cloudflare Workers** → **Edit**
5. 點擊 **Continue to Summary** → **Create Token**
6. **複製 Token**（只顯示一次！）

### Step 2: Get Account ID

在 Cloudflare Dashboard 右側欄位找到 **Account ID**，或從 URL 取得：

```plaintext
https://dash.cloudflare.com/<ACCOUNT_ID>/...
```

### Step 3: Set GitHub Secrets

1. 前往 GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. 點擊 **New repository secret**
3. 新增兩個 secrets：

   ```plaintext
   Name: CLOUDFLARE_API_TOKEN
   Value: <your-api-token>
   ```

   ```plaintext
   Name: CLOUDFLARE_ACCOUNT_ID
   Value: <your-account-id>
   ```

---

## CI/CD Setup (10 Minutes)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build project
        run: npm run build

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
```

**Workflow Behavior**:

- `push` to `main` → 部署到生產環境
- `pull_request` → 建立預覽環境（自動生成唯一 URL）

---

## Spotify API Proxy Setup (Phase 1.5 - Optional)

**Note**: 此階段實作伺服器端 API 代理，可在基礎遷移完成後進行。

### Step 1: Create Worker Script

Create `worker/index.ts`:

```typescript
import type { Fetcher } from "@cloudflare/workers-types";

interface Env {
  ASSETS: Fetcher;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API routes
    if (url.pathname.startsWith("/api/spotify/")) {
      return handleSpotifyAPI(request, env);
    }

    // Static assets (Workers Assets)
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function handleSpotifyAPI(request: Request, env: Env): Promise<Response> {
  // Implementation in tasks.md
  return new Response("TODO: Implement Spotify API proxy", { status: 501 });
}
```

### Step 2: Update wrangler.jsonc

```jsonc
{
  "name": "spotify-youtube-hits",
  "main": "worker/index.ts", // Add Worker entry point
  "compatibility_date": "2025-01-09",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application",
    "binding": "ASSETS", // Worker 中存取靜態資源的 binding
  },
}
```

### Step 3: Set Spotify Secrets

```bash
# Production environment
echo "your-client-id" | npx wrangler secret put SPOTIFY_CLIENT_ID
echo "your-client-secret" | npx wrangler secret put SPOTIFY_CLIENT_SECRET

# Local development (.dev.vars - NOT committed to git)
echo "SPOTIFY_CLIENT_ID=your-client-id" >> .dev.vars
echo "SPOTIFY_CLIENT_SECRET=your-client-secret" >> .dev.vars
```

### Step 4: Update .gitignore

```gitignore
# Cloudflare
.wrangler/
.dev.vars
```

---

## Local Development Workflow

### Development Server

```bash
# Standard Vite dev server (hot reload)
npm run dev

# Wrangler dev (simulates Workers environment)
npx wrangler dev
```

**When to use each**:

- `npm run dev`: 前端開發（React 元件、樣式）
- `wrangler dev`: 測試 Worker 邏輯（API 代理）

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

### Local Preview

```bash
# Build and preview
npm run build
npm run preview

# Or use Wrangler
npm run build
npx wrangler dev
```

---

## Deployment

### Manual Deployment

```bash
# Build and deploy
npm run deploy:cf

# Or step by step
npm run build
npx wrangler deploy
```

### Automatic Deployment (Recommended)

```bash
# Push to main branch
git add .
git commit -m "feat(cloudflare): migrate to Cloudflare Workers"
git push origin main

# GitHub Actions will automatically:
# 1. Run tests
# 2. Build project
# 3. Deploy to Cloudflare Workers
```

### Check Deployment Status

1. 前往 GitHub repo → **Actions** tab
2. 查看 "Deploy to Cloudflare Workers" workflow
3. 確認所有步驟都是綠色 ✅
4. 取得部署 URL（workflow output）

---

## Verification & Testing

### 1. Smoke Tests

After deployment, verify basic functionality:

```bash
# 1. Check homepage loads
curl https://spotify-youtube-hits.workers.dev/

# 2. Check static assets
curl https://spotify-youtube-hits.workers.dev/assets/index.js

# 3. Check JSON data
curl https://spotify-youtube-hits.workers.dev/data/tracks.json
```

**Expected**:

- ✅ 200 OK for all requests
- ✅ Content-Encoding: br or gzip (compression enabled)
- ✅ Cache-Control headers present

### 2. SPA Routing Test

```bash
# Direct access to client-side routes should return index.html
curl https://spotify-youtube-hits.workers.dev/track/0d28khcov6AiegSCpG5TuT

# Should return HTML (not 404)
```

### 3. Performance Testing

Use [WebPageTest](https://www.webpagetest.org/) or Chrome DevTools:

**Metrics to Verify**:

- ✅ TTFB < 100ms
- ✅ First Contentful Paint < 1.5s
- ✅ Largest Contentful Paint < 2.5s
- ✅ tracks.json compressed size ~2 MB (from 6.4 MB)

### 4. Browser Testing

**Checklist**:

- ✅ Homepage loads successfully
- ✅ Search functionality works
- ✅ Navigate to track detail page (test SPA routing)
- ✅ Navigate to artist page
- ✅ Charts display correctly
- ✅ No console errors

**Browsers**:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### 5. Geographic Testing

Use VPN or proxy to test from different regions:

**Locations**:

- ✅ Asia (Taiwan, Japan, Singapore)
- ✅ Europe (UK, Germany)
- ✅ Americas (US West, US East)

**Expected**:

- ✅ Fast loading from all regions (< 2s)
- ✅ No region-specific errors

---

## Monitoring

### Cloudflare Dashboard

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 選擇 **Workers & Pages**
3. 點擊 **spotify-youtube-hits**

**Available Metrics**:

- 📊 Requests per second
- ⏱️ Response time (P50, P95, P99)
- ❌ Error rate
- 🌍 Geographic distribution
- 📦 CDN cache hit rate

### Setting Up Alerts (Optional)

1. Dashboard → **Notifications**
2. Create new alert:
   - **Trigger**: Error rate > 5%
   - **Action**: Email notification

---

## Troubleshooting

### Issue: "wrangler: command not found"

**Solution**:

```bash
npm install -D wrangler
npx wrangler --version
```

### Issue: "Authentication error: [code: 10000]"

**Cause**: Invalid or expired API token

**Solution**:

1. 檢查 `CLOUDFLARE_API_TOKEN` secret 是否正確
2. 確認 token 權限包含 "Workers Edit"
3. 重新產生 token 並更新 secret

### Issue: "404 Not Found" for direct routes (e.g., /track/123)

**Cause**: `not_found_handling` 未設定為 `single-page-application`

**Solution**: 確認 `wrangler.jsonc` 包含：

```jsonc
{
  "assets": {
    "not_found_handling": "single-page-application",
  },
}
```

### Issue: GitHub Actions deployment fails

**Checklist**:

1. ✅ `CLOUDFLARE_API_TOKEN` secret 已設定
2. ✅ `CLOUDFLARE_ACCOUNT_ID` secret 已設定
3. ✅ `wrangler.jsonc` 存在於 repo root
4. ✅ `npm run build` 成功執行
5. ✅ `dist/` 目錄包含 build 產出

### Issue: "Missing environment variable: SPOTIFY_CLIENT_SECRET"

**Cause**: Worker secrets 未設定

**Solution**:

```bash
echo "your-secret" | npx wrangler secret put SPOTIFY_CLIENT_SECRET
```

---

## Rollback Procedure

### Manual Rollback

```bash
# View deployment history
npx wrangler deployments list

# Rollback to previous version
npx wrangler rollback

# Or rollback to specific version
npx wrangler rollback --version-id <version-id>
```

### Automatic Rollback (Future Enhancement)

**Not implemented in Phase 1**. See [research.md](./research.md) Section 6.2 for future implementation plan.

---

## Performance Optimization Tips

### 1. Monitor CDN Cache Hit Rate

**Target**: > 90%

**How to Check**: Cloudflare Dashboard → Workers → Analytics → Cache Hit Rate

**If < 90%**:

- Check `Cache-Control` headers
- Verify static assets have hash-based filenames

### 2. Optimize tracks.json

**Current**: 6.4 MB (uncompressed)

**Options**:

1. ✅ **Compression** (automatic): ~2 MB (Brotli/Gzip) ← **Phase 1**
2. ⏭️ **Pagination**: Split into smaller chunks ← **Future**
3. ⏭️ **CDN caching**: Store in Cloudflare KV ← **Future**

### 3. Code Splitting

**Current**: Vite automatic code splitting (manualChunks)

**Verify**:

```bash
npm run build
ls -lh dist/assets/*.js
```

**Expected**:

- `react-vendor-*.js` (React, React DOM)
- `redux-vendor-*.js` (Redux Toolkit, React Redux)
- `chart-vendor-*.js` (Recharts)

---

## Migration Checklist

### Pre-Migration

- [ ] Backup current deployment URL
- [ ] Test all features on GitHub Pages
- [ ] Create feature branch (`002-cloudflare`)

### Migration Steps

- [ ] Install wrangler
- [ ] Create wrangler.jsonc
- [ ] Update vite.config.ts
- [ ] Update package.json
- [ ] Create GitHub Actions workflow
- [ ] Set GitHub Secrets (API Token, Account ID)
- [ ] Update .gitignore
- [ ] Test locally (`wrangler dev`)
- [ ] Commit and push

### Post-Migration

- [ ] Verify GitHub Actions deployment success
- [ ] Test deployed application
- [ ] Verify SPA routing
- [ ] Test search functionality
- [ ] Test track detail pages
- [ ] Check performance metrics
- [ ] Disable GitHub Pages (Settings → Pages → Disable)
- [ ] Update README with new URL

### Spotify API Proxy (Phase 1.5)

- [ ] Create `worker/` directory
- [ ] Implement API proxy logic
- [ ] Update wrangler.jsonc (add `main`)
- [ ] Set Spotify secrets
- [ ] Update frontend API calls
- [ ] Test API proxy locally
- [ ] Deploy and verify

---

## Additional Resources

### Official Documentation

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Workers Assets Guide](https://developers.cloudflare.com/workers/static-assets/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions for Cloudflare](https://github.com/cloudflare/wrangler-action)

### Related Files

- [plan.md](./plan.md) - Implementation plan
- [research.md](./research.md) - Technical research
- [data-model.md](./data-model.md) - API data models
- [contracts/](./contracts/) - API specifications

### Support

- **Cloudflare Discord**: [discord.gg/cloudflaredev](https://discord.gg/cloudflaredev)
- **GitHub Issues**: Report bugs in this repo

---

**Last Updated**: 2025-11-09
**Maintainer**: Spotify YouTube Hits Team
**Status**: ✅ Ready for Implementation
