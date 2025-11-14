/**
 * API Features Exports
 *
 * Central export point for all Spotify API queries and related hooks.
 * This ensures consistent importing patterns across the application.
 *
 * Usage:
 *   import { spotifyApi, useGetArtistQuery } from '@/features/api'
 */

export {
  spotifyApi,
  useGetArtistQuery,
  useGetTrackQuery,
  useGetAudioFeaturesQuery,
} from './spotify-api';
export { spotifyApi as default } from './spotify-api';
