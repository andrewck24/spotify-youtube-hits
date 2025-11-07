import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/formatters";
import type { SpotifyArtist } from "@/types/spotify";

/**
 * ArtistProfile Component
 *
 * Purpose: 顯示藝人資訊卡片
 *
 * Features:
 * - Artist image
 * - Name
 * - Follower count
 * - Popularity progress bar
 *
 * Props:
 * - artist: Spotify artist object
 *
 * Usage:
 *   <ArtistProfile artist={artist} />
 */

interface ArtistProfileProps {
  artist?: SpotifyArtist | null;
}

export function ArtistProfile({ artist }: ArtistProfileProps) {
  if (!artist) {
    return (
      <Card className="p-4 text-center text-[#B3B3B3]">
        選擇一個藝人以查看詳細資訊
      </Card>
    );
  }

  const image = artist.images?.[0];
  const popularity = artist.popularity || 0;

  return (
    <Card className="p-6 text-center">
      {/* Artist Image */}
      {image && (
        <div className="mb-4">
          <img
            src={image.url}
            alt={artist.name}
            className="w-full aspect-square object-cover rounded-lg"
          />
        </div>
      )}

      {/* Artist Name */}
      <h2 className="text-2xl font-bold text-white mb-2">{artist.name}</h2>

      {/* Followers */}
      <div className="text-sm text-[#B3B3B3] mb-4">
        {formatNumber(artist.followers?.total || 0)} 位追蹤者
      </div>

      {/* Genres */}
      {artist.genres && artist.genres.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-[#B3B3B3] mb-2">類型</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {artist.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 text-xs bg-[#1DB954] text-white rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Popularity Bar */}
      <div className="mt-4">
        <div className="text-xs text-[#B3B3B3] mb-2">人氣度</div>
        <div className="w-full h-2 bg-[#282828] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1DB954] transition-all"
            style={{ width: `${popularity}%` }}
          />
        </div>
        <div className="text-xs text-[#B3B3B3] mt-1">{popularity}/100</div>
      </div>
    </Card>
  );
}
