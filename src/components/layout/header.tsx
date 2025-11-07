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
    <header className="border-b border-[#282828] bg-[#121212]">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm3.5 11c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-5 0c0 .83-.67 1.5-1.5 1.5S7 12.83 7 12s.67-1.5 1.5-1.5 1.5.67 1.5 1.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">
              Spotify YouTube Hits
            </h1>
          </div>

          {/* SearchBar */}
          <div className="flex-1 mx-8 max-w-md">
            <div className="bg-[#282828] rounded-full overflow-hidden">
              <SearchBar />
            </div>
          </div>

          {/* Placeholder for future actions */}
          <div className="w-8" />
        </div>
      </div>
    </header>
  );
}
