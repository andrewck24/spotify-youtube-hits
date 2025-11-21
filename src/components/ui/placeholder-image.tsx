import { RiMusic2Fill, RiUser3Line } from "react-icons/ri";

/**
 * ArtistPlaceholder Component
 *
 * Placeholder image for artist cards when no image is available.
 * Matches ArtistCard's circular image style with a user icon.
 */
export function ArtistPlaceholder() {
  return (
    <div className="flex aspect-square items-center justify-center rounded-full bg-secondary">
      <span className="text-4xl text-muted-foreground" aria-label="藝人圖示">
        <RiUser3Line />
      </span>
    </div>
  );
}

/**
 * TrackPlaceholder Component
 *
 * Placeholder image for track items when no album cover is available.
 * Matches TrackItem's 48x48 rounded square style with a music icon.
 */
export function TrackPlaceholder() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded bg-secondary">
      <span className="text-2xl text-muted-foreground" aria-label="歌曲圖示">
        <RiMusic2Fill />
      </span>
    </div>
  );
}
