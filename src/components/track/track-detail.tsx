import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/formatters";
import type { SpotifyAudioFeatures, SpotifyTrack } from "@/types/spotify";

/**
 * TrackDetail Component
 *
 * Purpose: 顯示歌曲詳細資訊卡片
 *
 * Features:
 * - Album cover
 * - Track info (name, artist, album, year)
 * - Duration
 * - Audio features (optional)
 * - Responsive layout
 *
 * Props:
 * - track: Spotify track object
 * - audioFeatures: Optional Spotify audio features object
 * - loading: Loading state
 *
 * Usage:
 *   <TrackDetail track={track} audioFeatures={features} loading={false} />
 */

interface TrackDetailProps {
  track?: SpotifyTrack | null;
  audioFeatures?: SpotifyAudioFeatures | null;
  loading?: boolean;
}

export function TrackDetail({
  track,
  audioFeatures: _audioFeatures,
  loading,
}: TrackDetailProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex gap-4">
          <Skeleton className="h-32 w-32 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
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
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Album Cover */}
        {albumCover && (
          <div className="flex-shrink-0">
            <img
              src={albumCover.url}
              alt={track.album?.name}
              className="h-40 w-40 rounded-lg object-cover shadow-lg"
            />
          </div>
        )}

        {/* Track Info */}
        <div className="flex-1">
          {/* Track Name */}
          <h2 className="mb-2 text-3xl font-bold text-white">{track.name}</h2>

          {/* Artist */}
          <div className="mb-4 text-lg text-[#1DB954]">
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
              className="mt-4 inline-block rounded-full bg-[#1DB954] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1ed760]"
            >
              在 Spotify 上開啟
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
