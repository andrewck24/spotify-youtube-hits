import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialSpotifyState } from "./spotify-types";

/**
 * Spotify Redux Slice
 *
 * Purpose: Manages Spotify API authentication token
 *
 * Reducers:
 * - setToken: Set access token and expiry
 * - clearToken: Clear token (on expiry or error)
 * - setTokenValid: Update token validity status
 * - setLoading: Update loading state
 * - setError: Set error message
 *
 * Note: Uses Client Credentials Flow (server-side tokens only)
 *
 * Usage:
 *   dispatch(setToken({ token, expiresIn }))
 *   const token = useAppSelector(selectSpotifyToken)
 */

interface SetTokenPayload {
  token: string;
  expiresIn: number; // seconds
}

const spotifySlice = createSlice({
  name: "spotify",
  initialState: initialSpotifyState,
  reducers: {
    /**
     * Set Spotify API access token
     * Called after successful token request
     */
    setToken: (state, action: PayloadAction<SetTokenPayload>) => {
      state.token = action.payload.token;
      // Calculate expiry timestamp (current time + expires_in seconds)
      state.tokenExpiry = Date.now() + action.payload.expiresIn * 1000;
      state.tokenValid = true;
      state.error = null;
    },

    /**
     * Clear token
     * Called when token expires or on authentication error
     */
    clearToken: (state) => {
      state.token = null;
      state.tokenExpiry = null;
      state.tokenValid = false;
    },

    /**
     * Update token validity status
     * Used to mark token as invalid without clearing it
     */
    setTokenValid: (state, action: PayloadAction<boolean>) => {
      state.tokenValid = action.payload;
    },

    /**
     * Update loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set error message
     * Used when token request fails
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  // extraReducers will be added here when authentication thunks are implemented (T020)
  // These thunks will be in spotify-api.ts service
});

export const { setToken, clearToken, setTokenValid, setLoading, setError } =
  spotifySlice.actions;

export default spotifySlice.reducer;
