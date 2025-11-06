import { useAppDispatch } from '@/app/store';
import { setCurrentTrack } from '@/features/track/track-slice';
import { Card } from '@/components/ui/card';
import type { LocalTrackData } from '@/types/data-schema';
import { formatNumber } from '@/lib/formatters';

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
    // Convert LocalTrackData to SpotifyTrack-like object
    const spotifyTrack = {
      id: track.trackId,
      name: track.trackName,
      uri: `spotify:track:${track.trackId}`,
      external_urls: {
        spotify: `https://open.spotify.com/track/${track.trackId}`,
      },
      external_ids: {
        isrc: '',
        ean: '',
        upc: '',
      },
      album: {
        id: '',
        name: '',
        uri: '',
        external_urls: { spotify: '' },
        images: [],
        release_date: track.releaseYear.toString(),
        release_date_precision: 'year' as const,
        total_tracks: 0,
        type: 'album' as const,
        artists: [],
        href: '',
        album_type: 'album' as const,
      },
      artists: [
        {
          id: '',
          name: track.artistName,
          uri: '',
          external_urls: { spotify: '' },
          type: 'artist' as const,
          href: '',
        },
      ],
      disc_number: 0,
      duration_ms: 0,
      explicit: false,
      href: '',
      is_local: false,
      is_playable: true,
      popularity: track.popularity.spotifyPopularity,
      preview_url: null,
      track_number: 0,
      type: 'track' as const,
    };

    dispatch(setCurrentTrack(spotifyTrack));
  };

  if (tracks.length === 0) {
    return (
      <Card className="p-4 text-center text-[#B3B3B3]">
        沒有歌曲
      </Card>
    );
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
                  {track.releaseYear} • {formatNumber(track.popularity.youtubeViews)} views
                </div>
              </div>
              <div className="text-xs text-[#1DB954] ml-2 flex-shrink-0">
                {track.popularity.spotifyPopularity}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
