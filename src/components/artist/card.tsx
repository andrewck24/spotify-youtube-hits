import { Card } from "@/components/ui/card";
import { RiUser3Line } from "react-icons/ri";
import { Link } from "react-router-dom";

/**
 * ArtistCard Component
 *
 * Purpose: 可重用的藝人卡片元件
 *
 * Features:
 * - 圓形頭像（Spotify 藝人頭像標準）
 * - 整卡可點擊，導航至 /artist/:artistId
 * - 支援 grid 佈局（響應式）
 * - 未載入圖片時顯示 placeholder
 * - 遵循 Spotify Design Guidelines
 *
 * Props:
 * - artistId: 藝人 ID
 * - artistName: 藝人名稱
 * - imageUrl: 藝人頭像 URL（可選）
 *
 * Usage:
 *   <ArtistCard
 *     artistId="3AA28KZvwAUcZuOKwyblJQ"
 *     artistName="Gorillaz"
 *     imageUrl="https://..."
 *   />
 */

interface ArtistCardProps {
  artistId: string;
  artistName: string;
  imageUrl?: string;
}

export function ArtistCard({
  artistId,
  artistName,
  imageUrl,
}: ArtistCardProps) {
  return (
    <Link to={`/artist/${artistId}`} className="block">
      <Card className="bg-muted hover:bg-muted/80 cursor-pointer p-4 transition-colors">
        {/* Artist Image */}
        <div className="mb-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={artistName}
              className="aspect-square w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-full bg-secondary">
              <span className="text-4xl text-muted-foreground" aria-label="藝人圖示">
                <RiUser3Line />
              </span>
            </div>
          )}
        </div>

        {/* Artist Name */}
        <h3 className="truncate text-center font-semibold text-white">
          {artistName}
        </h3>
      </Card>
    </Link>
  );
}
