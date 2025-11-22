# Data Model: Redesign Home Page

## Entities

### RecommendedTrack

Represents a track displayed in the Popular Tracks section.

| Field     | Type       | Description              | Source                           |
| :-------- | :--------- | :----------------------- | :------------------------------- |
| `id`      | `string`   | Spotify Track ID         | `RECOMMENDED_TRACK_IDS`          |
| `name`    | `string`   | Track Name               | Spotify API (`useGetTrackQuery`) |
| `artists` | `Artist[]` | List of artists          | Spotify API                      |
| `album`   | `Album`    | Album info (for artwork) | Spotify API                      |

### RecommendedArtist

Represents an artist displayed in the Popular Artists section.

| Field    | Type      | Description       | Source                            |
| :------- | :-------- | :---------------- | :-------------------------------- |
| `id`     | `string`  | Spotify Artist ID | `RECOMMENDED_ARTIST_IDS`          |
| `name`   | `string`  | Artist Name       | Spotify API (`useGetArtistQuery`) |
| `images` | `Image[]` | Artist images     | Spotify API                       |

## Constants

### `RECOMMENDED_TRACK_IDS`

A static list of Spotify Track IDs to be displayed on the home page.

```typescript
export const RECOMMENDED_TRACK_IDS = [
  "...", // Track ID 1
  "...", // Track ID 2
  // ...
] as const;
```
