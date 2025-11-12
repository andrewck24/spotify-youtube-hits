import { Card } from "@/components/ui/card";
import {
  fetchAudioFeatures,
  fetchTrackDetails,
} from "@/features/track/track-slice";
import { formatNumber } from "@/lib/formatters";
import { useAppDispatch } from "@/lib/store";
import type { LocalTrackData } from "@/types/data-schema";

/**
 * TrackList Component
 *
 * Purpose: 顯示歌曲清單
 *
 * Features:
 * - Track list with pagination
 * - Click to select track
 * - Show popularity score
 * - Scrollable list
 *
 * Props:
 * - tracks: Array of track data
 *
 * Usage:
 *   <TrackList tracks={tracks} />
 */

interface TrackListProps {
  tracks: LocalTrackData[];
}

export function TrackList({ tracks }: TrackListProps) {
  const dispatch = useAppDispatch();

  const handleSelectTrack = (track: LocalTrackData) => {
    // 直接觸發 thunks 從 Spotify API 取得完整資料
    // fetchTrackDetails 會自動更新 Redux store 中的 currentTrack
    dispatch(fetchTrackDetails(track.trackId));
    // 同時取得音樂特徵資料
    dispatch(fetchAudioFeatures(track.trackId));
  };

  if (tracks.length === 0) {
    return <Card className="p-4 text-center text-[#B3B3B3]">沒有歌曲</Card>;
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        {tracks.map((track, index) => (
          <button
            key={`${track.trackId}-${index}`}
            onClick={() => handleSelectTrack(track)}
            className="w-full p-3 border-b border-[#282828] hover:bg-[#282828] transition-colors text-left"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {track.trackName}
                </div>
                <div className="text-xs text-[#B3B3B3] mt-1">
                  {track.releaseYear} •{" "}
                  {formatNumber(track.popularity.youtubeViews)} views
                </div>
              </div>
              <div className="text-xs text-[#1DB954] ml-2 flex-shrink-0">
                {track.popularity.spotifyPopularity ?? 0}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
