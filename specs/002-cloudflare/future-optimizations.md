# Future Optimizations

This document tracks potential optimizations and enhancements for future implementation.

## 1. API Caching with RTK Query

### Current State

The project currently uses Redux Toolkit's `createAsyncThunk` for API calls, which:

- ✅ Provides simple async state management
- ✅ Integrates well with Redux DevTools
- ❌ Does not cache API responses
- ❌ Does not deduplicate concurrent requests
- ❌ Requires manual implementation of loading/error states

### Problem

Every time a user selects an artist or track, the application makes a new API request to the Worker, even if the data was recently fetched. This results in:

1. **Unnecessary API calls** to Spotify (consumes rate limits)
2. **Slower user experience** (waiting for network requests)
3. **Higher Worker costs** (more requests to process)

### Proposed Solution: Migrate to RTK Query

**RTK Query** provides automatic caching and request deduplication similar to SWR and React Query.

#### Benefits

| Feature                      | Current (createAsyncThunk) | With RTK Query |
| ---------------------------- | -------------------------- | -------------- |
| Automatic caching            | ❌                         | ✅             |
| Request deduplication        | ❌                         | ✅             |
| Background revalidation      | ❌                         | ✅             |
| Optimistic updates           | ⚠️ Manual                  | ✅ Built-in    |
| Automatic garbage collection | ❌                         | ✅             |
| Polling support              | ❌                         | ✅             |
| Cache invalidation           | ⚠️ Manual                  | ✅ Tag-based   |

#### Implementation Overview

**Before (createAsyncThunk):**

```typescript
// src/features/artist/artist-slice.ts
export const fetchArtist = createAsyncThunk(
  "artist/fetchArtist",
  async (artistId: string) => {
    return await spotifyApi.getArtist(artistId);
  }
);

// Component usage
const dispatch = useAppDispatch();
dispatch(fetchArtist(artistId));
```

**After (RTK Query):**

```typescript
// src/services/spotify-rtk-query.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const spotifyApi = createApi({
  reducerPath: "spotifyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Artist", "Track", "AudioFeatures"],
  endpoints: (builder) => ({
    getArtist: builder.query<SpotifyArtist, string>({
      query: (id) => `/artists/${id}`,
      providesTags: (result, error, id) => [{ type: "Artist", id }],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),
    getTrack: builder.query<SpotifyTrack, string>({
      query: (id) => `/tracks/${id}`,
      providesTags: (result, error, id) => [{ type: "Track", id }],
      keepUnusedDataFor: 300,
    }),
    getAudioFeatures: builder.query<SpotifyAudioFeatures, string>({
      query: (id) => `/audio-features/${id}`,
      providesTags: (result, error, id) => [{ type: "AudioFeatures", id }],
      keepUnusedDataFor: 300,
    }),
  }),
});

// Auto-generated hooks
export const { useGetArtistQuery, useGetTrackQuery, useGetAudioFeaturesQuery } =
  spotifyApi;
```

**Component usage:**

```typescript
// src/components/artist/artist-detail.tsx
function ArtistDetail({ artistId }: { artistId: string }) {
  const {
    data: artist,
    isLoading,
    error,
  } = useGetArtistQuery(artistId, {
    // Refetch when window regains focus
    refetchOnFocus: true,
    // Refetch every 60 seconds
    pollingInterval: 60000,
  });

  // Data is automatically cached
  // Concurrent requests are automatically deduplicated
  // No need to manage loading/error states manually
}
```

#### Migration Steps

1. **Install RTK Query** (already included in @reduxjs/toolkit)
2. **Create API slice** (`src/services/spotify-rtk-query.ts`)
3. **Configure store** to include the API reducer and middleware
4. **Migrate endpoints** one by one:
   - Artist endpoints
   - Track endpoints
   - Audio Features endpoints
5. **Update components** to use auto-generated hooks
6. **Remove old thunks** and slice reducers
7. **Update tests** to work with RTK Query

#### Configuration Options

```typescript
// Cache configuration
keepUnusedDataFor: 300, // Keep cached data for 5 minutes

// Revalidation strategies
refetchOnMountOrArgChange: true,  // Refetch on component mount
refetchOnFocus: true,             // Refetch when window gains focus
refetchOnReconnect: true,         // Refetch when network reconnects

// Polling
pollingInterval: 60000,           // Poll every 60 seconds
skipPollingIfUnfocused: true,     // Pause polling when window loses focus
```

#### Performance Impact

**Estimated improvements:**

- **API requests**: 60-80% reduction (cached responses)
- **Loading time**: 80-95% faster (instant cache hits)
- **Worker costs**: 60-80% reduction (fewer API calls)
- **User experience**: Immediate data display for repeated views

**Example scenario:**

```plaintext
User flow: Search "Taylor Swift" → Select artist → Select track → Go back → Select same artist again

Without cache:
- Artist API call: 150ms
- Track API call: 120ms
- Artist API call: 150ms (duplicate!)
Total: 420ms

With RTK Query cache:
- Artist API call: 150ms (cached)
- Track API call: 120ms (cached)
- Artist API call: 0ms (cache hit!)
Total: 270ms (36% faster)
```

### Implementation Priority

Priority: **Medium**

**When to implement:**

- After Phase 7 (Polish) of the current Cloudflare integration
- When user analytics show frequent repeated API calls
- When preparing for production scale-up

**Estimated effort:**

- Development: 2-3 days
- Testing: 1 day
- Documentation: 0.5 day
- **Total: 3.5-4.5 days**

### Related Resources

- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [RTK Query Comparison with React Query/SWR](https://redux-toolkit.js.org/rtk-query/comparison)
- [Caching Behavior](https://redux-toolkit.js.org/rtk-query/usage/cache-behavior)

### Decision Log

- **2025-01-13**: Identified need for caching during Worker API integration review
- **2025-01-13**: Decided to defer implementation to future phase
- **Reason**: Current data flow is simple and functional; caching is an optimization, not a requirement
- **Next review**: After Phase 7 completion or when performance metrics indicate need

---

## 2. Future Optimization Ideas

### 2.1 Batch API Requests

**Status**: Considered but not implemented

The `getAudioFeaturesBatch()` method exists but is not currently used. Consider implementing batch requests for:

- Loading multiple tracks at once
- Fetching audio features for a playlist

### 2.2 Service Worker for Offline Support

Add service worker to cache:

- Static assets (React bundle, CSS)
- API responses
- Local data file (tracks.json)

### 2.3 Edge Caching with Cloudflare Cache API

Use Cloudflare's Cache API to cache Spotify responses at the edge:

- Reduce Spotify API calls
- Faster response times globally
- Respect Spotify rate limits better

---

Last updated: 2025-01-13
