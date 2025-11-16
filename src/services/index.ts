/**
 * Services Exports
 *
 * Central export point for all API services and related hooks.
 * This ensures consistent importing patterns across the application.
 *
 * Usage:
 *   import { spotifyApi, useGetArtistQuery } from '@/services'
 */

export {
  spotifyApi,
  useGetArtistQuery,
  useGetAudioFeaturesQuery,
  useGetTrackQuery,
} from "@/services/spotify-api";
