import { ArtistCard } from "@/components/artist/card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollableRow } from "@/components/ui/scrollable-row";
import type { UniqueArtist } from "@/hooks/use-search";

interface ArtistSearchResultsProps {
  artists: UniqueArtist[];
  viewMode: "preview" | "full";
  onViewAll?: () => void;
  query: string;
}

export function ArtistSearchResults({
  artists,
  viewMode,
  onViewAll,
  query,
}: ArtistSearchResultsProps) {
  if (artists.length === 0) {
    if (viewMode === "full") {
      return (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-lg">
            未找到 &quot;{query}&quot; 相關藝人
          </p>
        </Card>
      );
    }
    return null;
  }

  const showViewAll = viewMode === "preview" && artists.length > 4;
  const displayArtists = viewMode === "preview" ? artists.slice(0, 4) : artists;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-2xl font-semibold">藝人</h2>
        {showViewAll && onViewAll && (
          <Button variant="ghost" onClick={onViewAll}>
            查看全部藝人
          </Button>
        )}
      </div>

      {viewMode === "preview" ? (
        <ScrollableRow>
          {displayArtists.map((artist) => (
            <ArtistCard
              key={artist.artistId}
              artistId={artist.artistId}
              artistName={artist.artistName}
              className="shrink-0 basis-[12rem] snap-start"
            />
          ))}
        </ScrollableRow>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {displayArtists.map((artist) => (
            <ArtistCard
              key={artist.artistId}
              artistId={artist.artistId}
              artistName={artist.artistName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
