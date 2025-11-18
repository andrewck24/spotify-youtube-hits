import { Card } from "@/components/ui/card";
import { RiMusic2Fill } from "react-icons/ri";
import { Link } from "react-router-dom";

/**
 * TrackItem Component
 *
 * Purpose: 可重用的歌曲列表項元件
 *
 * Features:
 * - 水平佈局（[封面 48x48] [曲名/藝人] [年份]）
 * - 封面圓角 4px（Spotify 專輯封面標準）
 * - 藝人連結可選（showArtistLink prop）
 * - 未載入圖片時顯示 placeholder
 * - 遵循 Spotify Design Guidelines
 *
 * Props:
 * - trackId: 歌曲 ID
 * - trackName: 歌曲名稱
 * - artistName: 藝人名稱
 * - artistId: 藝人 ID
 * - releaseYear: 發行年份（可選）
 * - imageUrl: 專輯封面 URL（可選）
 * - showArtistLink: 是否顯示藝人連結（預設 true）
 *
 * Usage:
 *   <TrackItem
 *     trackId="3DXncPQOG4VBw3QHh3S817"
 *     trackName="Feel Good Inc."
 *     artistName="Gorillaz"
 *     artistId="3AA28KZvwAUcZuOKwyblJQ"
 *     releaseYear="2005"
 *     imageUrl="https://..."
 *     showArtistLink={true}
 *   />
 */

interface TrackItemProps {
  trackId: string;
  trackName: string;
  artistName: string;
  artistId: string;
  releaseYear?: number;
  imageUrl?: string;
  showArtistLink?: boolean;
}

export function TrackItem({
  trackId,
  trackName,
  artistName,
  artistId,
  releaseYear,
  imageUrl,
  showArtistLink = true,
}: TrackItemProps) {
  return (
    <Card className="bg-muted hover:bg-muted/80 p-3 transition-colors">
      <div className="flex items-center gap-3">
        {/* Album Cover */}
        <Link to={`/track/${trackId}`} className="flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={trackName}
              className="h-12 w-12 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-secondary">
              <span className="text-2xl text-muted-foreground" aria-label="歌曲圖示">
                <RiMusic2Fill />
              </span>
            </div>
          )}
        </Link>

        {/* Track Info */}
        <div className="min-w-0 flex-1">
          <Link to={`/track/${trackId}`}>
            <h4 className="truncate font-semibold text-white hover:underline">
              {trackName}
            </h4>
          </Link>

          {showArtistLink ? (
            <Link to={`/artist/${artistId}`}>
              <p className="hover:text-primary truncate text-sm text-muted-foreground hover:underline">
                {artistName}
              </p>
            </Link>
          ) : (
            <p className="truncate text-sm text-muted-foreground">{artistName}</p>
          )}
        </div>

        {/* Release Year */}
        {releaseYear && (
          <div className="flex-shrink-0 text-sm text-muted-foreground">
            {releaseYear}
          </div>
        )}
      </div>
    </Card>
  );
}
