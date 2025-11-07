import {
  selectAudioFeatures,
  selectCurrentTrack,
  selectTrackError,
  selectTrackLoading,
} from "@/features/track/track-selectors";
import {
  fetchAudioFeatures,
  fetchTrackDetails,
} from "@/features/track/track-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { useEffect } from "react";

/**
 * Custom Hook: useTrack
 *
 * Purpose: 管理歌曲詳情與音樂特徵載入
 *
 * Features:
 * - Fetch track details from Spotify API
 * - Fetch audio features (可平行執行)
 * - Handle loading/error states
 *
 * Props:
 * - trackId: Spotify track ID
 *
 * Usage:
 *   const { track, features, loading, error } = useTrack('trackId')
 */

interface UseTrackReturn {
  track: ReturnType<typeof selectCurrentTrack>;
  features: ReturnType<typeof selectAudioFeatures>;
  loading: boolean;
  error: string | null;
}

export function useTrack(trackId?: string): UseTrackReturn {
  const dispatch = useAppDispatch();
  const track = useAppSelector(selectCurrentTrack);
  const features = useAppSelector(selectAudioFeatures);
  const loading = useAppSelector(selectTrackLoading);
  const error = useAppSelector(selectTrackError);

  useEffect(() => {
    if (trackId && trackId !== track?.id) {
      // 平行執行 fetchTrackDetails 與 fetchAudioFeatures
      dispatch(fetchTrackDetails(trackId));
      dispatch(fetchAudioFeatures(trackId));
    }
  }, [trackId, track?.id, dispatch]);

  return {
    track,
    features,
    loading,
    error,
  };
}
