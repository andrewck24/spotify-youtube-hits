import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/formatters";
import type { SpotifyTrack } from "@/types/spotify";

/**
 * TrackDetail Component
 *
 * Purpose: 顯示歌曲詳細資訊卡片
 *
 * Features:
 * - Album cover
 * - Track info (name, artist, album, year)
 * - Duration
 * - Responsive layout
 *
 * Props:
 * - track: Spotify track object
 * - loading: Loading state
 *
 * Usage:
 *   <TrackDetail track={track} loading={false} />
 */

interface TrackDetailProps {
  track?: SpotifyTrack | null;
  loading?: boolean;
}

export function TrackDetail({ track, loading }: TrackDetailProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex gap-4">
          <Skeleton className="w-32 h-32 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-4" />
          </div>
        </div>
      </Card>
    );
  }

  if (!track) {
    return (
      <Card className="p-6 text-center text-[#B3B3B3]">
        選擇一首歌曲以查看詳細資訊
      </Card>
    );
  }

  const albumCover = track.album?.images?.[0];
  const duration = formatDuration(track.duration_ms);

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Album Cover */}
        {albumCover && (
          <div className="flex-shrink-0">
            <img
              src={albumCover.url}
              alt={track.album?.name}
              className="w-40 h-40 rounded-lg object-cover shadow-lg"
            />
          </div>
        )}

        {/* Track Info */}
        <div className="flex-1">
          {/* Track Name */}
          <h2 className="text-3xl font-bold text-white mb-2">{track.name}</h2>

          {/* Artist */}
          <div className="text-lg text-[#1DB954] mb-4">
            {track.artists?.map((a) => a.name).join(", ")}
          </div>

          {/* Album Info */}
          <div className="space-y-2 text-sm text-[#B3B3B3]">
            <div>
              <span className="font-semibold">專輯</span>: {track.album?.name}
            </div>
            <div>
              <span className="font-semibold">發行年份</span>:{" "}
              {track.album?.release_date?.split("-")[0]}
            </div>
            <div>
              <span className="font-semibold">時長</span>: {duration}
            </div>
            <div>
              <span className="font-semibold">人氣度</span>: {track.popularity}
              /100
            </div>
          </div>

          {/* Spotify Link */}
          {track.external_urls?.spotify && (
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-4 py-2 bg-[#1DB954] text-white rounded-full text-sm font-semibold hover:bg-[#1ed760] transition-colors"
            >
              在 Spotify 上開啟
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
