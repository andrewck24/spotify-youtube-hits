# Data Model: Batch Fetch & Caching

**Feature**: 005-batch-fetch-caching  
**Date**: 2025-11-21  
**Purpose**: Define data entities, validation rules, and state transitions for batch fetching and caching.

---

## 1. Core Entities

### 1.1 SpotifyArtist (Existing Type)

**Source**: `src/types/spotify.ts` (已存在)

**Description**: 完整的 Spotify 藝人資料，從 Spotify API 獲取。

**Fields**:

```typescript
interface SpotifyArtist {
  id: string; // Spotify artist ID (e.g., "3AA28KZvwAUcZuOKwyblJQ")
  name: string; // Artist name (e.g., "Gorillaz")
  images: SpotifyImage[]; // Array of images (different sizes)
  genres: string[]; // Array of genres (e.g., ["alternative rock"])
  popularity: number; // Popularity score (0-100)
  followers: {
    total: number; // Number of followers
  };
  external_urls: {
    spotify: string; // Spotify URL
  };
}

interface SpotifyImage {
  url: string; // Image URL
  height: number; // Height in pixels
  width: number; // Width in pixels
}
```

**Validation Rules**:

- `id` MUST be non-empty string
- `name` MUST be non-empty string
- `images` MAY be empty array (fallback to placeholder icon)
- `popularity` MUST be 0-100

**Source of Truth**: Spotify API `/artists/{id}` response

---

### 1.2 SpotifyTrack (Existing Type)

**Source**: `src/types/spotify.ts` (已存在)

**Description**: 完整的 Spotify 歌曲資料。

**Fields**:

```typescript
interface SpotifyTrack {
  id: string; // Spotify track ID
  name: string; // Track name
  artists: SpotifyArtist[]; // Array of artists (simplified)
  album: {
    id: string; // Album ID
    name: string; // Album name
    images: SpotifyImage[]; // Album cover images
    release_date: string; // Release date (YYYY-MM-DD)
  };
  duration_ms: number; // Duration in milliseconds
  popularity: number; // Popularity score (0-100)
  external_urls: {
    spotify: string; // Spotify URL
  };
}
```

**Validation Rules**:

- `id` MUST be non-empty string
- `name` MUST be non-empty string
- `album.images` MAY be empty array (fallback to placeholder)
- `duration_ms` MUST be > 0

**Source of Truth**: Spotify API `/tracks/{id}` response

---

## 2. New Types for Batch Fetching

### 2.1 BatchFetchRequest

**Description**: 前端發送的批次請求參數。

```typescript
interface BatchFetchRequest {
  ids: string[]; // Array of Spotify IDs (max 20 items)
}
```

**Validation Rules**:

- `ids` MUST be non-empty array
- `ids.length` MUST be <= 20
- Each `id` MUST be valid Spotify ID format (22 characters, alphanumeric)

**Validation Logic** (前端):

```typescript
function validateBatchRequest(ids: string[]): boolean {
  if (ids.length === 0 || ids.length > 20) return false;
  return ids.every((id) => /^[a-zA-Z0-9]{22}$/.test(id));
}
```

---

### 2.2 BatchFetchResponse

**Description**: 後端回應的批次資料。

```typescript
// Artists batch response
interface ArtistsBatchResponse {
  artists: SpotifyArtist[]; // Array of artists (may contain null for invalid IDs)
}

// Tracks batch response
interface TracksBatchResponse {
  tracks: SpotifyTrack[]; // Array of tracks (may contain null for invalid IDs)
}
```

**Validation Rules**:

- Response MAY contain `null` for invalid/deleted IDs
- Frontend MUST filter out `null` values before rendering

**Filtering Logic**:

```typescript
const validArtists = response.artists.filter((artist) => artist !== null);
```

---

## 3. RTK Query Cache State

### 3.1 Cache Structure

RTK Query 維護以下快取結構：

```typescript
// Single artist cache entry
{
  'spotifyApi': {
    queries: {
      'getArtist("3AA28KZvwAUcZuOKwyblJQ")': {
        status: 'fulfilled',
        data: SpotifyArtist,
        requestId: '...',
        startedTimeStamp: 1234567890,
        fulfilledTimeStamp: 1234567891,
      },
      'getSeveralArtists(["id1", "id2"])': {
        status: 'fulfilled',
        data: [SpotifyArtist, SpotifyArtist],
        ...
      }
    },
    provided: {
      Artist: {
        'id1': ['getSeveralArtists(["id1", "id2"])'],
        'id2': ['getSeveralArtists(["id1", "id2"])'],
      }
    }
  }
}
```

### 3.2 Cache Population Flow

1. **Batch fetch triggered**: `useGetSeveralArtistsQuery(['id1', 'id2'])`
2. **Network request**: `GET /api/spotify/artists?ids=id1,id2`
3. **onQueryStarted lifecycle**:
   - Wait for `queryFulfilled`
   - For each artist in response: `dispatch(upsertQueryData('getArtist', artist.id, artist))`
4. **Cache state after**:
   - `getSeveralArtists(['id1', 'id2'])` cached
   - `getArtist('id1')` cached (no network request)
   - `getArtist('id2')` cached (no network request)

### 3.3 Cache Invalidation

**TTL (Time-to-Live)**: Infinite (永久快取) - 已在 `T005` 配置

**Invalidation Triggers**:

- ✅ 頁面重新整理時自動清空（RTK Query in-memory cache 特性）
- ❌ 不設定 TTL (`keepUnusedDataFor` 不設定或設為 `Infinity`)
- ❌ 不在斷線重連後重新獲取 (`refetchOnReconnect: false`)
- ❌ 不會在 mount 時重新獲取 (`refetchOnMountOrArgChange: false`)

**Rationale**: Artist/Track 基本資料變動頻率極低（數月至數年），採用永久快取可達成 >90% 快取命中率目標。使用者重新整理頁面時會自動獲得最新資料。

---

## 4. Infinite Scroll State

### 4.1 Pagination State

```typescript
interface PaginationState {
  currentPage: number; // Current page (0-based)
  itemsPerPage: number; // Items per page (e.g., 20)
  totalItems: number; // Total items (from search results)
  hasMore: boolean; // Whether more items available
  isLoading: boolean; // Whether currently loading
}
```

### 4.2 State Transitions

```text
Initial State:
  currentPage = 0
  hasMore = true
  isLoading = false

User scrolls to bottom:
  isLoading = true
  → Fetch next batch
  → Update items list
  → currentPage++
  → isLoading = false
  → hasMore = (currentPage * itemsPerPage < totalItems)

No more items:
  hasMore = false
  → Hide sentinel element
```

---

## 5. Skeleton Loading State

### 5.1 Loading State Types

```typescript
type LoadingState = "idle" | "loading" | "success" | "error";
```

### 5.2 Component State Transitions

```text
Component Mount:
  state = 'loading'
  → Show skeleton

Data Fetched:
  state = 'success'
  → Show real content

Infinite Scroll Loading:
  state = 'success' (for existing items)
  isLoadingMore = true (for new items)
  → Show skeletons at bottom
```

---

## 6. Data Flow Diagram

```text
┌──────────────┐
│ Search Page  │
└──────┬───────┘
       │
       │ Search results (IDs only)
       │ e.g., [id1, id2, ..., id8]
       ▼
┌──────────────────────────┐
│ ArtistSearchResults      │
│ (batch fetch trigger)    │
└──────┬───────────────────┘
       │
       │ useGetSeveralArtistsQuery([id1, ..., id8])
       ▼
┌──────────────────────────┐
│ RTK Query                │
│ 1. Fetch /artists?ids=...│
│ 2. onQueryStarted        │
│ 3. upsertQueryData       │
└──────┬───────────────────┘
       │
       │ Cache populated for each id
       ▼
┌──────────────────────────┐
│ ArtistCard (child)       │
│ useGetArtistQuery(id1)   │
│ → Cache hit! No request  │
└──────────────────────────┘
```

---

## 7. Error Handling

### 7.1 Batch Fetch Errors

**Scenario**: Spotify API 回傳 error (e.g., 401, 500)

**Handling**:

- RTK Query 自動 retry (3 次，預設行為)
- 若仍失敗 → `error` state
- UI 顯示錯誤訊息，不顯示 skeleton

### 7.2 Invalid IDs

**Scenario**: 某些 ID 不存在（Spotify API 回傳 `null`）

**Handling**:

```typescript
const validArtists = response.artists.filter((artist) => artist !== null);
```

### 7.3 Network Offline

**Scenario**: 使用者離線

**Handling**:

- RTK Query 自動使用快取（若存在）
- 若快取不存在 → `error` state
- 重新連線後 → 自動 refetch (`refetchOnReconnect: true`)

---

## Summary

**Core Entities**: `SpotifyArtist`, `SpotifyTrack` (已存在)  
**New Types**: `BatchFetchRequest`, `BatchFetchResponse` (validation logic)  
**Cache Strategy**: RTK Query in-memory cache + `upsertQueryData` pattern  
**State Management**: Pagination state for infinite scroll, loading states for skeleton  
**Error Handling**: Filter null values, retry on failure, offline support

**Status**: ✅ Phase 1 Data Model Complete - Ready for Contracts
