import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

// Import all reducers
import artistReducer from '@/features/artist/artist-slice';
import trackReducer from '@/features/track/track-slice';
import searchReducer from '@/features/search/search-slice';
import dataReducer from '@/features/data/data-slice';
import spotifyReducer from '@/features/spotify/spotify-slice';

/**
 * Redux Store Configuration
 *
 * Purpose: Central state management for the application
 * Features:
 * - Type-safe hooks (useAppDispatch, useAppSelector)
 * - Middleware configuration for handling non-serializable data (Fuse.js instance)
 * - Redux DevTools integration (enabled in development)
 *
 * State Structure:
 * - artist: Current selected artist and Spotify data
 * - track: Current selected track and audio features
 * - search: Search query and results (with Fuse.js instance)
 * - data: Local tracks database
 * - spotify: API authentication token
 *
 * Usage:
 *   import { store, useAppDispatch, useAppSelector } from '@/app/store'
 */

export const store = configureStore({
  reducer: {
    artist: artistReducer,
    track: trackReducer,
    search: searchReducer,
    data: dataReducer,
    spotify: spotifyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state for serialization checks
        // Required for storing Fuse.js instance in search slice
        ignoredActions: ['search/initializeSearch'],
        ignoredPaths: ['search.fuseInstance'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Type-safe hooks for use throughout the app
// Use these instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
