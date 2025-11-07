# Phase 0: 技術研究與決策

**Feature**: 技術棧現代化重構
**Date**: 2025-10-08
**Status**: Completed

## 概述

本文件記錄重構專案的技術選型研究、決策理由與替代方案評估。所有決策需符合專案憲章原則：TypeScript 生態系最佳實踐、MVP 優先、可測試性、靜態部署優先。

---

## Decision 1: UI 框架 - shadcn/ui + Tailwind CSS 4.x

### 選擇

- **UI 元件庫**: shadcn/ui (基於 Radix UI primitives)
- **樣式方案**: Tailwind CSS 4.x (最新穩定版)
- **設計系統**: shadcn/ui design tokens + Spotify 配色主題
- **圖表元件**: Recharts 3.x (via shadcn/ui chart components)

### 理由

1. **Tailwind CSS 4.x 革命性改進**:

   - **CSS-first 配置**: 不再需要 `tailwind.config.js`，所有配置直接寫在 CSS 中
   - **原生 Vite 整合**: 專屬 `@tailwindcss/vite` plugin，效能比 PostCSS 更佳
   - **零配置**: 自動偵測內容檔案，無需手動設定 `content` 路徑
   - **@theme 指令**: 直接在 CSS 定義設計 tokens，自動生成 CSS 變數
   - **現代 CSS**: 使用 CSS cascade layers、registered custom properties、color-mix()

2. **shadcn/ui 優勢**:

   - 非 NPM 套件，直接複製元件至專案，完全控制程式碼
   - 基於 Radix UI，提供無障礙 (a11y) 與鍵盤導航支援
   - TypeScript-first 設計，型別定義完整
   - 與 Tailwind CSS 4.x 完美整合
   - Dashboard 設計模式內建（符合使用者需求「現代化 dashboard」）
   - 標準化 design tokens（background, foreground, primary, muted, accent 等）

3. **Spotify 主題配色**:

   - 主色 (Primary): Spotify Green (#1DB954) - 用於按鈕、連結、強調元素
   - 背景 (Background): 深黑色 (#121212) - Spotify 經典黑色背景
   - 卡片 (Card): 略淺黑色 (#1a1a1a) - 區隔內容區塊
   - 邊框 (Border): 深灰色 (#282828) - 細緻分隔線
   - 文字 (Foreground): 白色/淺灰色 - 高對比可讀性

4. **Recharts 優勢**:
   - 宣告式 API，易於維護
   - 響應式圖表，自動適應容器大小
   - shadcn/ui 提供預設樣式，符合 Dashboard 風格

### 替代方案

| 方案              | 優點                 | 為何未採用                               |
| ----------------- | -------------------- | ---------------------------------------- |
| Tailwind CSS 3.x  | 成熟穩定、社群資源多 | 4.x 效能更佳、配置更簡潔                 |
| MUI (Material UI) | 成熟生態系、元件豐富 | 打包大小大 (>300KB)、客製化困難          |
| Ant Design        | 企業級元件、文件完整 | 非 Mobile First 設計、與 Tailwind 整合差 |
| Chakra UI         | 無障礙支援佳         | 樣式系統與 Tailwind 衝突                 |

### 實作細節

**Tailwind CSS 4.x 安裝**:

```bash
# 安裝 Tailwind CSS 4.x + Vite plugin
npm install tailwindcss@latest @tailwindcss/vite@latest
```

**Vite 配置** (`vite.config.ts`):

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 原生 Vite plugin，效能優於 PostCSS
  ],
});
```

**CSS 配置 - Spotify 主題** (`src/index.css`):

```css
/* Tailwind CSS 4.x 單一 import，取代舊的三個 imports */
@import "tailwindcss";

/*
 * shadcn/ui design tokens + Spotify 配色主題
 * 使用 oklch 色彩空間，提供更準確的色彩呈現與漸變效果
 */
@theme {
  /* ============================================
   * 基礎顏色 (Base Colors) - Spotify Dark Theme
   * ============================================ */

  /* 背景色 - Spotify 經典深黑色 */
  --color-background: oklch(0.13 0 0); /* #121212 */
  --color-foreground: oklch(0.98 0 0); /* #fafafa 白色文字 */

  /* 卡片背景 - 略淺於背景，形成層次 */
  --color-card: oklch(0.16 0 0); /* #1a1a1a */
  --color-card-foreground: oklch(0.98 0 0); /* #fafafa */

  /* Popover/Dropdown 背景 */
  --color-popover: oklch(0.18 0 0); /* #1f1f1f */
  --color-popover-foreground: oklch(0.98 0 0); /* #fafafa */

  /* ============================================
   * Spotify Green - 主要品牌色
   * ============================================ */

  /* Primary - Spotify Green (#1DB954) */
  --color-primary: oklch(0.65 0.18 150); /* Spotify Green */
  --color-primary-foreground: oklch(0.13 0 0); /* 黑色文字 (高對比) */

  /* ============================================
   * 次要色彩 (Secondary Colors)
   * ============================================ */

  /* Secondary - 淺灰色，用於次要按鈕 */
  --color-secondary: oklch(0.25 0 0); /* #282828 深灰 */
  --color-secondary-foreground: oklch(0.98 0 0); /* 白色文字 */

  /* Muted - 柔和灰色，用於禁用狀態或背景 */
  --color-muted: oklch(0.22 0 0); /* #242424 */
  --color-muted-foreground: oklch(0.6 0 0); /* #a0a0a0 中灰文字 */

  /* Accent - 強調色，用於 hover 狀態 */
  --color-accent: oklch(0.2 0 0); /* #202020 */
  --color-accent-foreground: oklch(0.98 0 0); /* 白色文字 */

  /* ============================================
   * 功能性顏色 (Functional Colors)
   * ============================================ */

  /* Destructive - 錯誤/刪除動作（使用 Spotify 紅色調） */
  --color-destructive: oklch(0.55 0.22 25); /* #e22134 紅色 */
  --color-destructive-foreground: oklch(0.98 0 0); /* 白色文字 */

  /* ============================================
   * 邊框與輸入框
   * ============================================ */

  /* Border - 深灰色邊框 */
  --color-border: oklch(0.25 0 0); /* #282828 */

  /* Input - 輸入框背景 */
  --color-input: oklch(0.25 0 0); /* #282828 */

  /* Ring - Focus 狀態外框（使用 Spotify Green） */
  --color-ring: oklch(0.65 0.18 150); /* Spotify Green */

  /* ============================================
   * 圖表顏色 (Chart Colors) - Spotify 調色盤
   * ============================================ */

  /* Chart 1 - Spotify Green (主要) */
  --color-chart-1: oklch(0.65 0.18 150); /* #1DB954 */

  /* Chart 2 - 藍綠色 (次要) */
  --color-chart-2: oklch(0.6 0.15 200); /* #1ed760 */

  /* Chart 3 - 黃綠色 (輔助) */
  --color-chart-3: oklch(0.7 0.15 120); /* #c4f564 */

  /* Chart 4 - 青色 (對比) */
  --color-chart-4: oklch(0.65 0.12 230); /* #2e77d0 */

  /* Chart 5 - 紫色 (強調) */
  --color-chart-5: oklch(0.55 0.18 300); /* #9d4edd */

  /* ============================================
   * 字型設定
   * ============================================ */

  /* Sans-serif - 使用 Inter Variable (現代幾何字型，類似 Spotify Circular) */
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;

  /* 顯示字型 - 用於標題 */
  --font-display: "Inter Variable", ui-sans-serif, system-ui, sans-serif;

  /* Mono - 代碼/數據展示 */
  --font-mono: ui-monospace, "SF Mono", "Cascadia Code", monospace;

  /* ============================================
   * 圓角設定 (Radius)
   * ============================================ */

  /* Spotify 風格使用較圓潤的圓角 */
  --radius-xs: 0.25rem; /* 4px */
  --radius-sm: 0.375rem; /* 6px */
  --radius-md: 0.5rem; /* 8px - 預設 */
  --radius-lg: 0.75rem; /* 12px */
  --radius-xl: 1rem; /* 16px */
  --radius-2xl: 1.5rem; /* 24px */
  --radius-full: 9999px; /* 完全圓形 */

  /* ============================================
   * 自訂斷點 (Breakpoints)
   * ============================================ */

  /* 3XL - 4K 螢幕 */
  --breakpoint-3xl: 1920px;

  /* ============================================
   * 動畫曲線 (Easing Functions)
   * ============================================ */

  /* Spotify 風格的平滑動畫 */
  --ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-snappy: cubic-bezier(0.4, 0, 0.2, 1);
}
```

**shadcn/ui 初始化**:

```bash
# 初始化 shadcn/ui (自動偵測 Tailwind 4.x)
npx shadcn@latest init

# 設定時選擇：
# - Style: Default (會使用上面定義的 CSS 變數)
# - Base color: Zinc (我們已自訂為 Spotify 配色)
# - CSS variables: Yes (使用 @theme 中定義的變數)

# 安裝核心元件
npx shadcn@latest add button card skeleton spinner input
npx shadcn@latest add chart  # Recharts wrapper
npx shadcn@latest add dropdown-menu dialog sheet  # Dashboard 常用元件
```

**使用範例 - Spotify 風格按鈕**:

```tsx
import { Button } from '@/components/ui/button'

// Primary - Spotify Green 按鈕
<Button>播放音樂</Button>

// Secondary - 深灰色按鈕
<Button variant="secondary">查看更多</Button>

// Ghost - 透明背景，hover 顯示
<Button variant="ghost">取消</Button>

// Destructive - 紅色警告按鈕
<Button variant="destructive">刪除歌單</Button>
```

**響應式斷點** (Tailwind 4.x 預設，Mobile First):

- `sm: 640px` - 手機橫向
- `md: 768px` - 平板直向（雙欄布局起點）
- `lg: 1024px` - 桌面
- `xl: 1280px` - 大桌面
- `2xl: 1536px` - 超大桌面
- `3xl: 1920px` - 自訂（4K）

---

## Decision 2: 狀態管理 - Redux Toolkit

### 2.1. 選擇

- **狀態管理庫**: Redux Toolkit 2.x
- **非同步處理**: createAsyncThunk (內建)
- **選擇器優化**: Reselect (內建於 RTK)

### 2.2. 理由

1. **Redux Toolkit 優勢**:

   - 官方推薦的 Redux 現代化方案
   - 內建 Immer，簡化不可變更新
   - TypeScript 支援完善，自動推斷 Action 型別
   - DevTools 整合，除錯體驗佳
   - 程式碼量減少 70% (vs. 傳統 Redux)

2. **與 React 19 整合**:

   - 使用 `useSelector` + `useDispatch` hooks
   - 支援 React 19 的 Concurrent Features
   - 無需額外配置

3. **可測試性**:
   - Slices 可獨立測試
   - Pure reducers，無副作用
   - Mock store 容易建立

### 2.3. 替代方案

| 方案            | 優點                 | 為何未採用                             |
| --------------- | -------------------- | -------------------------------------- |
| Recoil (原專案) | 簡潔 API、原子化狀態 | 生態系較小、未來維護性疑慮             |
| Zustand         | 極簡、無 boilerplate | 缺乏時間旅行除錯、團隊不熟悉           |
| Jotai           | 輕量、與 Recoil 類似 | 同 Recoil，生態系不足                  |
| React Context   | 無額外依賴           | 效能問題 (頻繁 re-render)、無 DevTools |

### 2.4. 實作細節

**Store 結構**:

```typescript
// src/lib/store.ts
import { configureStore } from "@reduxjs/toolkit";
import artistReducer from "@/features/artist/artist-slice";
import trackReducer from "@/features/track/track-slice";
import searchReducer from "@/features/search/search-slice";

export const store = configureStore({
  reducer: {
    artist: artistReducer,
    track: trackReducer,
    search: searchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Typed Hooks**:

```typescript
// src/app/hooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

---

## Decision 3: 搜尋引擎 - Fuse.js

### 3.1. 選擇

- **搜尋引擎**: Fuse.js 7.x
- **索引策略**: 應用啟動時建立，存入 Redux state
- **快取機制**: 搜尋結果不快取 (計算成本低)

### 3.2. 理由

1. **Fuse.js 優勢**:

   - 輕量 (< 10KB gzipped)
   - 模糊搜尋演算法成熟 (Bitap algorithm)
   - 支援權重配置、門檻調整
   - TypeScript 定義完整
   - 無需伺服器，純客戶端運算

2. **效能特性**:

   - 建立索引時間: ~100ms (5000 筆資料)
   - 搜尋延遲: < 10ms (單次查詢)
   - 記憶體佔用: ~5MB (含索引)

3. **與專案需求契合**:
   - 符合「靜態部署優先」憲章
   - 支援藝人名稱部分匹配（spec FR-001）
   - 搜尋結果即時顯示（< 100ms）

### 3.3. 替代方案

| 方案       | 優點               | 為何未採用                       |
| ---------- | ------------------ | -------------------------------- |
| FlexSearch | 更快 (10x Fuse.js) | API 較複雜、TypeScript 支援弱    |
| Lunr.js    | 全文搜尋功能強     | 打包大小較大、本專案不需全文搜尋 |
| 正規表達式 | 零依賴             | 無模糊匹配、使用者體驗差         |

### 3.4. 實作細節

**Fuse.js 配置**:

```typescript
// src/features/search/search-service.ts
import Fuse from "fuse.js";
import type { Track } from "@/types/track";

const fuseOptions: Fuse.IFuseOptions<Track> = {
  keys: [
    { name: "artistName", weight: 0.7 }, // 藝人名稱權重高
    { name: "trackName", weight: 0.3 }, // 歌曲名稱權重低
  ],
  threshold: 0.3, // 模糊度 (0 = 完全匹配, 1 = 全部匹配)
  includeScore: true, // 回傳匹配分數
  minMatchCharLength: 2, // 最少輸入 2 字元才搜尋
};

export class SearchService {
  private fuse: Fuse<Track>;

  constructor(tracks: Track[]) {
    this.fuse = new Fuse(tracks, fuseOptions);
  }

  search(query: string, limit = 12): Track[] {
    const results = this.fuse.search(query, { limit });
    return results.map((r) => r.item);
  }
}
```

---

## Decision 4: 資料載入與快取策略

### 4.1. 選擇

- **資料格式**: 單一 JSON 檔案 (public/data/tracks.json)
- **快取層級 1**: sessionStorage (同分頁生命週期)
- **快取層級 2**: Redux state (記憶體)
- **載入策略**: 漸進式載入 + Skeleton UI (shadcn/ui)

### 4.2. 理由

1. **單一 JSON 檔案**:

   - 簡化部署，無需資料庫
   - HTTP/2 並行下載效能佳
   - Gzip 壓縮後約 1.5MB (壓縮率 ~70%)
   - 符合「靜態部署」憲章

2. **sessionStorage 快取**:

   - 容量限制 5-10MB（足夠存放 5.5MB 資料）
   - 同分頁自動共享快取
   - 關閉分頁自動清除，不佔硬碟空間

3. **漸進式載入 UX (Spotify 風格)**:
   - 使用 shadcn/ui Skeleton 元件
   - Spotify Green Spinner
   - 進度文字與載入動畫

### 4.3. 替代方案

| 方案                 | 優點           | 為何未採用                     |
| -------------------- | -------------- | ------------------------------ |
| 分割 JSON (按首字母) | 首次載入快     | 搜尋需載入多個檔案，延遲高     |
| IndexedDB            | 容量大、持久化 | 實作複雜、本專案資料小         |
| localStorage         | 持久化快取     | 5MB 限制可能不足、同源共享問題 |

### 4.4. 實作細節

**資料載入 Service**:

```typescript
// src/services/data-loader.ts
import type { Track } from "@/types/track";

const CACHE_KEY = "tracks_db_v1";
const DATA_URL = "/data/tracks.json";

export class DataLoader {
  async loadTracks(onProgress?: (progress: number) => void): Promise<Track[]> {
    // 1. 嘗試從 sessionStorage 讀取
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      onProgress?.(100);
      return JSON.parse(cached);
    }

    // 2. 從伺服器下載 (with progress tracking)
    const response = await fetch(DATA_URL);
    const reader = response.body?.getReader();
    const contentLength = +(response.headers.get("Content-Length") ?? 0);

    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;
      onProgress?.(Math.round((receivedLength / contentLength) * 100));
    }

    // 3. 解析 JSON
    const blob = new Blob(chunks);
    const text = await blob.text();
    const tracks: Track[] = JSON.parse(text);

    // 4. 存入 sessionStorage
    try {
      sessionStorage.setItem(CACHE_KEY, text);
    } catch (e) {
      console.warn("sessionStorage full, using memory cache only");
    }

    return tracks;
  }
}
```

**載入 UI - Spotify 風格**:

```tsx
// src/components/layout/data-loader-wrapper.tsx
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export function DataLoaderWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

function LoadingFallback() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background">
      {/* Spotify Green Spinner */}
      <Spinner className="size-16 text-primary" />

      <div className="space-y-2 text-center">
        <p className="text-xl font-semibold text-foreground">
          載入音樂資料庫...
        </p>
        <p className="text-sm text-muted-foreground">
          首次載入需要數秒鐘，請稍候
        </p>
      </div>

      {/* Dashboard Skeleton Preview - Spotify 風格 */}
      <div className="mt-12 w-full max-w-6xl space-y-6 px-8">
        {/* 搜尋列 Skeleton */}
        <Skeleton className="h-12 w-full rounded-lg bg-card" />

        {/* 雙欄布局 Skeleton */}
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          {/* 左側邊欄 */}
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-xl bg-card" />
            <Skeleton className="h-64 rounded-xl bg-card" />
          </div>

          {/* 右側內容 */}
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl bg-card" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-64 rounded-xl bg-card" />
              <Skeleton className="h-64 rounded-xl bg-card" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Decision 5: Lazy Loading 與 Code Splitting 策略

### 5.1. 選擇

- **元件層級分割**: React.lazy + Suspense
- **圖表元件**: 延遲載入 (最大 chunk)
- **路由層級分割**: 未來擴展 (Phase 2)

### 5.2. 理由

1. **React 19 Suspense**:

   - 官方推薦的非同步元件載入方案
   - 與 Error Boundary 整合佳
   - 支援 Nested Suspense (多層載入狀態)

2. **Vite Code Splitting**:

   - 自動分析 dynamic import
   - 產生最佳化的 chunk 分割
   - 支援 preload/prefetch hints

3. **打包目標**:
   - Main bundle < 500KB (gzip)
   - Lazy chunks < 200KB each
   - 首屏 TTI < 1.5s

### 5.3. 實作細節

**Lazy Load 圖表元件**:

```typescript
// src/components/track/track-detail.tsx
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const PopularityChart = lazy(() => import("./popularity-chart"));
const FeatureChart = lazy(() => import("./feature-chart"));

export function TrackDetail() {
  return (
    <div className="space-y-6">
      {/* 基本資訊立即顯示 */}
      <TrackBasicInfo />

      {/* 圖表延遲載入，使用 Spotify 風格 Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <Suspense
          fallback={<Skeleton className="h-64 w-full rounded-xl bg-card" />}
        >
          <PopularityChart />
        </Suspense>
        <Suspense
          fallback={<Skeleton className="h-64 w-full rounded-xl bg-card" />}
        >
          <FeatureChart />
        </Suspense>
      </div>
    </div>
  );
}
```

**Vite 設定優化**:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          charts: ["recharts"],
          search: ["fuse.js"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
        },
      },
    },
  },
});
```

---

## Decision 6: TypeScript 配置

### 6.1. 選擇

- **TypeScript 版本**: 5.x (最新穩定版)
- **編譯目標**: ES2022 (支援所有現代瀏覽器)
- **模組系統**: ESM
- **嚴格模式**: 啟用 `strict: true`

### 6.2. 理由

1. **型別安全**:

   - `strict: true` 啟用所有嚴格檢查
   - `noUncheckedIndexedAccess: true` 防止陣列越界
   - `noImplicitReturns: true` 確保函數回傳一致

2. **與 React 19 整合**:

   - 使用 `@types/react` 19.x
   - 支援新的 JSX transform
   - Hooks 型別完整

3. **路徑別名**:
   - 使用 `@/*` 簡化 import
   - 與 Vite 一致

### 6.3. 實作細節

**tsconfig.json**:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strict */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,

    /* Path alias */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 技術債務與後續優化 (Phase 2+)

以下功能符合需求但優先級較低，留待後續優化：

### 1. Web Worker 搜尋（當資料 > 10k 筆）

- 目前 Fuse.js 主執行緒運算足夠快
- 若資料量增加，將搜尋移至 Worker

### 2. Virtual Scrolling（當清單 > 100 項）

- 目前顯示最多 12 筆搜尋結果
- 若未來需顯示完整清單，使用 @tanstack/react-virtual

### 3. PWA 支援（完整離線功能）

- 目前使用 sessionStorage 半離線
- 若需完全離線，導入 Workbox + Service Worker

### 4. 效能監控

- 使用 web-vitals 追蹤 Core Web Vitals
- Lighthouse CI 整合

---

## Decision 7: 測試框架與策略

### 7.1. 需求與目標

根據 spec.md 功能需求 (FR-011, FR-012, FR-013) 與成功標準 (SC-007, SC-008)：

- **單元測試**：覆蓋率 ≥ 80%，測試核心業務邏輯（services, reducers, selectors, utilities）
- **整合測試**：驗證資料流程（API 整合、資料載入、搜尋引擎）
- **E2E 測試**：覆蓋 3 個主要使用者故事（搜尋藝人、離線快取、響應式設計）

### 7.2. 選擇方案：Vitest + Testing Library + Playwright

#### 1. **單元測試 & 整合測試：Vitest**

**選擇理由**：

- **Vite 原生整合**：與專案建置工具一致，零配置啟動
- **極快速度**：使用 ESM + Vite 轉換管線，測試速度比 Jest 快 2-10x
- **兼容 Jest API**：可直接使用 Jest 語法（describe, it, expect），降低學習成本
- **TypeScript 支援**：原生支援，無需額外設定
- **覆蓋率內建**：使用 c8/v8 coverage，比 Istanbul 更快
- **UI 模式**：提供 @vitest/ui 視覺化測試介面

**配置範例** (`vitest.config.ts`):

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // 全域 describe, it, expect（無需 import）
    environment: "jsdom", // 模擬瀏覽器環境
    setupFiles: "./tests/setup.ts", // 全域測試設定
    coverage: {
      provider: "v8", // v8 比 istanbul 快
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "**/*.config.ts", "src/main.tsx"],
      thresholds: {
        lines: 80, // 最低 80% 行覆蓋率
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**測試範例** (`src/lib/formatters.test.ts`):

```typescript
import { describe, it, expect } from "vitest";
import { formatNumber, formatDuration, formatDate } from "./formatters";

describe("formatters", () => {
  describe("formatNumber", () => {
    it("should format numbers with thousands separator", () => {
      expect(formatNumber(1000000)).toBe("1,000,000");
      expect(formatNumber(500)).toBe("500");
    });

    it("should handle zero", () => {
      expect(formatNumber(0)).toBe("0");
    });
  });

  describe("formatDuration", () => {
    it("should format duration in mm:ss format", () => {
      expect(formatDuration(225000)).toBe("3:45");
      expect(formatDuration(60000)).toBe("1:00");
    });
  });
});
```

#### 2. **React 元件測試：Testing Library**

**選擇理由**：

- **行為驅動測試**：測試使用者行為，而非實作細節
- **社群標準**：React 官方推薦，最廣泛使用的元件測試庫
- **無障礙優先**：內建 a11y 查詢（getByRole, getByLabelText）
- **與 Vitest 完美整合**：使用 @testing-library/react 搭配 Vitest

**測試範例** (`src/components/search/search-bar.test.tsx`):

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./search-bar";

describe("SearchBar", () => {
  it("should call onSearch when user types", async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText("搜尋藝人...");
    await user.type(input, "Gorillaz");

    // debounce 300ms
    await vi.waitFor(
      () => {
        expect(mockOnSearch).toHaveBeenCalledWith("Gorillaz");
      },
      { timeout: 500 }
    );
  });

  it("should clear input when Esc is pressed", async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Test");
    await user.keyboard("{Escape}");

    expect(input).toHaveValue("");
  });
});
```

**Redux 整合測試範例** (`src/features/search/search-slice.test.ts`):

```typescript
import { describe, it, expect } from "vitest";
import searchReducer, { performSearch, clearSearch } from "./search-slice";
import { createMockStore } from "@/tests/utils/mock-store";

describe("searchSlice", () => {
  it("should update search results when performSearch is called", () => {
    const store = createMockStore();
    const mockResults = [
      { artistId: "1", artistName: "Gorillaz", popularity: 85 },
    ];

    store.dispatch(performSearch({ query: "gor", results: mockResults }));

    const state = store.getState().search;
    expect(state.query).toBe("gor");
    expect(state.results).toEqual(mockResults);
  });
});
```

#### 3. **E2E 測試：Playwright**

**選擇理由**：

- **跨瀏覽器支援**：Chromium, Firefox, WebKit（Safari）一次執行
- **現代 API**：async/await，自動等待元素，無需手動 sleep
- **強大的選擇器**：支援文字、角色、測試 ID、CSS 選擇器
- **截圖與影片錄製**：失敗時自動截圖，便於除錯
- **並行執行**：多個測試平行執行，速度快
- **TypeScript 支援**：原生 TypeScript，型別提示完整

**配置範例** (`playwright.config.ts`):

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true, // 平行執行所有測試
  forbidOnly: !!process.env.CI, // CI 禁止 .only
  retries: process.env.CI ? 2 : 0, // CI 環境重試 2 次
  workers: process.env.CI ? 1 : undefined, // CI 單執行緒

  reporter: "html", // HTML 報告

  use: {
    baseURL: "http://localhost:5173", // dev server
    trace: "on-first-retry", // 失敗時記錄 trace
    screenshot: "only-on-failure", // 失敗時截圖
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // Mobile 測試
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
```

**E2E 測試範例** (`tests/e2e/user-story-1.spec.ts`):

```typescript
import { test, expect } from "@playwright/test";

test.describe("User Story 1 - 藝人搜尋與歌曲瀏覽", () => {
  test("should search artist, view tracks, and display charts", async ({
    page,
  }) => {
    // 1. 開啟應用
    await page.goto("/");

    // 2. 等待資料載入完成
    await expect(page.getByText("載入音樂資料庫...")).toBeHidden({
      timeout: 10000,
    });

    // 3. 搜尋藝人
    const searchInput = page.getByPlaceholder("搜尋藝人...");
    await searchInput.fill("Gorillaz");

    // 4. 點擊搜尋結果
    await page.getByRole("button", { name: /Gorillaz/i }).click();

    // 5. 驗證藝人資訊顯示
    await expect(page.getByRole("heading", { name: "Gorillaz" })).toBeVisible();
    await expect(page.getByText(/追蹤人數/i)).toBeVisible();

    // 6. 驗證歌曲清單顯示
    await expect(page.getByRole("list", { name: /熱門歌曲/i })).toBeVisible();

    // 7. 點擊歌曲
    await page.getByRole("listitem", { name: /Feel Good Inc/i }).click();

    // 8. 驗證歌曲詳情與圖表
    await expect(
      page.getByRole("heading", { name: "Feel Good Inc." })
    ).toBeVisible();
    await expect(page.getByText(/人氣圖表/i)).toBeVisible();
    await expect(page.getByText(/音樂特徵/i)).toBeVisible();
  });

  test("should handle no search results gracefully", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("搜尋藝人...").fill("xyz123nonexistent");
    await expect(page.getByText("查無相關藝人")).toBeVisible();
  });
});
```

### 7.3. 替代方案

| 測試類型 | 選擇方案        | 替代方案     | 為何未採用                    |
| -------- | --------------- | ------------ | ----------------------------- |
| 單元測試 | Vitest          | Jest         | Jest 啟動慢、與 Vite 整合差   |
| 單元測試 | Vitest          | Mocha + Chai | 需額外設定，生態系不如 Vitest |
| 元件測試 | Testing Library | Enzyme       | 已過時，不支援 React 18+      |
| E2E 測試 | Playwright      | Cypress      | Cypress 跨瀏覽器支援弱        |
| E2E 測試 | Playwright      | Selenium     | Selenium API 老舊、速度慢     |

### 7.4. 測試策略

#### 測試金字塔

```plaintext
     /\
    /  \   E2E (10%) - Playwright
   /────\
  /      \  整合 (20%) - Vitest + Testing Library
 /────────\
/__________\ 單元 (70%) - Vitest
```

- **70% 單元測試**：

  - Services (spotify-api, data-loader, storage)
  - Reducers (Redux slices)
  - Selectors (Reselect)
  - Utilities (formatters, constants)

- **20% 整合測試**：

  - Redux + Services 整合
  - React 元件 + Redux 整合
  - Fuse.js 搜尋引擎

- **10% E2E 測試**：
  - User Story 1: 搜尋 → 藝人 → 歌曲
  - User Story 2: 離線模式
  - User Story 3: 響應式設計

#### TDD 工作流程

```bash
# 1. 先寫測試（RED）
npm run test:watch

# 2. 實作功能（GREEN）
# 編輯 src/...

# 3. 重構（REFACTOR）
# 保持測試通過，改善程式碼

# 4. 檢查覆蓋率
npm run test:coverage
```

#### CI/CD 整合

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - run: npm ci

      # 單元測試 & 整合測試
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3 # 上傳覆蓋率報告

      # E2E 測試
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### 7.5. Mock 資料管理

**Spotify API Mock** (`tests/mocks/spotify-api.mock.ts`):

```typescript
import type {
  SpotifyArtist,
  SpotifyTrack,
  SpotifyAudioFeatures,
} from "@/types/spotify";

export const mockArtist: SpotifyArtist = {
  id: "3AA28KZvwAUcZuOKwyblJQ",
  name: "Gorillaz",
  type: "artist",
  uri: "spotify:artist:3AA28KZvwAUcZuOKwyblJQ",
  href: "https://api.spotify.com/v1/artists/3AA28KZvwAUcZuOKwyblJQ",
  external_urls: {
    spotify: "https://open.spotify.com/artist/3AA28KZvwAUcZuOKwyblJQ",
  },
  images: [{ url: "https://i.scdn.co/image/...", height: 640, width: 640 }],
  popularity: 85,
  followers: { href: null, total: 8500000 },
  genres: ["alternative rock", "britpop"],
};

export const mockTrack: SpotifyTrack = {
  id: "0d28khcov6AiegSCpG5TuT",
  name: "Feel Good Inc.",
  // ... 完整 mock 資料
};

export const mockAudioFeatures: SpotifyAudioFeatures = {
  id: "0d28khcov6AiegSCpG5TuT",
  type: "audio_features",
  acousticness: 0.123,
  danceability: 0.678,
  energy: 0.789,
  // ... 完整 mock 資料
};
```

**Redux Store Mock Factory** (`tests/utils/mock-store.ts`):

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { artistReducer, trackReducer, searchReducer } from "@/features";

export function createMockStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      artist: artistReducer,
      track: trackReducer,
      search: searchReducer,
      // ... 其他 reducers
    },
    preloadedState,
  });
}
```

### 7.6. 測試檔案組織

```text
tests/
├── setup.ts                    # 全域測試設定
├── utils/
│   ├── test-utils.tsx         # 自訂 render function
│   └── mock-store.ts          # Redux mock factory
├── mocks/
│   ├── spotify-api.mock.ts    # Spotify API mock 資料
│   └── tracks-data.mock.ts    # 本地資料庫 mock
└── e2e/
    ├── user-story-1.spec.ts   # US1 E2E 測試
    ├── user-story-2.spec.ts   # US2 E2E 測試
    └── user-story-3.spec.ts   # US3 E2E 測試

src/
├── lib/
│   ├── formatters.ts
│   └── formatters.test.ts     # 單元測試（同目錄）
├── services/
│   ├── spotify-api.ts
│   └── spotify-api.test.ts    # 單元測試
├── features/
│   └── search/
│       ├── search-slice.ts
│       └── search-slice.test.ts  # 整合測試
└── components/
    └── search/
        ├── search-bar.tsx
        └── search-bar.test.tsx   # 元件測試
```

### 7.7. 實作細節

**package.json scripts**:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

**測試覆蓋率目標**:

- **services/**: 90% 覆蓋率（純函數、容易測試）
- **features/ (Redux)**: 85% 覆蓋率（reducers, selectors）
- **components/**: 75% 覆蓋率（UI 元件）
- **lib/**: 90% 覆蓋率（工具函式）
- **整體目標**: ≥ 80% 覆蓋率

---

## 總結

所有技術選型符合專案憲章原則：

- ✅ **TypeScript 生態系最佳實踐**: TypeScript 5.x + React 19 + Tailwind 4.x
- ✅ **MVP 優先**: 選擇成熟方案，避免過度設計
- ✅ **可測試性**: Redux Toolkit + 關注點分離
- ✅ **靜態部署**: 無後端、純客戶端運算
- ✅ **效能目標**: TTI < 1.5s，搜尋 < 100ms

**Tailwind CSS 4.x + shadcn/ui + Spotify 主題關鍵優勢**：

- CSS-first 配置，使用 @theme 定義 Spotify 品牌色
- shadcn/ui design tokens 標準化（background, primary, muted 等）
- Spotify Green (#1DB954) 作為主色，深黑色 (#121212) 背景
- 零配置、原生 Vite 整合、效能提升 20-30%
- 完整的 Dashboard 風格元件庫

下一階段：Phase 1 資料模型設計與 API 合約定義。
