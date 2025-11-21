# API Contract: Get Several Tracks

**Endpoint**: `GET /api/spotify/tracks`  
**Description**: 批次獲取多個歌曲的完整資料  
**Rate Limit**: 遵循 Spotify API 限制（最多 20 筆/次）

---

## Request

### Query Parameters

| Parameter | Type     | Required | Description                          | Example       |
| --------- | -------- | -------- | ------------------------------------ | ------------- |
| `ids`     | `string` | ✅ Yes   | 逗號分隔的歌曲 ID 列表（最多 20 個） | `id1,id2,id3` |

### Validation Rules

- `ids` 參數 MUST 存在
- `ids` MUST 包含 1-20 個有效的 Spotify Track IDs
- Each ID MUST match pattern: `^[a-zA-Z0-9]{22}$`

### Example Request

```http
GET /api/spotify/tracks?ids=11dFghVXANMlKmJXsNCbNl,3n3Ppam7vgaVa1iaRUc9Lp HTTP/1.1
Host: localhost:9000
```

---

## Response

### Success Response (200 OK)

**Content-Type**: `application/json`

```json
{
  "tracks": [
    {
      "id": "11dFghVXANMlKmJXsNCbNl",
      "name": "Clint Eastwood",
      "artists": [
        {
          "id": "3AA28KZvwAUcZuOKwyblJQ",
          "name": "Gorillaz"
        }
      ],
      "album": {
        "id": "0bUTHlWbkSQysoM3VsWldT",
        "name": "Gorillaz",
        "images": [
          {
            "url": "https://i.scdn.co/image/...",
            "height": 640,
            "width": 640
          }
        ],
        "release_date": "2001-03-26"
      },
      "duration_ms": 341333,
      "popularity": 82,
      "external_urls": {
        "spotify": "https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl"
      }
    },
    {
      "id": "3n3Ppam7vgaVa1iaRUc9Lp",
      "name": "Feel Good Inc.",
      ...
    }
  ]
}
```

### Response with Invalid IDs

若某些 ID 不存在，Spotify API 回傳 `null`：

```json
{
  "tracks": [
    {
      "id": "11dFghVXANMlKmJXsNCbNl",
      "name": "Clint Eastwood",
      ...
    },
    null,  // Invalid or deleted ID
    {
      "id": "3n3Ppam7vgaVa1iaRUc9Lp",
      "name": "Feel Good Inc.",
      ...
    }
  ]
}
```

**Frontend Handling**: MUST filter out `null` values before rendering.

---

## Error Responses

### 400 Bad Request

**Scenario**: Missing or invalid `ids` parameter

```json
{
  "error": {
    "status": 400,
    "message": "Missing or invalid ids parameter"
  }
}
```

### 401 Unauthorized

**Scenario**: Invalid or expired Spotify access token

```json
{
  "error": {
    "status": 401,
    "message": "The access token expired"
  }
}
```

### 429 Too Many Requests

**Scenario**: Rate limit exceeded

```json
{
  "error": {
    "status": 429,
    "message": "Rate limit exceeded",
    "retry_after": 30
  }
}
```

**Frontend Handling**: RTK Query 自動 retry with exponential backoff

### 500 Internal Server Error

**Scenario**: Spotify API 或 Worker 內部錯誤

```json
{
  "error": {
    "status": 500,
    "message": "Internal server error"
  }
}
```

---

## RTK Query Integration

### Endpoint Definition

```typescript
getSeveralTracks: builder.query<SpotifyTrack[], string[]>({
  query: (ids) => {
    if (ids.length === 0 || ids.length > 20) {
      throw new Error('Invalid ids length: must be 1-20');
    }
    return `/tracks?ids=${ids.join(',')}`;
  },
  transformResponse: (response: { tracks: (SpotifyTrack | null)[] }) => {
    // Filter out null values
    return response.tracks.filter((track): track is SpotifyTrack => track !== null);
  },
  providesTags: (result) =>
    result
      ? [...result.map(({ id }) => ({ type: 'Track' as const, id })), 'Track']
      : ['Track'],
  async onQueryStarted(ids, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      // Populate individual caches
      data.forEach((track) => {
        dispatch(
          spotifyApi.util.upsertQueryData('getTrack', track.id, track)
        );
      });
    } catch {
      // Error handled by RTK Query
    }
  },
}),
```

### Usage Example

```tsx
function TrackSearchResults({ trackIds }: { trackIds: string[] }) {
  const { data: tracks, isLoading, error } = useGetSeveralTracksQuery(trackIds);

  if (isLoading) return <TrackSkeleton count={trackIds.length} />;
  if (error) return <ErrorMessage />;

  return (
    <div>
      {tracks?.map((track) => (
        <TrackItem key={track.id} {...track} />
      ))}
    </div>
  );
}
```

---

## Cloudflare Worker Implementation

```typescript
// worker/src/routes/spotify.ts
app.get("/tracks", async (c) => {
  const ids = c.req.query("ids");

  // Validation
  if (!ids) {
    return c.json(
      { error: { status: 400, message: "Missing ids parameter" } },
      400,
    );
  }

  const idArray = ids.split(",");
  if (idArray.length === 0 || idArray.length > 20) {
    return c.json(
      {
        error: { status: 400, message: "Invalid ids length: must be 1-20" },
      },
      400,
    );
  }

  // Forward to Spotify API
  const spotifyUrl = `https://api.spotify.com/v1/tracks?ids=${ids}`;
  const response = await fetch(spotifyUrl, {
    headers: {
      Authorization: `Bearer ${env.SPOTIFY_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    return c.json(await response.json(), response.status);
  }

  const data = await response.json();
  return c.json(data);
});
```

---

## Testing Checklist

- [ ] ✅ Request with 1 ID returns 1 track
- [ ] ✅ Request with 20 IDs returns 20 tracks
- [ ] ❌ Request with 0 IDs returns 400 error
- [ ] ❌ Request with 21 IDs returns 400 error
- [ ] ✅ Request with invalid ID returns filtered response (null removed)
- [ ] ✅ Response populates individual cache via `upsertQueryData`
- [ ] ✅ Subsequent `useGetTrackQuery(id)` hits cache (no network request)
- [ ] ❌ Invalid token returns 401 error
- [ ] ✅ RTK Query retries on 429/500 errors

---

## Performance Expectations

| Metric                  | Target      |
| ----------------------- | ----------- |
| Request count reduction | 90%+ (20→2) |
| Cache hit rate          | >90%        |
| Response time (p95)     | <500ms      |
| Network bandwidth saved | ~85%        |

---

**Status**: ✅ Contract Complete - Ready for Implementation
