import type {
  SpotifyArtist,
  SpotifyTrack,
  SpotifyAudioFeatures,
} from "@/types/spotify"

/**
 * Mock Spotify API data for testing
 */

export const mockSpotifyArtist: SpotifyArtist = {
  id: "3AA28KZvwAUcZuOKwyblJQ",
  name: "Gorillaz",
  images: [
    {
      url: "https://i.scdn.co/image/ab6761610000e5eb24f7c2f69a8d56bc4e3aafe8",
      width: 640,
      height: 640,
    },
  ],
  followers: { total: 8234567 },
  popularity: 82,
  genres: ["alternative hip hop", "art pop", "trip hop"],
}

export const mockSpotifyTrack: SpotifyTrack = {
  id: "0d28khcov6AiegSCpG5TuT",
  name: "Feel Good Inc.",
  artists: [
    {
      id: "3AA28KZvwAUcZuOKwyblJQ",
      name: "Gorillaz",
    },
  ],
  album: {
    id: "0bUTHlWbkSQysoM3VsWldT",
    name: "Demon Days",
    images: [
      {
        url: "https://i.scdn.co/image/ab67616d0000b2734a5bf7769b90f87c01b6ccf8",
        width: 640,
        height: 640,
      },
    ],
    release_date: "2005-05-23",
  },
  duration_ms: 222973,
  popularity: 89,
}

export const mockAudioFeatures: SpotifyAudioFeatures = {
  id: "0d28khcov6AiegSCpG5TuT",
  acousticness: 0.0244,
  danceability: 0.818,
  energy: 0.702,
  instrumentalness: 0.000132,
  liveness: 0.0975,
  speechiness: 0.202,
  valence: 0.772,
  tempo: 138.559,
  key: 7,
  mode: 1,
  time_signature: 4,
}

export const mockSpotifyToken = {
  access_token: "mock_access_token_12345",
  token_type: "Bearer",
  expires_in: 3600,
}
