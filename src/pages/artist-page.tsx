import { ArtistProfile } from "@/components/artist/artist-profile";
import { TrackItem } from "@/components/track/item";
import { LoadingFallback } from "@/components/layout/loading-fallback";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useDocumentTitle } from "@/hooks/use-document-title";
import type { tracksLoader } from "@/loaders/tracks-loader";
import { useGetArtistQuery } from "@/services";
import { Suspense } from "react";
import { Link, useParams, useRouteLoaderData } from "react-router-dom";

/**
 * ArtistPage Component
 *
 * Purpose: Display artist information and their tracks
 *
 * Features:
 * - Load artist data from RTK Query
 * - Display artist profile with ArtistProfile component
 * - Show tracks from local database for this artist using TrackItem component
 * - Dynamic page title
 * - Link to track detail pages
 * - Support browser back/forward navigation
 *
 * Route: /artist/:artistId
 */

export function ArtistPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ArtistPageContent />
    </Suspense>
  );
}

function ArtistPageContent() {
  const { artistId } = useParams<{ artistId: string }>();

  // Get tracks from loader (loaded before page render)
  const { tracks: tracksDatabase } = useRouteLoaderData("root") as Awaited<
    ReturnType<typeof tracksLoader>
  >;

  // Get artist data from Spotify API
  const {
    data: artist,
    isLoading,
    error,
  } = useGetArtistQuery(artistId || "", { skip: !artistId });

  // Set document title
  useDocumentTitle(artist ? `${artist.name} | Music Hits` : "Music Hits");

  // Filter local tracks by artist
  const artistTracks = tracksDatabase.tracks.filter(
    (track) => track.artistId === artistId,
  );

  if (!artistId) {
    return (
      <div className="bg-background p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-lg">找不到藝人ID</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="text-primary hover:text-primary/80 mb-4 inline-block"
          >
            ← 返回首頁
          </Link>
          <h1 className="text-foreground text-4xl font-bold">藝人詳情</h1>
        </div>

        {/* Artist Info Section */}
        <div className="mb-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-destructive mb-4 text-lg">無法載入藝人資訊</p>
              <p className="text-muted-foreground text-sm">
                {error && typeof error === "object" && "message" in error
                  ? (error.message as string)
                  : String(error)}
              </p>
            </Card>
          ) : (
            <ArtistProfile artist={artist} />
          )}
        </div>

        {/* Tracks Section */}
        <div>
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            該藝人的歌曲
          </h2>

          {artistTracks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                本地資料庫中未找到該藝人的歌曲
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {artistTracks.map((track) => (
                <TrackItem
                  key={`${track.trackId}-${track.artistId}`}
                  trackId={track.trackId}
                  trackName={track.trackName}
                  artistName={track.artistName}
                  artistId={track.artistId}
                  releaseYear={track.releaseYear}
                  showArtistLink={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
