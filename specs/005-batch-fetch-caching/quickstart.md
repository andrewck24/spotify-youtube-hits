# Quickstart: Batch Fetch & Caching

**Feature**: 005-batch-fetch-caching  
**Date**: 2025-11-21  
**Purpose**: 快速上手開發指南，讓開發者快速理解並實作批次獲取與快取功能。

---

## 概覽

此功能實作以下三個核心部分：

1. **Batch Fetch API** - 一次請求獲取多筆資源（最多 20 筆）
2. **Cache Population** - 自動填入個別資源快取，子元件可直接使用
3. **Infinite Scroll + Skeleton** - 無限滾動與載入動畫

---

## 快速開始

### 1️⃣ 新增 RTK Query Endpoints

**檔案**: `src/services/spotify-api.ts`

**新增兩個 endpoints**:

- `getSeveralArtists(ids: string[])`
- `getSeveralTracks(ids: string[])`

**關鍵實作**:

```typescript
getSeveralArtists: builder.query<SpotifyArtist[], string[]>({
  query: (ids) => `/artists?ids=${ids.join(',')}`,
  transformResponse: (response: { artists: (SpotifyArtist | null)[] }) => {
    return response.artists.filter((artist): artist is SpotifyArtist => artist !== null);
  },
  providesTags: (result) =>
    result
      ? [...result.map(({ id }) => ({ type: 'Artist' as const, id })), 'Artist']
      : ['Artist'],
  async onQueryStarted(ids, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      data.forEach((artist) => {
        dispatch(spotifyApi.util.upsertQueryData('getArtist', artist.id, artist));
      });
    } catch {}
  },
}),
```

**為什麼需要 `onQueryStarted`?**

- RTK Query 預設不會將 batch 結果填入 single-item 快取
- 透過 `upsertQueryData`，我們手動填入 `getArtist(id)` 快取
- 子元件呼叫 `useGetArtistQuery(id)` 時，會直接從快取取得資料（無網路請求）

---

### 2️⃣ 修改搜尋結果元件

**檔案**: `src/components/search/artist-results.tsx`

**步驟**:

1. 從 `artists` 陣列中提取所有 `artistId`
2. 使用 `useGetSeveralArtistsQuery(artistIds)` 批次獲取資料
3. Loading 時顯示 `<ArtistSkeleton />`
4. 成功後，將完整資料傳給 `<ArtistCard />`

**範例**:

```tsx
export function ArtistSearchResults({ artists, viewMode }: Props) {
  const artistIds = artists.map((a) => a.artistId);
  const { data, isLoading } = useGetSeveralArtistsQuery(artistIds);

  if (isLoading) {
    return <ArtistSkeleton count={artistIds.length} />;
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {data?.map((artist) => (
        <ArtistCard
          key={artist.id}
          artistId={artist.id}
          artistName={artist.name}
          imageUrl={artist.images[0]?.url}
        />
      ))}
    </div>
  );
}
```

**注意事項**:

- ✅ `ArtistCard` 內部仍可使用 `useGetArtistQuery(artistId)` 獲取額外資料
- ✅ 此時會直接命中快取，不會發送新的網路請求
- ✅ 快取命中率 >90%

---

### 3️⃣ 建立 Skeleton 元件

**檔案**: `src/components/artist/skeleton.tsx`

**要求**:

- 尺寸必須與 `<ArtistCard />` 完全一致
- 使用 shadcn/ui 的 `<Skeleton />` 元件

**實作**:

```tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ArtistSkeleton() {
  return (
    <Card className="p-4" aria-busy="true" aria-label="載入藝人資訊中">
      <Skeleton className="aspect-square w-full rounded-full" />
      <Skeleton className="mx-auto mt-3 h-5 w-3/4" />
    </Card>
  );
}
```

**重點**:

- `aspect-square` → 與 `<ArtistCard />` 的圖片一致
- `rounded-full` → 與 Spotify 藝人頭像一致
- `aria-busy` 與 `aria-label` → 無障礙支援

---

### 4️⃣ 實作 Infinite Scroll

**檔案**: `src/hooks/use-infinite-scroll.ts`

**基於 IntersectionObserver**:

```typescript
import { useEffect, useRef } from "react";

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

**使用範例**:

```tsx
function ArtistsPage() {
  const [page, setPage] = useState(0);
  const sentinelRef = useInfiniteScroll(() => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  });

  return (
    <div>
      {artists.map((artist) => (
        <ArtistCard key={artist.id} {...artist} />
      ))}
      {isLoading && <ArtistSkeleton count={20} />}
      <div ref={sentinelRef} /> {/* Sentinel element */}
    </div>
  );
}
```

---

### 5️⃣ 新增 Cloudflare Worker Routes

**檔案**: `worker/src/routes/spotify.ts`

**新增兩個 routes**:

```typescript
app.get("/artists", async (c) => {
  const ids = c.req.query("ids");
  if (!ids) {
    return c.json(
      { error: { status: 400, message: "Missing ids parameter" } },
      400,
    );
  }

  const idArray = ids.split(",");
  if (idArray.length > 20) {
    return c.json(
      { error: { status: 400, message: "Max 20 ids allowed" } },
      400,
    );
  }

  const spotifyUrl = `https://api.spotify.com/v1/artists?ids=${ids}`;
  const response = await fetch(spotifyUrl, {
    headers: { Authorization: `Bearer ${env.SPOTIFY_ACCESS_TOKEN}` },
  });

  return c.json(await response.json());
});

// 同樣實作 app.get('/tracks', ...)
```

---

## 開發流程

### Phase 1: Batch Fetch (P1)

1. ✅ 新增 RTK Query endpoints (`getSeveralArtists`, `getSeveralTracks`)
2. ✅ 實作 `onQueryStarted` + `upsertQueryData`
3. ✅ 新增 Cloudflare Worker routes
4. ✅ 驗證快取命中率 >90%

### Phase 2: Search Page Optimization (P2)

1. ✅ 修改 `ArtistSearchResults` 使用 batch fetch
2. ✅ 修改 `TrackSearchResults` 使用 batch fetch
3. ✅ 建立 `ArtistSkeleton` 與 `TrackSkeleton`
4. ✅ 驗證網路請求數量減少 90%+

### Phase 3: Infinite Scroll (P2)

1. ✅ 實作 `useInfiniteScroll` hook
2. ✅ 建立 `ArtistsPage` 與 `TracksPage`
3. ✅ 新增 routes (`/artists`, `/tracks`)
4. ✅ 驗證支援至少 100 筆資料

### Phase 4: Polish (P3)

1. ✅ 優化 skeleton 動畫（smooth pulse）
2. ✅ 驗證 CLS <0.1
3. ✅ 無障礙支援（`aria-busy`, `aria-label`）

---

## 測試檢查清單

### Unit Tests (Vitest)

- [ ] `getSeveralArtists` 回傳正確資料
- [ ] `transformResponse` 過濾 `null` values
- [ ] `upsertQueryData` 成功填入快取
- [ ] `useInfiniteScroll` 正確觸發 callback

### Integration Tests (Playwright)

- [ ] 搜尋頁面：批次請求 1 次（而非 N 次）
- [ ] "View All" 頁面：滾動至底部自動載入下一頁
- [ ] Skeleton 顯示時間 <200ms
- [ ] 快取命中：返回頁面時無新請求

### Performance Tests

- [ ] 搜尋 20 筆結果：從 21 requests → 2 requests
- [ ] 快取命中率 >90%
- [ ] CLS <0.1

---

## 常見問題

### Q1: 為什麼不直接用 `useGetArtistQuery` 在 `<ArtistCard />` 中?

**A**: 可以！但這會導致 N 個網路請求（N = 藝人數量）。透過 batch fetch，只需 1 個請求，快取填入後，子元件的 `useGetArtistQuery` 會直接命中快取。

### Q2: 若搜尋結果 >20 筆怎麼辦?

**A**: Phase 1 搜尋頁面僅顯示前 8 筆（符合 20 筆限制）。Phase 2 "View All" 頁面需實作 chunking（`chunk(ids, 20).map(fetchBatch)`）。

### Q3: `onQueryStarted` 與 `providesTags` 的差異?

**A**:

- `providesTags`: 標記此 query 提供哪些 tags（用於 cache invalidation）
- `onQueryStarted`: 在 query 開始時執行 side-effect（例如：填入其他 query 的快取）

### Q4: Infinite scroll 會重複載入嗎?

**A**: 不會。透過 `isLoading` 與 `hasMore` 狀態控制，只有當 `!isLoading && hasMore` 時才會觸發下一頁載入。

---

## 參考資源

- [RTK Query - Cache Behavior](https://redux-toolkit.js.org/rtk-query/usage/cache-behavior)
- [Spotify API - Get Several Artists](https://developer.spotify.com/documentation/web-api/reference/get-multiple-artists)
- [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [shadcn/ui - Skeleton](https://ui.shadcn.com/docs/components/skeleton)

---

**準備好了嗎？** 開始實作 → `/speckit.tasks`
