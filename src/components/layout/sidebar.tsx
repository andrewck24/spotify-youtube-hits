import React from 'react';

/**
 * Sidebar Component
 *
 * Purpose: 左側邊欄（藝人資訊 + 歌曲清單）
 *
 * Features:
 * - Two-section layout
 * - Artist info at top
 * - Track list below
 * - Scrollable track list
 *
 * Props:
 * - artist: Artist profile section
 * - tracks: Track list section
 *
 * Usage:
 *   <Sidebar artist={<ArtistProfile />} tracks={<TrackList />} />
 */

interface SidebarProps {
  artist: React.ReactNode;
  tracks: React.ReactNode;
}

export function Sidebar({ artist, tracks }: SidebarProps) {
  return (
    <div className="space-y-6">
      {/* Artist Section */}
      <div>{artist}</div>

      {/* Track List Section */}
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto">{tracks}</div>
    </div>
  );
}
