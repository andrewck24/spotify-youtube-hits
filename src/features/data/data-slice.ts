import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LocalTrackData, LocalTracksDatabase } from '@/types/data-schema';
import { initialDataState } from './data-types';
import { loadTracksDatabase, checkDataIntegrity } from '@/services/data-loader';
import { storage } from '@/services/storage';

/**
 * Data Redux Slice
 *
 * Purpose: Manages local tracks database loading and state
 *
 * Reducers:
 * - setTracks: Set loaded tracks data
 * - setLoaded: Mark data as loaded
 * - setLoading: Update loading state
 * - setError: Set error message
 * - setVersion: Set data version
 *
 * Async Thunks:
 * - loadLocalData: Load tracks from JSON file or sessionStorage
 *
 * Usage:
 *   dispatch(loadLocalData())
 *   const tracks = useAppSelector(selectTracks)
 */

/**
 * 載入本地資料庫的 Async Thunk
 * 優先嘗試從 sessionStorage 讀取，若不存在或版本過期則從遠端載入
 */
export const loadLocalData = createAsyncThunk(
  'data/loadLocalData',
  async (_, { rejectWithValue }) => {
    try {
      // T028: 先檢查 sessionStorage 快取
      const cachedData = storage.loadTracksData();
      const cachedVersion = storage.getDataVersion();

      if (cachedData && cachedVersion) {
        // 快取存在，直接使用
        console.log('Using cached data version:', cachedVersion);
        checkDataIntegrity(cachedData);
        return cachedData;
      }

      // T027: 快取不存在或版本過期，下載遠端資料
      console.log('Loading data from remote...');
      const remoteData = await loadTracksDatabase();

      // 檢查資料完整性
      checkDataIntegrity(remoteData);

      // T028: 儲存至 sessionStorage
      const saved = storage.saveTracksData(remoteData);
      if (!saved) {
        console.warn('Failed to cache data to sessionStorage');
      }

      return remoteData;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to load data:', message);
      return rejectWithValue(message);
    }
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState: initialDataState,
  reducers: {
    /**
     * Set the loaded tracks data
     * This is called after successfully loading tracks.json
     */
    setTracks: (state, action: PayloadAction<LocalTrackData[]>) => {
      state.tracks = action.payload;
      state.error = null;
    },

    /**
     * Mark data as successfully loaded
     */
    setLoaded: (state, action: PayloadAction<boolean>) => {
      state.loaded = action.payload;
    },

    /**
     * Update loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set error message
     * Used when data loading fails
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    /**
     * Set data version
     * Used for cache invalidation
     */
    setVersion: (state, action: PayloadAction<string>) => {
      state.version = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLocalData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLocalData.fulfilled, (state, action: PayloadAction<LocalTracksDatabase>) => {
        state.tracks = action.payload.tracks;
        state.version = action.payload.version;
        state.loaded = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loadLocalData.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to load tracks';
        state.loading = false;
      });
  },
});

export const { setTracks, setLoaded, setLoading, setError, setVersion } =
  dataSlice.actions;

export default dataSlice.reducer;
