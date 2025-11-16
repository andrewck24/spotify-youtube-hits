# RTK Query API Contracts

**Date**: 2025-11-14
**Related**: [data-model.md](../data-model.md), [research.md](../research.md)

## Base Configuration

**Base URL**: `/api/spotify` (proxied through Cloudflare Worker)
**Authentication**: Handled by Worker (transparent to frontend)
**Cache Strategy**: RTK Query automatic caching with tags

## Endpoints

### 1. Get Artist

**Endpoint**: `GET /artists/:artistId`
**Tag**: `Artist:{artistId}`
**Hook**: `useGetArtistQuery(artistId, { skip: !artistId })`

**Parameters**:

- `artistId` (string, required): Spotify Artist ID

**Response Type**: `SpotifyArtist`

**Example**:

```typescript
const { data, isLoading, error } = useGetArtistQuery("3AA28KZvwAUcZuOKwyblJQ");
```

---

### 2. Get Track

**Endpoint**: `GET /tracks/:trackId`
**Tag**: `Track:{trackId}`
**Hook**: `useGetTrackQuery(trackId, { skip: !trackId })`

**Parameters**:

- `trackId` (string, required): Spotify Track ID

**Response Type**: `SpotifyTrack`

**Example**:

```typescript
const { data, isLoading, error } = useGetTrackQuery("0d28khcov6AiegSCpG5TuT");
```

---

### 3. Get Audio Features

**Endpoint**: `GET /audio-features/:trackId`
**Tag**: `AudioFeatures:{trackId}`
**Hook**: `useGetAudioFeaturesQuery(trackId, { skip: !trackId })`

**Parameters**:

- `trackId` (string, required): Spotify Track ID

**Response Type**: `SpotifyAudioFeatures`

**Example**:

```typescript
const { data, isLoading, error } = useGetAudioFeaturesQuery(
  "0d28khcov6AiegSCpG5TuT"
);
```

---

## Error Handling

All endpoints use consistent error handling via RTK Query:

```typescript
const { data, isLoading, error, isError } = useGetArtistQuery(artistId);

if (isError) {
  // error.status: HTTP status code
  // error.data: Error message from API
  return <ErrorPage error={error} />;
}
```

## Cache Behavior

- **Invalidation**: Automatic based on tags
- **Deduplication**: Automatic for concurrent requests
- **Persistence**: Memory only (cleared on page close)
