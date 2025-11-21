# Research: Batch Fetch & Caching

**Feature**: 005-batch-fetch-caching  
**Date**: 2025-11-21  
**Purpose**: Research RTK Query batch fetching patterns, cache population strategies, IntersectionObserver for infinite scroll, and skeleton loading best practices.

---

## 1. RTK Query Batch Fetching with Individual Cache Population

### 1.1 Decision

實作 `getSeveralArtists` 和 `getSeveralTracks` endpoints，並使用 `onQueryStarted` lifecycle 將批次結果寫入個別資源的快取。

### 1.2 Rationale

- **問題**：RTK Query 預設不會將 batch endpoint 的結果自動填入 single-item endpoints 的快取
- **解決方案**：使用 `onQueryStarted` + `dispatch(api.util.upsertQueryData())` 手動更新快取
- **優點**：
  1. 子元件可直接使用 `useGetArtistQuery(id)` 而不需改動
  2. 快取命中率 >90%（batch fetch 後的 single fetch 不會發送網路請求）
  3. 符合 RTK Query 最佳實踐

### 1.3 Implementation Pattern

```typescript
getSeveralArtists: builder.query<SpotifyArtist[], string[]>({
  query: (ids) => `/artists?ids=${ids.join(',')}`,
  providesTags: (result) =>
    result
      ? [...result.map(({ id }) => ({ type: 'Artist' as const, id })), 'Artist']
      : ['Artist'],
  async onQueryStarted(ids, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      data.forEach((artist) => {
        dispatch(
          spotifyApi.util.upsertQueryData('getArtist', artist.id, artist)
        );
      });
    } catch {}
  },
}),
```

### 1.4 Alternatives Considered

- ❌ **Normalized cache (Redux Toolkit Entity Adapter)**: 過度設計，不符合 MVP 原則
- ❌ **Parent component pass down data**: 需要大幅修改現有元件架構，違反元件獨立性
- ✅ **onQueryStarted + upsertQueryData**: 最小改動，符合 RTK Query 慣例

### 1.5 References

- [RTK Query - Manipulating Cache Behavior](https://redux-toolkit.js.org/rtk-query/usage/cache-behavior#manipulating-cache-behavior)
- [RTK Query - upsertQueryData](https://redux-toolkit.js.org/rtk-query/api/created-api/api-slice-utils#upsertquerydata)

---

## 2. Spotify API Batch Endpoints Limits

### 2.1 Decision

- Spotify API 官方限制：**最多 50 筆** (`ids` 參數最多 50 個 ID，以逗號分隔)
- 專案採用限制：**最多 20 筆**（平衡請求數與單一回覆資料量）
- 若搜尋結果 >20 筆，需拆分為多個請求（chunking）

### 2.2 Rationale

- **Spotify API 限制**：`/artists?ids=...` 和 `/tracks?ids=...` 官方文件明確標示 "Maximum: 50 IDs"
- **專案權衡**：雖然 API 支援 50 筆，但考慮到：
  1. 單一回覆資料量過大（50 個 artist objects 約 100-200KB）
  2. 搜尋頁面通常僅顯示前 10-20 筆結果
  3. 減少不必要的資料傳輸與解析成本
- **最佳實踐**：採用 20 筆作為預設批次大小，在效能與使用者體驗間取得平衡

### 2.3 Implementation Strategy

- Phase 1 (MVP)：搜尋頁面僅顯示前 8 筆 artists + 前 5 筆 tracks（單次 batch request 足夠）
- Phase 2（未來優化）："View All" 頁面需實作 chunking logic（`chunk(ids, 20).map(fetchBatch)`）
- **彈性設計**：若未來需要增加批次大小至 50 筆，僅需修改常數即可

### 2.4 References

- [Spotify Web API - Get Several Artists](https://developer.spotify.com/documentation/web-api/reference/get-multiple-artists) - "Maximum: 50 IDs"
- [Spotify Web API - Get Several Tracks](https://developer.spotify.com/documentation/web-api/reference/get-several-tracks) - "Maximum: 50 IDs"

---

## 3. Infinite Scroll with IntersectionObserver

### 3.1 Decision

使用 IntersectionObserver API 搭配自訂 `useInfiniteScroll` hook 實作 infinite scrolling。

### 3.2 Rationale

- **IntersectionObserver** 是瀏覽器原生 API，效能最佳（避免 scroll event listener 的效能問題）
- 符合現代 Web 標準，支援度良好（IE11+ 除外，但本專案 target 是現代瀏覽器）
- 實作簡單，易於測試

### 3.3 Implementation Pattern

```typescript
export function useInfiniteScroll(
  callback: () => void,
  options?: IntersectionObserverInit,
) {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      },
      { threshold: 0.1, ...options },
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  }, [callback]);

  return targetRef;
}
```

### 3.4 Usage

```tsx
const sentinelRef = useInfiniteScroll(() => {
  if (!isLoading && hasMore) {
    loadMore();
  }
});

return (
  <div>
    {items.map((item) => (
      <Item key={item.id} {...item} />
    ))}
    <div ref={sentinelRef} /> {/* Sentinel element */}
  </div>
);
```

### 3.5 Alternatives Considered

- ❌ **react-infinite-scroll-component**: 額外依賴，不符合 MVP 原則
- ❌ **scroll event listener**: 效能較差（需要 throttle/debounce）
- ✅ **IntersectionObserver**: 最佳效能，原生支援

### 3.6 API Design: Client-Side Pagination (No API Page Parameter)

**Decision**: Infinite scroll **不需要** API 端點附上 `page` 參數，採用 **client-side pagination**。

**Rationale**:

- **資料來源**：搜尋結果已包含所有 ID 列表（來自本地 JSON 或 search API 的單次回應）
- **實作邏輯**：
  1. 前端一次性獲得所有搜尋結果的 IDs（例如：100 筆 artist IDs）
  2. 第一頁顯示前 20 筆 → 觸發 `getSeveralArtists(ids[0..19])`
  3. 滾動至底部 → 載入第二頁 → 觸發 `getSeveralArtists(ids[20..39])`
  4. 持續直到所有 IDs 載入完畢
- **優點**：
  1. **簡化 API 設計**：batch endpoint 僅需處理 `ids` 參數，不需 `page`, `offset`, `limit` 等分頁參數
  2. **減少狀態管理**：前端已知總筆數與當前進度，不需從 API 回應中解析 `total`, `hasMore` 等資訊
  3. **快取友善**：每個 batch request 的 cache key 是 `ids` 陣列，自然去重（相同 IDs = 相同快取）
  4. **符合需求**：搜尋結果總數通常 <1000 筆，client-side pagination 完全可行

**範例實作**:

```tsx
function ArtistsPage({ allArtistIds }: { allArtistIds: string[] }) {
  const [displayedCount, setDisplayedCount] = useState(20);
  const BATCH_SIZE = 20;

  // 計算當前需要顯示的 IDs
  const currentIds = allArtistIds.slice(0, displayedCount);

  // 分批獲取（每次最多 20 筆）
  const batches = chunk(currentIds, BATCH_SIZE);
  const results = batches.map((batchIds) =>
    useGetSeveralArtistsQuery(batchIds),
  );

  const loadMore = () => {
    setDisplayedCount((prev) =>
      Math.min(prev + BATCH_SIZE, allArtistIds.length),
    );
  };

  const hasMore = displayedCount < allArtistIds.length;

  return (
    <div>
      {results
        .flatMap(({ data }) => data || [])
        .map((artist) => (
          <ArtistCard key={artist.id} {...artist} />
        ))}
      {hasMore && <div ref={useInfiniteScroll(loadMore)} />}
    </div>
  );
}
```

**何時需要 API 分頁？**

- ❌ **本專案不需要**：搜尋結果來自本地資料或單次 API 回應
- ✅ **適用場景**：例如 "Browse All Artists on Spotify"，總數未知且極大（100,000+ 筆），需要 server-side pagination

### 3.7 References

- [MDN - Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Web.dev - Infinite Scroll with Intersection Observer](https://web.dev/articles/intersectionobserver)

---

## 4. Skeleton Loading Best Practices

### 4.1 Decision

為 `ArtistCard` 和 `TrackItem` 建立對應的 skeleton components，使用 shadcn/ui 的 `Skeleton` 作為基礎元件。

### 4.2 Rationale

- **Layout Shift Prevention**: Skeleton 尺寸需與實際元件完全一致，避免 CLS (Cumulative Layout Shift)
- **UX 優化**: Skeleton 應在資料載入時立即顯示（<200ms），提供視覺回饋
- **Accessibility**: 使用 `aria-busy="true"` 和 `aria-label="載入中"` 提供無障礙支援

### 4.3 Implementation Pattern

```tsx
// ArtistSkeleton.tsx
export function ArtistSkeleton() {
  return (
    <Card className="p-4" aria-busy="true" aria-label="載入藝人資訊中">
      <Skeleton className="aspect-square w-full rounded-full" />
      <Skeleton className="mx-auto mt-3 h-5 w-3/4" />
    </Card>
  );
}

// TrackSkeleton.tsx
export function TrackSkeleton() {
  return (
    <div
      className="flex items-center gap-3 p-2"
      aria-busy="true"
      aria-label="載入歌曲資訊中"
    >
      <Skeleton className="h-12 w-12 rounded" />
      <div className="flex-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-3 w-1/2" />
      </div>
    </div>
  );
}
```

### 4.4 Design Principles

1. **Match exact dimensions**: Skeleton 尺寸需與實際元件一致 (`aspect-square`, `h-12 w-12`)
2. **Visual hierarchy**: 主要資訊（名稱）的 skeleton 比次要資訊（年份）更寬
3. **Consistent spacing**: 使用與實際元件相同的 gap & padding
4. **Smooth animation**: 使用 shadcn/ui `Skeleton` 預設的 pulse 動畫

### 4.5 Alternatives Considered

- ❌ **Spinner/Loading indicator**: 不適合列表元件，無法預告實際內容的佈局
- ❌ **Blank space**: 會造成 layout shift
- ✅ **Content-aware skeleton**: 最佳 UX，符合 Design Guidelines

### 4.6 References

- [shadcn/ui - Skeleton](https://ui.shadcn.com/docs/components/skeleton)
- [Web.dev - Optimize CLS](https://web.dev/articles/optimize-cls)

---

## 5. Cloudflare Worker Proxy for Batch Endpoints

### 5.1 Decision

在 `worker/src/routes/spotify.ts` 新增 `/artists?ids=...` 和 `/tracks?ids=...` routes，forwarding 至 Spotify API。

### 5.2 Rationale

- 現有架構已使用 Cloudflare Worker 作為 Spotify API proxy（處理 OAuth token 與 CORS）
- Batch endpoints 僅需 forwarding，不需額外邏輯
- 保持一致性：所有 Spotify API 請求均透過 Worker

### 5.3 Implementation Pattern

```typescript
// worker/src/routes/spotify.ts
app.get("/artists", async (c) => {
  const ids = c.req.query("ids");
  if (!ids) {
    return c.json({ error: "Missing ids parameter" }, 400);
  }

  const spotifyUrl = `https://api.spotify.com/v1/artists?ids=${ids}`;
  const response = await fetch(spotifyUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return c.json(data.artists); // Return array of artists
});
```

### 5.4 Edge Cases

- ❌ 若 `ids` 參數缺失 → 回傳 400 Bad Request
- ❌ 若 ids 數量 >20 → 回傳 400 Bad Request（前端負責 chunking）
- ✅ 若某些 ID 不存在 → Spotify API 回傳 `null`（前端需過濾）

### 5.5 References

- [Hono - Query Parameters](https://hono.dev/docs/api/routing#query-parameters)
- [Spotify API - Error Handling](https://developer.spotify.com/documentation/web-api/concepts/api-calls#error-handling)

---

## 6. Cache Strategy for Spotify Data

### 6.1 Decision

使用 RTK Query 的**永久快取策略**（infinite cache），不設定 TTL，不重新驗證。

### 6.2 Rationale

- **資料特性**：Spotify artists/tracks 的核心資料（名稱、圖片、專輯資訊）變動頻率極低
  - 藝人名稱、照片：幾乎不變動
  - 歌曲名稱、專輯封面、發行日期：完全不變動
  - popularity 分數：會變動，但非關鍵資料
- **使用者體驗**：永久快取可確保：
  1. 瀏覽過的內容立即顯示（零延遲）
  2. 離線狀態下仍可查看已快取資料
  3. 減少不必要的網路請求
- **成本效益**：Artist/Track 物件平均 2-5KB，快取 100 筆約 200-500KB（可接受的記憶體成本）

### 6.3 Implementation

```typescript
export const spotifyApi = createApi({
  reducerPath: "spotifyApi",
  baseQuery: fetchBaseQuery({ baseUrl: WORKER_API_BASE_URL }),
  tagTypes: ["Artist", "Track", "AudioFeatures"],
  // 不設定 keepUnusedDataFor（預設無限期保留）
  // 不設定 refetchOnMountOrArgChange
  // 不設定 refetchOnReconnect
  endpoints: (builder) => ({
    /* ... */
  }),
});
```

### 6.4 Cache Invalidation Strategy

- **自動清除**：僅在以下情況清除快取：
  1. 使用者關閉分頁/瀏覽器（session 結束）
  2. 使用者手動清除瀏覽器快取
- **手動更新**：若未來需要強制更新特定資料，可使用 `api.util.invalidateTags(['Artist'])`

### 6.5 Alternatives Considered

- ❌ **60s TTL** (原提案): 不必要的重新驗證，增加網路請求
- ❌ **refetchOnReconnect**: Artist/Track 資料不需在重連後更新
- ✅ **Infinite cache**: 最符合資料特性與使用者需求

### 6.6 References

- [RTK Query - Cache Behavior](https://redux-toolkit.js.org/rtk-query/usage/cache-behavior)
- [RTK Query - Customizing Queries](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries)

---

## 7. 服務檔案整合決策

### 7.1 Decision

**保持分離**：`spotify-api.ts` 與 `index.ts` 維持現有結構，不進行合併。

### 7.2 Rationale

1. **職責分離**：
   - `spotify-api.ts`：RTK Query API slice 定義、endpoints、hooks 邏輯
   - `index.ts`：統一導出點，作為 public API 表面

2. **未來擴展性**：
   - 可能新增其他 API service（如 YouTube API）
   - `index.ts` 可統一導出多個 service

3. **匯入一致性**：
   - 全專案使用 `@/services` 作為進入點
   - 符合現有專案慣例與 Constitution III（可測試性）

4. **Batch endpoints 新增位置**：
   - 直接在 `spotify-api.ts` 的 `endpoints` 區塊新增
   - `index.ts` 自動繼承新 hooks（透過 re-export）

### 7.3 Implementation

```typescript
// src/services/spotify-api.ts
export const spotifyApi = createApi({
  // ... existing config
  endpoints: (builder) => ({
    getArtist: builder.query<...>({ ... }),
    getTrack: builder.query<...>({ ... }),
    getAudioFeatures: builder.query<...>({ ... }),
    // 新增 batch endpoints
    getSeveralArtists: builder.query<...>({ ... }),
    getSeveralTracks: builder.query<...>({ ... }),
  }),
});

export const {
  useGetArtistQuery,
  useGetTrackQuery,
  useGetAudioFeaturesQuery,
  // 新增
  useGetSeveralArtistsQuery,
  useGetSeveralTracksQuery,
} = spotifyApi;
```

```typescript
// src/services/index.ts - 無需修改，自動繼承新 hooks
export {
  spotifyApi,
  useGetArtistQuery,
  useGetTrackQuery,
  useGetAudioFeaturesQuery,
  useGetSeveralArtistsQuery, // 新增
  useGetSeveralTracksQuery, // 新增
} from "@/services/spotify-api";
```

### 7.4 Alternatives Considered

| 方案                      | 優點               | 缺點                            | 結論   |
| ------------------------- | ------------------ | ------------------------------- | ------ |
| **保持分離（採用）**      | 職責清晰、擴展性佳 | 多一個檔案                      | 推薦   |
| 合併為單一檔案            | 減少檔案數         | 失去分離優勢                    | 不採用 |
| 建立新檔案 (batch-api.ts) | 分離 batch 邏輯    | 過度拆分、不符合 RTK Query 慣例 | 不採用 |

### 7.5 References

- [RTK Query - Code Splitting](https://redux-toolkit.js.org/rtk-query/usage/code-splitting)

---

## Summary

所有研究項目均已解決，沒有 NEEDS CLARIFICATION 項目。關鍵技術決策：

1. ✅ RTK Query batch fetch 使用 `onQueryStarted` + `upsertQueryData` 填入快取
2. ✅ Spotify API 官方限制 50 筆/次，專案採用 20 筆/次（平衡資料量與請求數）
3. ✅ Infinite scroll 使用 IntersectionObserver（原生 API，最佳效能）
4. ✅ Skeleton 元件完全符合實際元件尺寸，避免 CLS
5. ✅ Cloudflare Worker 新增 batch routes，forwarding 至 Spotify API
6. ✅ 快取策略：永久快取（資料變動頻率極低，無需重新驗證）
7. ✅ 服務檔案整合：保持分離（spotify-api.ts + index.ts）

**Status**: ✅ Phase 0 Complete - Ready for Phase 1 (Data Model & Contracts)
