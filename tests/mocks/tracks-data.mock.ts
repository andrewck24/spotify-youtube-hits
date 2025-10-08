import type { LocalTrack, TracksDatabase } from "@/types/data-schema"

/**
 * Mock local tracks database for testing
 */

export const mockLocalTrack: LocalTrack = {
  trackId: "0d28khcov6AiegSCpG5TuT",
  trackName: "Feel Good Inc.",
  artistId: "3AA28KZvwAUcZuOKwyblJQ",
  artistName: "Gorillaz",
  releaseYear: 2005,
  spotifyPopularity: 89,
  youtubeViews: 456789123,
  youtubeLikes: 3456789,
  youtubeComments: 234567,
}

export const mockLocalTracks: LocalTrack[] = [
  mockLocalTrack,
  {
    trackId: "3VWdccgVOHf15Ii6M2NvH7",
    trackName: "Clint Eastwood",
    artistId: "3AA28KZvwAUcZuOKwyblJQ",
    artistName: "Gorillaz",
    releaseYear: 2001,
    spotifyPopularity: 85,
    youtubeViews: 398765432,
    youtubeLikes: 2987654,
    youtubeComments: 198765,
  },
  {
    trackId: "1foMv2HQwfQ2vntFf9HFeG",
    trackName: "On Melancholy Hill",
    artistId: "3AA28KZvwAUcZuOKwyblJQ",
    artistName: "Gorillaz",
    releaseYear: 2010,
    spotifyPopularity: 83,
    youtubeViews: 287654321,
    youtubeLikes: 2345678,
    youtubeComments: 156789,
  },
]

export const mockTracksDatabase: TracksDatabase = {
  metadata: {
    version: "2023.1",
    generatedAt: "2023-11-15T10:00:00Z",
    totalTracks: 3,
    dataSource: "Spotify API + YouTube API",
  },
  tracks: mockLocalTracks,
}
