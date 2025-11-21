# API Contract: Get Several Artists

**Endpoint**: `GET /api/spotify/artists`  
**Description**: 批次獲取多個藝人的完整資料  
**Rate Limit**: 遵循 Spotify API 限制（最多 20 筆/次）

---

## Request

### Query Parameters

| Parameter | Type     | Required | Description                          | Example       |
| --------- | -------- | -------- | ------------------------------------ | ------------- |
| `ids`     | `string` | ✅ Yes   | 逗號分隔的藝人 ID 列表（最多 20 個） | `id1,id2,id3` |

### Validation Rules

- `ids` 參數 MUST 存在
- `ids` MUST 包含 1-20 個有效的 Spotify Artist IDs
- Each ID MUST match pattern: `^[a-zA-Z0-9]{22}$`

### Example Request

```http
GET /api/spotify/artists?ids=3AA28KZvwAUcZuOKwyblJQ,6DPYiyq5kWVQS4RGwxzPC7,0YC192cP3KPCRWx8zr8MfZ HTTP/1.1
Host: localhost:9000
```

---

## Response

### Success Response (200 OK)

**Content-Type**: `application/json`

```json
{
  "artists": [
    {
      "id": "3AA28KZvwAUcZuOKwyblJQ",
      "name": "Gorillaz",
      "images": [
        {
          "url": "https://i.scdn.co/image/...",
          "height": 640,
          "width": 640
        }
      ],
      "genres": ["alternative rock", "art pop"],
      "popularity": 85,
      "followers": {
        "total": 8500000
      },
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/3AA28KZvwAUcZuOKwyblJQ"
      }
    },
    {
      "id": "6DPYiyq5kWVQS4RGwxzPC7",
      "name": "Daft Punk",
      "images": [...],
      ...
    }
  ]
}
```

### Response with Invalid IDs

若某些 ID 不存在，Spotify API 回傳 `null`：

```json
{
  "artists": [
    {
      "id": "3AA28KZvwAUcZuOKwyblJQ",
      "name": "Gorillaz",
      ...
    },
    null,  // Invalid or deleted ID
    {
      "id": "0YC192cP3KPCRWx8zr8MfZ",
      "name": "Arctic Monkeys",
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
getSeveralArtists: builder.query<SpotifyArtist[], string[]>({
  query: (ids) => {
    if (ids.length === 0 || ids.length > 20) {
      throw new Error('Invalid ids length: must be 1-20');
    }
    return `/artists?ids=${ids.join(',')}`;
  },
  transformResponse: (response: { artists: (SpotifyArtist | null)[] }) => {
    // Filter out null values
    return response.artists.filter((artist): artist is SpotifyArtist => artist !== null);
  },
  providesTags: (result) =>
    result
      ? [...result.map(({ id }) => ({ type: 'Artist' as const, id })), 'Artist']
      : ['Artist'],
  async onQueryStarted(ids, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      // Populate individual caches
      data.forEach((artist) => {
        dispatch(
          spotifyApi.util.upsertQueryData('getArtist', artist.id, artist)
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
function ArtistSearchResults({ artistIds }: { artistIds: string[] }) {
  const {
    data: artists,
    isLoading,
    error,
  } = useGetSeveralArtistsQuery(artistIds);

  if (isLoading) return <ArtistSkeleton count={artistIds.length} />;
  if (error) return <ErrorMessage />;

  return (
    <div>
      {artists?.map((artist) => (
        <ArtistCard key={artist.id} {...artist} />
      ))}
    </div>
  );
}
```

---

## Cloudflare Worker Implementation

```typescript
// worker/src/routes/spotify.ts
app.get("/artists", async (c) => {
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
  const spotifyUrl = `https://api.spotify.com/v1/artists?ids=${ids}`;
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

- [ ] ✅ Request with 1 ID returns 1 artist
- [ ] ✅ Request with 20 IDs returns 20 artists
- [ ] ❌ Request with 0 IDs returns 400 error
- [ ] ❌ Request with 21 IDs returns 400 error
- [ ] ✅ Request with invalid ID returns filtered response (null removed)
- [ ] ✅ Response populates individual cache via `upsertQueryData`
- [ ] ✅ Subsequent `useGetArtistQuery(id)` hits cache (no network request)
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
