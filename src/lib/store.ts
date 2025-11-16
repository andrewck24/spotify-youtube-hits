import { spotifyApi } from "@/services";
import { configureStore } from "@reduxjs/toolkit";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

/**
 * Redux Store Configuration
 *
 * Purpose: Central state management for the application
 * Features:
 * - Type-safe hooks (useAppDispatch, useAppSelector)
 * - Redux DevTools integration (enabled in development)
 *
 * State Structure:
 * - spotifyApi: RTK Query cache for Spotify API data
 *
 * Note: Local tracks database (tracks.json) is now loaded via React Router loader
 * instead of Redux state. See @/loaders/tracks-loader.ts
 *
 * Usage:
 *   import { store, useAppDispatch, useAppSelector } from '@/lib/store'
 */

export const store = configureStore({
  reducer: {
    [spotifyApi.reducerPath]: spotifyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(spotifyApi.middleware),
  devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools in development
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Type-safe hooks for use throughout the app
// Use these instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
