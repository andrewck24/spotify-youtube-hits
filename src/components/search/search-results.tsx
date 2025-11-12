import { Card } from "@/components/ui/card";
import { fetchArtist } from "@/features/artist/artist-slice";
import { selectTracks } from "@/features/data/data-selectors";
import { getTracksByArtist } from "@/features/search/search-service";
import { useSearch } from "@/hooks/use-search";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { useCallback } from "react";

/**
 * SearchResults Component
 *
 * Purpose: 顯示搜尋結果清單（藝人列表）
 *
 * Features:
 * - Display up to 12 results
 * - Show artist name + popularity score
 * - Click to select artist
 * - Empty state handling
 *
 * Usage:
 *   <SearchResults />
 */

export function SearchResults() {
  const dispatch = useAppDispatch();
  const { results } = useSearch();
  const tracks = useAppSelector(selectTracks);

  const handleSelectArtist = useCallback(
    (artistId: string, artistName: string) => {
      // 驗證該藝人是否有歌曲資料
      const artistTracks = getTracksByArtist(tracks, artistName);

      if (artistTracks.length === 0) {
        return;
      }

      // 直接觸發 fetchArtist thunk，從 Spotify API 取得完整藝人資訊
      // 這會自動更新 Redux store 中的 currentArtist
      dispatch(fetchArtist(artistId));
    },
    [dispatch, tracks]
  );

  if (results.length === 0) {
    return (
      <Card className="p-4 text-center text-[#B3B3B3]">
        {results.length === 0 ? "輸入藝人名稱搜尋..." : "查無相關藝人"}
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        {results.map((result, index) => {
          const track = result.item;
          const score = result.score || 0;

          return (
            <button
              key={`${track.artistId}-${index}`}
              onClick={() =>
                handleSelectArtist(track.artistId, track.artistName)
              }
              className="w-full p-3 border-b border-[#282828] hover:bg-[#282828] transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">
                    {track.artistName}
                  </div>
                  <div className="text-xs text-[#B3B3B3] mt-1">
                    人氣度: {track.popularity.spotifyPopularity ?? 0}/100
                  </div>
                </div>
                <div className="text-xs text-[#1DB954] ml-2">
                  {(score * 100).toFixed(0)}% match
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
