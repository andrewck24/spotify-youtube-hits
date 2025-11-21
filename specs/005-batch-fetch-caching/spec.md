# Feature Specification: Batch Fetch & Caching

**Feature Branch**: `005-batch-fetch-caching`
**Created**: 2025-11-21
**Status**: Design Complete
**Input**: User description: "開發資料批次獲取與快取功能..."

## User Scenarios & Testing

### User Story 1 - Batch Data Fetching (Priority: P1)

As a developer, I want to fetch details for multiple artists or tracks in a single API request so that the application performance is optimized and API rate limits are respected.

**Why this priority**: Foundation for performance improvements and required for the search page optimization. Reduces network chatter significantly.

**Independent Test**:

- Trigger a data fetch for a list of items.
- Verify only one network request is made to the backend.
- Verify that subsequent requests for individual items from that list are served from the local cache without new network requests.

**Acceptance Scenarios**:

1. **Given** a list of 5 artist IDs, **When** the batch fetch mechanism is invoked, **Then** a single HTTP request is sent to the server.
2. **Given** the batch request completes, **When** the system requests details for one of those IDs individually, **Then** it returns data immediately without a network request.
3. **Given** a list of 20+ IDs, **When** the batch fetch logic is used, **Then** it automatically chunks requests into batches of 20 IDs (Spotify API limit).

---

### User Story 2 - Search Page Optimization (Priority: P2)

As a user, I want to see artist and track images in the search results immediately, with efficient data loading.

**Why this priority**: Improves the core user experience of the search feature, which is a primary entry point.

**Independent Test**:

- Perform a search returning multiple results.
- Observe network traffic.
- Confirm that after the search results are obtained, the details (images) are fetched in a single batch request rather than multiple individual requests.

**Acceptance Scenarios**:

1. **Given** I search for a term, **When** the results appear, **Then** the artist and track images are displayed.
2. **Given** the results are loading, **When** I check the network activity, **Then** I see a single batch request for the visible items' details.

---

### User Story 3 - Infinite Scroll for Full Results View (Priority: P2)

As a user, I want to browse all search results by scrolling continuously, without clicking "Next Page".

**Why this priority**: Modernizes the UI and makes browsing large lists easier.

**Note**: This applies to the "artists" and "tracks" category views within the existing search page (not a separate page).

**Independent Test**:

- On the search page, switch to "Artists" category (full results view).
- Scroll to the bottom.
- Verify that the next set of results loads automatically and appends to the list.

**Acceptance Scenarios**:

1. **Given** I am viewing full results (category = "artists" or "tracks"), **When** I scroll within 300px of the bottom, **Then** the next batch of results is fetched.
2. **Given** new results are loaded, **When** they appear, **Then** their details are also batch fetched (if not included in the list response).
3. **Given** I scroll quickly, **When** data is loading, **Then** placeholder loaders are shown.

---

### User Story 4 - Skeleton Loading States (Priority: P3)

As a user, I want to see smooth placeholder animations while data is loading, instead of blank spaces or layout shifts.

**Why this priority**: Polish and perceived performance.

**Independent Test**:

- Throttle network speed.
- Load the search page (any category view).
- Verify skeleton blocks match the size and layout of the final content.

**Acceptance Scenarios**:

1. **Given** the search results are fetching, **When** waiting, **Then** I see skeleton rows/cards matching the result layout.
2. **Given** the full results view is loading more items via infinite scroll, **When** scrolling, **Then** new skeletons appear at the bottom before the real data.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide batch API endpoints for fetching multiple artists and tracks.
- **FR-002**: The batch endpoints MUST accept a list of IDs and return the corresponding data objects.
- **FR-003**: The batch fetching mechanism MUST populate the client-side cache for individual items, ensuring subsequent single-item lookups hit the cache.
- **FR-004**: Search Page MUST use batch fetching for the displayed results to minimize network requests.
- **FR-005**: Full results views (category = "artists" or "tracks") MUST implement infinite scroll logic, triggering load when user scrolls within 300px of the bottom, loading 20 items per batch.
- **FR-006**: Full results views MUST use batch fetching for the newly loaded items if full details are needed.
- **FR-007**: System MUST display content-specific skeleton loaders (placeholders) during loading states.
- **FR-008**: Client-side cache settings MUST be optimized using infinite TTL (永久快取) for Artist/Track basic data to maximize cache hit rate (target: >90%), as this data rarely changes and RTK Query's in-memory cache is automatically cleared on page reload.
- **FR-009**: System MUST implement silent degradation for batch fetch failures — failed items display default placeholder images without blocking the UI or showing error toasts.
- **FR-010**: Backend batch endpoints MUST validate request size and return HTTP 400 Bad Request if more than 20 IDs are provided in a single request.
- **FR-011**: Frontend MUST handle batch API 400 errors gracefully by logging the error (for debugging) and applying silent degradation (FR-009). This scenario indicates a frontend bug (improper chunking) and should be monitored.

### UX Specifications

#### Infinite Scroll UX

- **UX-001**: 當所有資料已載入完畢時，MUST 顯示「已顯示全部結果」文字提示於列表底部。
- **UX-002**: Infinite scroll 載入失敗時，MUST 自動重試最多 2 次（每次間隔 1 秒，使用 exponential backoff）；若仍失敗，MUST 於列表底部顯示 inline 重試按鈕。
- **UX-003**: Infinite scroll MUST 實作防重複觸發機制（載入中時忽略新的觸發事件），避免重複請求。
- **UX-004**: Infinite scroll 載入中時，MUST 於列表底部顯示 skeleton loaders（數量對應每批載入數量：20 個）。

#### Skeleton Loading UX

- **UX-005**: Skeleton 動畫 MUST 使用 pulse 效果（shadcn/ui 預設的整體明暗閃爍動畫）。
- **UX-006**: Artist skeleton 佈局：圓形頭像 skeleton + 名稱文字 skeleton（與 ArtistCard 尺寸一致）。
- **UX-007**: Track skeleton 佈局：方形專輯封面 skeleton + 歌曲資訊文字 skeleton（與 TrackItem 尺寸一致）。
- **UX-008**: Skeleton 元件 MUST 包含無障礙屬性：`aria-busy="true"` 與描述性 `aria-label`。

#### Placeholder Image UX

- **UX-009**: 失敗項目的 placeholder image MUST 使用專案品牌色（`--primary` 或 `--muted`）作為背景色。
- **UX-010**: Artist placeholder MUST 顯示人像圖示（如 `react-icons/ri` 的 `RiUser3Line` icon）於品牌色背景上。
- **UX-011**: Track placeholder MUST 顯示音符圖示（如 `react-icons/ri` 的 `RiMusic2Fill` icon）於品牌色背景上。
- **UX-012**: Placeholder 尺寸 MUST 與正常圖片尺寸完全一致，避免 layout shift。

#### Empty State UX（增強現有實作）

- **UX-013**: 搜尋結果為空時，SHOULD 增強現有空狀態 UI（[search-page.tsx:85-90](../../src/pages/search-page.tsx#L85-L90)），新增：
  - 插圖：使用 `react-icons/ri` 的 `RiSearchLine` 圖標（64x64px，`--muted-foreground` 色）
  - 保留現有主標題文字：「未找到 "{query}" 相關結果」
  - 新增副標題建議：「嘗試其他關鍵字或檢查拼字」

### Key Entities

- **Artist**: Full artist data object.
- **Track**: Full track data object.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Loading 20 search results triggers at most 2 API requests (1 search + 1 batch detail fetch) instead of 21.
- **SC-002**: Cache hit rate for individual item details on the search page is >90%.
- **SC-003**: Full results view (artists or tracks category) supports scrolling through at least 100 items without error.
- **SC-004**: Skeleton loaders are visible for at least 200ms (or until load) preventing layout shift (CLS < 0.1).

## Clarifications

### Session 2025-11-21

- Q: "View All" 是獨立頁面還是現有功能？ → A: 是 search-page.tsx 中透過 category 狀態的 conditional rendering，非獨立頁面。
- Q: Batch API chunking 的 chunk size？ → A: 20 IDs per chunk（Spotify API 典型限制）
- Q: Batch API 失敗時的處理策略？ → A: Silent degradation（靜默降級，失敗項目顯示預設圖片/placeholder）
- Q: Infinite scroll 觸發距離？ → A: 300px from bottom（標準值，平衡預載與效率）
- Q: Infinite scroll 每次載入數量？ → A: 20 items per load（考量不同裝置與網路性能，優先保證 UX）
- Q: 後端 Batch API 是否需要驗證 ID 數量上限？ → A: 是，超過 20 IDs 回傳 400 Bad Request；前端需優雅處理此錯誤

### Session 2025-11-21 (UX Checklist Review)

- Q: Infinite scroll 結尾狀態？ → A: 顯示「已顯示全部結果」文字提示
- Q: Infinite scroll 載入失敗處理？ → A: 自動重試最多 2 次，仍失敗則顯示 inline 重試按鈕
- Q: Placeholder image 規格？ → A: 專案品牌色背景 + 對應圖示（Artist=User icon, Track=Music icon）
- Q: 搜尋空狀態 UI？ → A: 增強現有實作，新增插圖與副標題建議
- Q: View All 按鈕？ → A: 已於現有實作中完成（ghost button, 標題右側）
- Q: Skeleton 動畫效果？ → A: Pulse（shadcn/ui 預設）

### Session 2025-11-22 (Bug Fix)

- **Bug**: Infinite scroll 從 preview 模式切換到 full 模式後不觸發
- **根因**: `useInfiniteScroll` hook 使用 `useRef` + `useEffect`，當 sentinel 元素動態出現時，effect 不會重新執行，導致 IntersectionObserver 從未被創建
- **修復**: 改用 callback ref pattern，確保 DOM 元素出現時自動設置 observer
- **影響檔案**: `src/hooks/use-infinite-scroll.ts`

## Assumptions

- The backend forwards batch requests correctly to the external provider.
- Search results provide IDs that can be used for batch fetching.
- Infinite scroll will be implemented using standard intersection detection techniques.
- The existing search page ([search-page.tsx](../../src/pages/search-page.tsx)) has already implemented basic search functionality.
- **"View All" is NOT a separate page** — it is a category-based conditional rendering within the existing search page:
  - `category === "all"`: Preview mode showing limited artists & tracks (no infinite scroll needed)
  - `category === "artists"`: Full artist results view (requires batch fetching for images)
  - `category === "tracks"`: Full track results view (requires batch fetching for images)

## Cache Strategy Rationale

### Why Infinite TTL?

本專案採用**永久快取（infinite TTL）**策略，具體理由如下：

1. **資料特性**: Spotify Artist/Track 基本資料（名稱、圖片、專輯封面）變更頻率極低（數月至數年），屬於接近靜態的資料。
2. **RTK Query 快取行為**: RTK Query 使用 in-memory cache（記憶體快取），快取存在於 Redux store 中。當使用者重新整理頁面時，JavaScript 重新執行，Redux store 重建，**快取會自動完全清空**。因此永久快取只在單次 session 內有效。
3. **效能目標**: 永久快取是達成 SC-002（快取命中率 >90%）的必要條件。在單次 session 內的 SPA 導航時，使用者可獲得零延遲的即時響應。
4. **API 效率**: 消除不必要的重新驗證請求，減少 API quota 消耗，避免浪費外部 API 呼叫次數。

### 可接受的風險

- **長時間 session 資料過期風險**: 使用者若在同一分頁停留極長時間（數小時至數天）且不重新整理，期間 Spotify 若更新資料，使用者會看到過期資料。
  - **風險評估**: 極低機率（Spotify 資料變更頻率極低）× 極低影響（僅影響外觀，不影響功能）= 可接受風險
  - **使用者緩解措施**: 重新整理頁面即可立即取得最新資料

### 替代方案評估

以下為其他快取策略的比較：

| 策略                 | 快取命中率 | API quota 消耗 | 資料新鮮度          | 使用者體驗            | 評估結果         |
| -------------------- | ---------- | -------------- | ------------------- | --------------------- | ---------------- |
| **永久快取（採用）** | ✅ >90%    | ✅ 最低        | ⚠️ Session 內不更新 | ✅ 最佳（零延遲）     | **推薦**         |
| 60s TTL              | ❌ <70%    | ❌ 高          | ✅ 最新             | ❌ 差（頻繁 loading） | 不採用           |
| 1h TTL               | ⚠️ ~80%    | ⚠️ 中          | ✅ 每小時更新       | ⚠️ 中                 | 較保守           |
| 24h TTL              | ✅ >85%    | ✅ 低          | ✅ 每日更新         | ✅ 好                 | 可接受的替代方案 |

**結論**: 60s TTL（原 spec 草稿提及）會導致快取命中率不足、過度 API 請求，且使用者體驗差（頻繁出現 loading state），因此不採用。若未來在生產環境中發現資料新鮮度確實有問題，可改用 24h TTL 作為保守替代方案。
