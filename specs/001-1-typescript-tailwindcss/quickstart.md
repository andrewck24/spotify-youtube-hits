# 快速開始指南：技術棧現代化重構

**版本**: 1.0.0
**建立日期**: 2025-10-08
**適用對象**: 參與此重構專案的開發者

## 目錄

- [專案概述](#專案概述)
- [前置需求](#前置需求)
- [環境設定](#環境設定)
- [專案初始化](#專案初始化)
- [開發工作流程](#開發工作流程)
- [目錄結構導覽](#目錄結構導覽)
- [常用指令參考](#常用指令參考)
- [除錯與疑難排解](#除錯與疑難排解)
- [部署流程](#部署流程)
- [相關文件](#相關文件)

---

## 專案概述

本專案將現有的 Spotify YouTube Hits 應用從 **JavaScript + Emotion + Recoil** 技術棧重構為 **TypeScript + Tailwind CSS 4.x + Redux Toolkit**，並採用現代化的 Dashboard 設計風格。

### 核心技術棧

| 類別           | 技術                              | 版本    |
| -------------- | --------------------------------- | ------- |
| 語言           | TypeScript                        | 5.x     |
| 框架           | React                             | 19.2.0  |
| 建置工具       | Vite                              | 7.x     |
| 樣式           | Tailwind CSS                      | 4.x     |
| 元件庫         | shadcn/ui (Radix UI)              | latest  |
| 狀態管理       | Redux Toolkit                     | 2.x     |
| 圖表           | Recharts                          | 3.x     |
| 搜尋引擎       | Fuse.js                           | 7.x     |
| 型別驗證       | Zod                               | latest  |
| 程式碼檢查     | ESLint + typescript-eslint        | 9.x     |
| 格式化         | Prettier (via ESLint integration) | latest  |

### 設計原則

根據 [constitution.md](../../.specify/memory/constitution.md)：

1. **TypeScript 最佳實踐**：嚴格型別、路徑別名、100% 型別覆蓋
2. **MVP 優先**：先完成核心功能，避免過度設計
3. **可測試性**：關注點分離、純函數、dependency injection
4. **靜態部署**：保持 GitHub Pages 相容性
5. **命名與文件**：程式碼用英文、文件用繁體中文

---

## 前置需求

### 必要工具

- **Node.js**: >= 20.x (建議使用 LTS 版本)
- **npm**: >= 10.x (或 pnpm >= 9.x、yarn >= 4.x)
- **Git**: >= 2.40
- **VS Code**: 最新版本（建議）

### 推薦的 VS Code 擴充套件

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss", // Tailwind CSS IntelliSense
    "dbaeumer.vscode-eslint", // ESLint
    "esbenp.prettier-vscode", // Prettier
    "styled-components.vscode-styled-components", // CSS syntax highlighting
    "formulahendry.auto-rename-tag", // Auto rename paired HTML/JSX tag
    "dsznajder.es7-react-js-snippets" // React snippets
  ]
}
```

### Spotify API 金鑰

你需要 Spotify Developer 帳號與 API 金鑰：

1. 前往 [Spotify for Developers](https://developer.spotify.com/dashboard)
2. 建立新的 App
3. 取得 **Client ID** 與 **Client Secret**
4. 將金鑰儲存至 `.env.local` (見下方設定)

---

## 環境設定

### 1. Clone 專案

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/spotify-youtube-hits.git
cd spotify-youtube-hits

# 切換到重構分支
git checkout 001-1-typescript-tailwindcss
```

### 2. 安裝依賴

```bash
# 使用 npm
npm install

# 或使用 pnpm (推薦，速度更快)
pnpm install

# 或使用 yarn
yarn install
```

### 3. 設定環境變數

建立 `.env.local` 檔案（不會被 Git 追蹤）：

```env
# Spotify API Credentials (Client Credentials Flow)
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here

# Optional: Data version (default: auto-detect)
VITE_DATA_VERSION=2023.1

# Optional: Debug mode
VITE_DEBUG=false
```

⚠️ **安全注意事項**：
- `.env.local` 已加入 `.gitignore`，不會被提交
- **絕對不要**將 API 金鑰提交至 Git
- 在生產環境使用環境變數管理工具（如 GitHub Secrets）

### 4. 驗證安裝

```bash
# 檢查 Node.js 版本
node -v  # 應顯示 v20.x.x 或更高

# 檢查 npm 版本
npm -v   # 應顯示 v10.x.x 或更高

# 檢查 TypeScript 設定
npx tsc --noEmit  # 應無錯誤

# 檢查 ESLint 設定
npx eslint . --ext .ts,.tsx  # 應無錯誤
```

---

## 專案初始化

### 初次執行步驟

```bash
# 1. 安裝依賴
npm install

# 2. 建立環境變數檔案
cp .env.example .env.local
# 編輯 .env.local，填入你的 Spotify API 金鑰

# 3. 驗證資料檔案
npm run validate:data  # 檢查 public/data/tracks.json 格式

# 4. 啟動開發伺服器
npm run dev
```

開發伺服器啟動後，開啟瀏覽器前往 `http://localhost:5173`。

### 初次啟動檢查清單

- [ ] 開發伺服器正常啟動（無紅字錯誤）
- [ ] 瀏覽器顯示 Dashboard 介面
- [ ] 搜尋列可輸入文字
- [ ] 資料載入進度顯示正常
- [ ] 搜尋功能運作正常（輸入藝人名稱顯示結果）
- [ ] 點擊藝人後顯示歌曲清單
- [ ] 點擊歌曲後顯示詳細資訊與圖表
- [ ] 瀏覽器 Console 無錯誤訊息
- [ ] React DevTools 正常運作

---

## 開發工作流程

### 日常開發流程

```bash
# 1. 啟動開發伺服器（支援 HMR）
npm run dev

# 2. 開啟另一個終端機，執行型別檢查（監聽模式）
npm run type-check:watch

# 3. 開始開發 🚀
# 編輯 src/ 中的檔案，瀏覽器會自動重新載入
```

### 新增功能流程

```bash
# 1. 建立功能分支
git checkout -b feature/your-feature-name

# 2. 閱讀相關文件
# - specs/001-1-typescript-tailwindcss/spec.md (功能規格)
# - specs/001-1-typescript-tailwindcss/data-model.md (資料模型)
# - specs/001-1-typescript-tailwindcss/contracts/ (API 合約)

# 3. 建立型別定義 (如果需要新的 API 或資料結構)
# 編輯 src/types/ 或 contracts/

# 4. 實作功能
# 按照目錄結構組織程式碼：
# - Redux slice: src/features/{feature-name}/{feature-name}-slice.ts
# - UI 元件: src/components/{feature-name}/
# - Service: src/services/

# 5. 本地測試
npm run dev  # 手動測試
npm run type-check  # TypeScript 型別檢查
npm run lint  # ESLint 檢查

# 6. 提交變更
git add .
git commit -m "feat(scope): add your feature"

# 7. 推送並建立 PR
git push origin feature/your-feature-name
```

### 修復 Bug 流程

```bash
# 1. 建立 bugfix 分支
git checkout -b fix/bug-description

# 2. 重現問題
# - 在瀏覽器中重現 bug
# - 檢查 Console 錯誤訊息
# - 檢查 Redux DevTools 狀態

# 3. 修復問題

# 4. 驗證修復
# - 確認 bug 不再出現
# - 檢查無新增錯誤

# 5. 提交
git commit -m "fix(scope): fix bug description"
```

---

## 目錄結構導覽

### 完整目錄結構

```text
spotify-youtube-hits/
├── public/                          # 靜態資源（不經過 Vite 處理）
│   ├── data/
│   │   └── tracks.json              # 5.5MB 歌曲資料庫 (2023 年快照)
│   └── index.html
│
├── src/                             # 原始碼目錄
│   ├── app/                         # 應用程式進入點
│   │   ├── App.tsx                  # 主應用元件
│   │   ├── store.ts                 # Redux store 配置
│   │   └── router.tsx               # 路由配置 (未來擴展)
│   │
│   ├── features/                    # 功能模組 (Redux Toolkit slices)
│   │   ├── artist/
│   │   │   ├── artist-slice.ts      # Redux slice
│   │   │   ├── artist-selectors.ts  # Reselect selectors
│   │   │   └── artist-types.ts      # TypeScript types
│   │   ├── track/
│   │   │   ├── track-slice.ts
│   │   │   ├── track-selectors.ts
│   │   │   └── track-types.ts
│   │   ├── search/
│   │   │   ├── search-slice.ts
│   │   │   ├── search-service.ts    # Fuse.js 搜尋引擎
│   │   │   └── search-types.ts
│   │   ├── data/
│   │   │   ├── data-slice.ts        # 資料載入狀態管理
│   │   │   └── data-types.ts
│   │   └── spotify/
│   │       ├── spotify-slice.ts     # Spotify API token 管理
│   │       └── spotify-types.ts
│   │
│   ├── components/                  # UI 元件
│   │   ├── ui/                      # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── spinner.tsx
│   │   │   └── chart.tsx
│   │   ├── layout/                  # 布局元件
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   ├── artist/                  # 藝人相關元件
│   │   │   ├── artist-profile.tsx
│   │   │   └── artist-list.tsx
│   │   ├── track/                   # 歌曲相關元件
│   │   │   ├── track-detail.tsx
│   │   │   ├── track-list.tsx
│   │   │   ├── popularity-chart.tsx
│   │   │   └── feature-chart.tsx
│   │   └── search/                  # 搜尋元件
│   │       ├── search-bar.tsx
│   │       └── search-results.tsx
│   │
│   ├── services/                    # API 與資料服務
│   │   ├── spotify-api.ts           # Spotify API 呼叫 (實作 ISpotifyApiService)
│   │   ├── data-loader.ts           # JSON 資料載入 + sessionStorage cache
│   │   └── storage.ts               # sessionStorage wrapper
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-artist.ts
│   │   ├── use-track.ts
│   │   ├── use-search.ts
│   │   └── use-data-loader.ts
│   │
│   ├── lib/                         # 工具函式
│   │   ├── utils.ts                 # shadcn/ui utils (cn helper)
│   │   ├── formatters.ts            # 時間/數字格式化
│   │   └── constants.ts             # 常數定義
│   │
│   ├── types/                       # 全域 TypeScript types
│   │   ├── index.ts
│   │   ├── artist.ts
│   │   ├── track.ts
│   │   └── spotify.ts
│   │
│   ├── styles/                      # 全域樣式
│   │   └── globals.css              # Tailwind CSS 4.x + Spotify theme
│   │
│   └── main.tsx                     # Vite 進入點
│
├── specs/                           # 規格文件
│   └── 001-1-typescript-tailwindcss/
│       ├── spec.md                  # 功能規格
│       ├── plan.md                  # 實作計畫
│       ├── research.md              # 技術研究
│       ├── data-model.md            # 資料模型
│       ├── quickstart.md            # 本文件
│       ├── checklists/
│       │   └── requirements.md
│       └── contracts/               # API 合約
│           ├── README.md
│           ├── spotify-api.ts
│           └── tracks-data-schema.ts
│
├── config/                          # 設定檔
│   ├── tailwind.config.ts           # Tailwind CSS 4.x (minimal config)
│   ├── tsconfig.json                # TypeScript 設定
│   ├── vite.config.ts               # Vite 設定
│   └── eslint.config.js             # ESLint 9.x flat config
│
├── .env.example                     # 環境變數範例
├── .env.local                       # 環境變數 (不會被 Git 追蹤)
├── .gitignore
├── package.json
└── README.md
```

### 關鍵目錄說明

#### `src/features/` - Redux Toolkit Slices

每個 feature 包含：

- **{feature}-slice.ts**: Redux slice 定義（state, reducers, async thunks）
- **{feature}-selectors.ts**: Reselect selectors（memoized 查詢）
- **{feature}-types.ts**: TypeScript 型別定義

範例：`src/features/artist/artist-slice.ts`

```typescript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { SpotifyArtist } from "@contracts/spotify-api"
import { spotifyApi } from "@/services/spotify-api"

interface ArtistState {
  currentArtist: SpotifyArtist | null
  loading: boolean
  error: string | null
}

const initialState: ArtistState = {
  currentArtist: null,
  loading: false,
  error: null,
}

export const fetchArtist = createAsyncThunk(
  "artist/fetchArtist",
  async (artistId: string) => {
    return await spotifyApi.getArtist(artistId)
  }
)

const artistSlice = createSlice({
  name: "artist",
  initialState,
  reducers: {
    clearArtist: (state) => {
      state.currentArtist = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchArtist.fulfilled, (state, action) => {
        state.loading = false
        state.currentArtist = action.payload
      })
      .addCase(fetchArtist.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch artist"
      })
  },
})

export const { clearArtist } = artistSlice.actions
export default artistSlice.reducer
```

#### `src/components/` - UI 元件

採用 Atomic Design 概念：

- **ui/**: shadcn/ui base components（Button, Card, Input 等）
- **layout/**: 布局元件（DashboardLayout, Sidebar, Header）
- **domain-specific**: 功能專屬元件（artist/, track/, search/）

範例：`src/components/artist/artist-profile.tsx`

```tsx
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import type { SpotifyArtist } from "@contracts/spotify-api"

interface ArtistProfileProps {
  artist: SpotifyArtist
}

export function ArtistProfile({ artist }: ArtistProfileProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Avatar src={artist.images[0]?.url} alt={artist.name} size="lg" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">{artist.name}</h2>
          <p className="text-sm text-muted-foreground">
            {artist.followers.total.toLocaleString()} followers
          </p>
        </div>
      </div>
    </Card>
  )
}
```

#### `src/services/` - 資料服務層

所有 API 呼叫與資料載入邏輯，與 UI 完全分離。

範例：`src/services/spotify-api.ts`

```typescript
import type { ISpotifyApiService, SpotifyArtist } from "@contracts/spotify-api"

class SpotifyApiService implements ISpotifyApiService {
  private token: string | null = null

  async initialize(): Promise<void> {
    // 實作 Client Credentials Flow
  }

  async getArtist(artistId: string): Promise<SpotifyArtist> {
    // 實作 API 呼叫
  }

  // ... 其他方法實作
}

export const spotifyApi = new SpotifyApiService()
```

#### `src/hooks/` - Custom Hooks

封裝業務邏輯，簡化元件程式碼。

範例：`src/hooks/use-artist.ts`

```typescript
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/store"
import { fetchArtist } from "@/features/artist/artist-slice"
import { selectCurrentArtist, selectArtistLoading } from "@/features/artist/artist-selectors"

export function useArtist(artistId: string | null) {
  const dispatch = useAppDispatch()
  const artist = useAppSelector(selectCurrentArtist)
  const loading = useAppSelector(selectArtistLoading)

  useEffect(() => {
    if (artistId) {
      dispatch(fetchArtist(artistId))
    }
  }, [artistId, dispatch])

  return { artist, loading }
}
```

---

## 常用指令參考

### 開發指令

```bash
# 啟動開發伺服器 (HMR + Fast Refresh)
npm run dev

# 型別檢查（不產生輸出檔案）
npm run type-check

# 型別檢查（監聽模式）
npm run type-check:watch

# ESLint 檢查
npm run lint

# ESLint 自動修復
npm run lint:fix

# 格式化程式碼 (Prettier)
npm run format
```

### 建置指令

```bash
# 建置生產版本
npm run build

# 預覽建置結果
npm run preview

# 建置 + 型別檢查
npm run build:check
```

### 資料驗證指令

```bash
# 驗證 tracks.json 格式
npm run validate:data

# 檢查資料完整性
npm run check:data-integrity

# 產生資料統計報告
npm run data:stats
```

### 測試指令 (未來實作)

```bash
# 執行單元測試
npm run test

# 測試覆蓋率
npm run test:coverage

# 測試監聽模式
npm run test:watch
```

---

## 除錯與疑難排解

### 常見問題

#### 1. **開發伺服器無法啟動**

**錯誤訊息**：`Error: Cannot find module 'vite'`

**解決方案**：

```bash
# 刪除 node_modules 與 lock 檔案
rm -rf node_modules package-lock.json

# 重新安裝
npm install

# 清除 Vite cache
rm -rf node_modules/.vite
```

#### 2. **TypeScript 型別錯誤**

**錯誤訊息**：`Cannot find name 'SpotifyArtist'`

**解決方案**：

```bash
# 檢查路徑別名設定
cat tsconfig.json | grep "paths"

# 重新啟動 TypeScript Server (VS Code)
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# 驗證型別定義
npx tsc --noEmit
```

#### 3. **Spotify API 401 錯誤**

**錯誤訊息**：`401 Unauthorized`

**解決方案**：

```bash
# 1. 檢查環境變數
cat .env.local

# 2. 確認 Client ID 與 Secret 正確
# 前往 https://developer.spotify.com/dashboard 檢查

# 3. 重新啟動開發伺服器
npm run dev
```

#### 4. **搜尋功能無作用**

**症狀**：輸入文字後無搜尋結果

**除錯步驟**：

```bash
# 1. 檢查資料是否正確載入
# 開啟瀏覽器 Console，查看 Redux DevTools

# 2. 檢查 Fuse.js 索引是否建立
# Console 應顯示 "Search index created with X tracks"

# 3. 檢查 searchSlice 狀態
# Redux DevTools → State → search.results
```

#### 5. **Tailwind CSS 樣式未生效**

**症狀**：`className` 無樣式

**解決方案**：

```bash
# 1. 檢查 Tailwind CSS 設定
cat src/styles/globals.css

# 2. 確認 @tailwindcss/vite plugin 已載入
cat vite.config.ts

# 3. 重新啟動開發伺服器
npm run dev

# 4. 清除 Vite cache
rm -rf node_modules/.vite
```

### 除錯工具

#### 1. **Redux DevTools**

安裝瀏覽器擴充套件：[Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

使用方式：

- 開啟瀏覽器開發者工具 → Redux 分頁
- 查看 State、Actions、Diff

#### 2. **React DevTools**

安裝瀏覽器擴充套件：[React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

使用方式：

- 開啟瀏覽器開發者工具 → Components 分頁
- 檢查元件樹與 props

#### 3. **Vite 內建除錯**

```bash
# 顯示詳細 log
DEBUG=vite:* npm run dev

# 僅顯示特定模組 log
DEBUG=vite:transform npm run dev
```

---

## 部署流程

### GitHub Pages 部署

本專案使用 GitHub Actions 自動部署至 GitHub Pages。

#### 1. 設定 GitHub Repository

```bash
# 1. 在 GitHub 建立 repository
# 2. 前往 Settings → Pages
# 3. Source: GitHub Actions

# 4. 設定 Secrets (Settings → Secrets → Actions)
# 新增以下 secrets:
# - VITE_SPOTIFY_CLIENT_ID
# - VITE_SPOTIFY_CLIENT_SECRET
```

#### 2. 手動部署

```bash
# 建置生產版本
npm run build

# 預覽建置結果（可選）
npm run preview

# 部署至 GitHub Pages (使用 gh-pages 套件)
npm run deploy
```

`package.json` 範例：

```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

#### 3. 自動部署 (GitHub Actions)

建立 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          VITE_SPOTIFY_CLIENT_ID: ${{ secrets.VITE_SPOTIFY_CLIENT_ID }}
          VITE_SPOTIFY_CLIENT_SECRET: ${{ secrets.VITE_SPOTIFY_CLIENT_SECRET }}

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 相關文件

### 規格與設計文件

- [spec.md](./spec.md) - 功能規格文件
- [plan.md](./plan.md) - 實作計畫
- [research.md](./research.md) - 技術研究與決策
- [data-model.md](./data-model.md) - 資料模型定義
- [constitution.md](../../.specify/memory/constitution.md) - 專案憲章

### API 合約文件

- [contracts/README.md](./contracts/README.md) - API 合約概述
- [contracts/spotify-api.ts](./contracts/spotify-api.ts) - Spotify API 型別定義
- [contracts/tracks-data-schema.ts](./contracts/tracks-data-schema.ts) - 本地資料 schema

### 外部文件

- [Tailwind CSS 4.x 官方文件](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui 元件文件](https://ui.shadcn.com/)
- [Redux Toolkit 官方文件](https://redux-toolkit.js.org/)
- [Recharts 圖表文件](https://recharts.org/)
- [Fuse.js 搜尋引擎文件](https://fusejs.io/)
- [Spotify Web API Reference](https://developer.spotify.com/documentation/web-api/reference/)

---

## 取得協助

### 問題回報

如遇到問題或 bug，請在 GitHub 建立 issue：

1. 前往 [GitHub Issues](https://github.com/YOUR_USERNAME/spotify-youtube-hits/issues)
2. 點擊 "New issue"
3. 選擇適當的 issue template
4. 填寫問題描述（包含錯誤訊息、重現步驟、環境資訊）

### 聯絡方式

- **GitHub Discussions**: 技術討論與問答
- **Email**: [your-email@example.com]
- **Slack**: #spotify-youtube-hits (如有團隊 Slack)

---

**祝開發順利！** 🚀
