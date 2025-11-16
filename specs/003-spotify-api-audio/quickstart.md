# Quick Start: Audio Features Data Migration - ReccoBeats Integration

**Feature**: Audio Features Data Migration
**Branch**: `003-spotify-api-audio`
**Date**: 2025-11-13

## Overview

本指南提供快速開始實作音樂特徵資料遷移的步驟。將音樂特徵資料來源從已廢棄的 Spotify Audio Features API 遷移至 ReccoBeats API，並移除未使用的批次查詢功能。

## Prerequisites

在開始之前，確認以下前置條件：

- ✅ Node.js 18+ 安裝
- ✅ 專案已 clone 至本地：`/Users/andrew/projects/music-hits`
- ✅ 依賴已安裝：`npm install`
- ✅ Cloudflare Wrangler CLI 已安裝（透過 `npm install` 自動安裝）
- ✅ 已切換到功能分支：`git checkout 003-spotify-api-audio`

## Step 1: 了解目前的架構

### 檢查現有程式碼

```bash
# 檢查 Worker API 端點
cat worker/index.ts | grep -A 20 "audio-features"

# 檢查前端服務
cat src/services/spotify-api.ts | grep -A 10 "getAudioFeatures"

# 檢查型別定義
cat src/types/spotify.ts | grep -A 15 "SpotifyAudioFeatures"
```

### 檢查批次功能使用情況

```bash
# 搜尋批次功能的引用
grep -r "getAudioFeaturesBatch" src/
grep -r "?ids=" worker/
```

**預期結果**: 應該不會找到任何使用批次功能的程式碼。

## Step 2: 更新 Worker API 端點

### 2.1 修改 audio-features 路由

**檔案**: `worker/index.ts`

**位置**: 約第 193-240 行（單一查詢路由）

**變更**:

```typescript
// 修改前：呼叫 Spotify API
const spotifyUrl = `https://api.spotify.com/v1/audio-features/${id}`;

// 修改後：呼叫 ReccoBeats API
const reccobeatsUrl = `https://api.reccobeats.com/v1/audio-features?ids=${id}`;
```

### 2.2 移除批次查詢路由

**檔案**: `worker/index.ts`

**位置**: 約第 241-319 行（批次查詢路由）

**操作**: 完全刪除整個路由處理器

```typescript
// 刪除以下程式碼塊：
// app.get("/api/spotify/audio-features", async (c) => {
//   ... 批次查詢邏輯 ...
// });
```

### 2.3 更新錯誤處理

新增 429 錯誤的重試機制（Exponential Backoff）：

```typescript
// 參考 research.md 中的 fetchWithRetry 實作
async function fetchWithRetry(url: string, maxRetries: number = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const delay = retryAfter
        ? parseInt(retryAfter) * 1000
        : Math.pow(2, i) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    return response;
  }

  throw new Error("Max retries exceeded");
}
```

## Step 3: 更新前端型別與服務

### 3.1 簡化型別定義

**檔案**: `src/types/spotify.ts`

**操作**: 移除未使用的欄位（參考 research.md 決策 A）

```typescript
// 選項：簡化為僅包含 ReccoBeats 提供的 9 個欄位
export interface AudioFeatures {
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  tempo: number;
  valence: number;
}
```

### 3.2 移除批次查詢方法

**檔案**: `src/services/spotify-api.ts`

**操作**: 刪除 `getAudioFeaturesBatch` 方法（約第 169-221 行）

**檔案**: `src/types/spotify.ts`

**操作**: 刪除 `getAudioFeaturesBatch` 介面定義

## Step 4: 本地測試

### 4.1 啟動 Wrangler 開發伺服器

```bash
# 確保 .dev.vars 檔案存在（Spotify credentials 仍需用於其他 API）
cp .dev.vars.example .dev.vars

# 編輯 .dev.vars 填入必要的環境變數
# 注意：ReccoBeats 不需要認證，但保留 SPOTIFY_* 供其他 API 使用

# 啟動 Worker 開發伺服器
npx wrangler dev
```

### 4.2 測試單一查詢

```bash
# 測試有效的 Track ID
curl http://localhost:8787/api/spotify/audio-features/06HL4z0CvFAxyc27GXpf02

# 預期回應：200 OK，包含 9 個音樂特徵欄位
```

### 4.3 測試錯誤處理

```bash
# 測試無效的 Track ID（格式錯誤）
curl http://localhost:8787/api/spotify/audio-features/invalid-id

# 預期回應：400 Bad Request

# 測試不存在的 Track ID
curl http://localhost:8787/api/spotify/audio-features/aaaaaaaaaaaaaaaaaaaaaa

# 預期回應：404 Not Found（ReccoBeats 無資料）
```

### 4.4 測試前端整合

```bash
# 在另一個 terminal 啟動前端開發伺服器
npm run dev

# 訪問歌曲詳情頁面
# http://localhost:5173/track/0V3wPSX9ygBnCm8psDIegu

# 檢查：
# 1. Network tab 確認呼叫 /api/spotify/audio-features/:id
# 2. 雷達圖正常顯示 7 個音樂特徵
# 3. tempo 數值正常顯示
```

## Step 5: 執行測試

### 5.1 型別檢查

```bash
npm run type-check
```

**預期結果**: 無型別錯誤

### 5.2 單元測試

```bash
# 更新 spotify-api.test.ts 移除批次測試註解
# 新增 ReccoBeats API mock

npm run test
```

### 5.3 E2E 測試

```bash
# 確保 Worker 和前端都在執行
npx wrangler dev &
npm run dev &

# 執行 E2E 測試
npm run test:e2e
```

## Step 6: 驗證清理完成

### 6.1 確認批次功能已完全移除

```bash
# 搜尋殘留的批次功能程式碼
grep -r "getAudioFeaturesBatch" src/ tests/
grep -r "?ids=" worker/

# 預期結果：無結果（或只有在 .specify/ 文件中的參考）
```

### 6.2 檢查 git 變更

```bash
git status
git diff
```

**預期變更**:

- `worker/index.ts`: 修改單一查詢路由、刪除批次路由
- `src/services/spotify-api.ts`: 刪除 `getAudioFeaturesBatch` 方法
- `src/types/spotify.ts`: 簡化型別定義、刪除批次介面
- `tests/unit/services/spotify-api.test.ts`: 移除批次測試註解

## Step 7: 部署至 Cloudflare Workers

### 7.1 建置專案

```bash
npm run build
```

**預期結果**: 建置成功，無錯誤

### 7.2 部署 Worker

```bash
npm run deploy:cf
```

或直接使用 wrangler：

```bash
npx wrangler deploy
```

### 7.3 驗證線上環境

```bash
# 測試線上 Worker API
curl https://music-hits.andrewck24.workers.dev/api/spotify/audio-features/06HL4z0CvFAxyc27GXpf02

# 訪問線上應用
# https://music-hits.andrewck24.workers.dev/track/0V3wPSX9ygBnCm8psDIegu
```

## Troubleshooting

### 問題 1: ReccoBeats API 返回 404

**可能原因**: ReccoBeats 沒有該歌曲的音樂特徵資料

**解決方法**:

- 確認 Track ID 正確
- 嘗試使用其他常見歌曲的 Track ID（如 "06HL4z0CvFAxyc27GXpf02"）
- 確認 ReccoBeats API 服務正常（訪問 [reccobeats](https://reccobeats.com)）

### 問題 2: Worker 返回 429 錯誤

**可能原因**: 超過 ReccoBeats API 速率限制

**解決方法**:

- 確認重試機制已實作（`fetchWithRetry`）
- 檢查 `Retry-After` header 並等待指定時間
- 減少測試請求頻率

### 問題 3: 前端雷達圖不顯示

**可能原因**: 型別定義不匹配或資料格式錯誤

**解決方法**:

- 檢查 Network tab 確認 API 回應格式
- 確認 `AudioFeatures` 型別包含所有必要欄位
- 檢查 `FeatureChart` 元件使用的欄位與型別定義一致

### 問題 4: TypeScript 型別錯誤

**可能原因**: 移除批次功能後型別定義不一致

**解決方法**:

```bash
# 執行型別檢查查看詳細錯誤
npm run type-check

# 確認所有引用批次功能的程式碼已移除
grep -r "getAudioFeaturesBatch" src/
```

## Next Steps

完成本快速開始指南後：

1. ✅ 執行 `/speckit.tasks` 產生詳細的實作任務清單
2. ✅ 根據任務清單逐一實作 US1 (P1) 和 US2 (P2)
3. ✅ 每個任務完成後建立 git commit（遵循 Angular Commit Convention）
4. ✅ 所有任務完成後建立 Pull Request
5. ✅ PR 通過審查後 merge 到 main 分支

## Reference

- [spec.md](./spec.md) - 功能規格
- [plan.md](./plan.md) - 實作計劃
- [research.md](./research.md) - 技術研究
- [data-model.md](./data-model.md) - 資料模型
- [contracts/worker-audio-features-api.yaml](./contracts/worker-audio-features-api.yaml) - API 契約
- [ReccoBeats API 文件](https://reccobeats.com/docs/apis/get-audio-features) - 外部 API 參考
