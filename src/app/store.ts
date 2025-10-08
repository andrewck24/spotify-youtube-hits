import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Redux Store Configuration
 *
 * Purpose: Central state management for the application
 * Features:
 * - Type-safe hooks (useAppDispatch, useAppSelector)
 * - Middleware configuration for handling non-serializable data (Fuse.js instance)
 * - Redux DevTools integration (enabled in development)
 *
 * Usage:
 *   import { store, useAppDispatch, useAppSelector } from '@/app/store'
 *
 * Note: Reducers will be added incrementally (artist, track, search, data, spotify)
 */

export const store = configureStore({
  reducer: {
    // Reducers will be added here as they are implemented
    // artist: artistReducer,
    // track: trackReducer,
    // search: searchReducer,
    // data: dataReducer,
    // spotify: spotifyReducer,
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
