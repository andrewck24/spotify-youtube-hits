import {
  selectArtistError,
  selectArtistLoading,
  selectCurrentArtist,
} from "@/features/artist/artist-selectors";
import { fetchArtist } from "@/features/artist/artist-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { useEffect } from "react";

/**
 * Custom Hook: useArtist
 *
 * Purpose: 管理藝人資料載入
 *
 * Features:
 * - Auto-fetch artist data from Spotify API
 * - Handle loading/error states
 *
 * Props:
 * - artistId: Spotify artist ID
 *
 * Usage:
 *   const { artist, loading, error } = useArtist('artistId')
 */

interface UseArtistReturn {
  artist: ReturnType<typeof selectCurrentArtist>;
  loading: boolean;
  error: string | null;
}

export function useArtist(artistId?: string): UseArtistReturn {
  const dispatch = useAppDispatch();
  const artist = useAppSelector(selectCurrentArtist);
  const loading = useAppSelector(selectArtistLoading);
  const error = useAppSelector(selectArtistError);

  useEffect(() => {
    if (artistId && artistId !== artist?.id) {
      dispatch(fetchArtist(artistId));
    }
  }, [artistId, artist?.id, dispatch]);

  return {
    artist,
    loading,
    error,
  };
}
