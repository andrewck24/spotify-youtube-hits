import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  SpotifyArtist,
  SpotifyTrack,
  SpotifyAudioFeatures,
} from "@/types/spotify";

/**
 * RTK Query API Slice for Spotify
 *
 * This module provides all Spotify API endpoints as hooks for automatic caching,
 * request deduplication, and normalized data management.
 *
 * Base URL: /api/spotify (proxied through Cloudflare Worker)
 * Cache Strategy: RTK Query automatic caching with tag-based invalidation
 *
 * Features:
 * - Automatic request deduplication
 * - Built-in caching with configurable TTL
 * - Tag-based cache invalidation
 * - Loading/error states
 * - AbortController support for request cancellation
 *
 * Usage:
 *   import { useGetArtistQuery, useGetTrackQuery } from '@/features/api'
 *   const { data, isLoading, error } = useGetArtistQuery(artistId)
 */

export const spotifyApi = createApi({
  reducerPath: "spotifyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/spotify",
  }),
  tagTypes: ["Artist", "Track", "AudioFeatures"],
  endpoints: (builder) => ({
    // Get Artist Information
    getArtist: builder.query<SpotifyArtist, string>({
      query: (artistId) => `/artists/${artistId}`,
      providesTags: (result, _error, artistId) =>
        result ? [{ type: "Artist", id: artistId }] : ["Artist"],
    }),

    // Get Track Information
    getTrack: builder.query<SpotifyTrack, string>({
      query: (trackId) => `/tracks/${trackId}`,
      providesTags: (result, _error, trackId) =>
        result ? [{ type: "Track", id: trackId }] : ["Track"],
    }),

    // Get Track Audio Features
    getAudioFeatures: builder.query<SpotifyAudioFeatures, string>({
      query: (trackId) => `/audio-features/${trackId}`,
      providesTags: (result, _error, trackId) =>
        result ? [{ type: "AudioFeatures", id: trackId }] : ["AudioFeatures"],
    }),
  }),
});

/**
 * Cache Configuration
 *
 * - keepUnusedDataFor: 60 seconds - Keep cached data for 60 seconds after
 *   the last subscription is removed
 * - refetchOnMountOrArgChange: false - Don't refetch on mount or argument change
 *   to avoid duplicate requests (we want to use cached data)
 * - refetchOnReconnect: true - Refetch when the app regains network connection
 *   to ensure data freshness after offline periods
 *
 * Notes:
 * - Session-based caching only (cleared when tab/browser is closed)
 * - No persistent caching (localStorage, IndexedDB)
 * - No automatic cache invalidation (manual invalidation via tags if needed)
 */
export const {
  useGetArtistQuery,
  useGetTrackQuery,
  useGetAudioFeaturesQuery,
} = spotifyApi;

export default spotifyApi;
