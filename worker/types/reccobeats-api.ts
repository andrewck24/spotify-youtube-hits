/**
 * ReccoBeats API Audio Features Response Interface
 * See: https://reccobeats.com/docs/apis/get-audio-features
 */

export interface ReccoBeatsAudioFeaturesResponse {
  content: AudioFeature[];
}

export interface AudioFeature {
  id: string;
  href: string;
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  valence: number;
}
