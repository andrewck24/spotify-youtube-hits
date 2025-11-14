import Spotify from "@/components/icons/spotify.svg?react";
import { SearchBar } from "@/components/search/search-bar";

/**
 * Header Component
 *
 * Purpose: 應用頂部欄（Logo + SearchBar）
 *
 * Features:
 * - Application branding
 * - Search bar integration
 * - Spotify 主題
 *
 * Usage:
 *   <Header />
 */

export function Header() {
  return (
    <header className="border-border bg-background w-full border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Spotify className="size-8" />
            <h1 className="text-xl font-bold text-white max-lg:hidden">
              Spotify YouTube Hits
            </h1>
          </div>

          {/* SearchBar */}
          <div className="mx-8 flex max-w-md flex-1 justify-center">
            <div className="bg-secondary overflow-hidden rounded-full">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
