import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useSearch } from '@/hooks/use-search';
import { setCurrentArtist } from '@/features/artist/artist-slice';
import { getTracksByArtist } from '@/features/search/search-service';
import { selectTracks } from '@/features/data/data-selectors';
import { Card } from '@/components/ui/card';

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
      // 從搜尋結果找到對應的 artist object
      // 先從 Spotify API 視角建構一個基本的 artist 物件
      // 實際上後續會透過 fetchArtist thunk 更新完整資訊
      const artistTracks = getTracksByArtist(tracks, artistName);

      if (artistTracks.length === 0) {
        console.warn('No tracks found for artist:', artistName);
        return;
      }

      // 建構基本的 artist object（之後會被 Spotify API 資料覆蓋）
      const basicArtist = {
        id: artistId,
        name: artistName,
        uri: `spotify:artist:${artistId}`,
        external_urls: {
          spotify: `https://open.spotify.com/artist/${artistId}`,
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: [],
        href: `https://api.spotify.com/v1/artists/${artistId}`,
        images: [],
        popularity: 0,
        type: 'artist' as const,
      };

      dispatch(setCurrentArtist(basicArtist));
    },
    [dispatch, tracks]
  );

  if (results.length === 0) {
    return (
      <Card className="p-4 text-center text-[#B3B3B3]">
        {results.length === 0 ? '輸入藝人名稱搜尋...' : '查無相關藝人'}
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
              onClick={() => handleSelectArtist(track.artistId, track.artistName)}
              className="w-full p-3 border-b border-[#282828] hover:bg-[#282828] transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{track.artistName}</div>
                  <div className="text-xs text-[#B3B3B3] mt-1">
                    人氣度: {track.popularity.spotifyPopularity}/100
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
