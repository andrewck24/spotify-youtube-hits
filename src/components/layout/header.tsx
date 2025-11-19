import Spotify from "@/components/icons/spotify.svg?react";
import { SearchBar } from "@/components/layout/search-bar";
import { Button } from "@/components/ui/button";
import { RiGithubFill } from "react-icons/ri";
import { Link } from "react-router-dom";

/**
 * Header Component
 *
 * Purpose: Application top bar (Logo + SearchBar + Navigation)
 *
 * Features:
 * - Application branding
 * - Global search bar (Spotify-style, visible on sm+)
 * - Navigation links
 * - Spotify theme
 * - Sticky positioning
 *
 * Layout:
 *   [Logo] [SearchBar (flex-1, centered)] [GitHub]
 *
 * Usage:
 *   <Header />
 */

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between gap-4 px-6 py-4">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <Spotify className="size-10" />
        <h1 className="text-foreground text-xl font-bold max-lg:hidden">
          Music Hits
        </h1>
      </Link>

      {/* Search Bar (centered, visible on sm+) */}
      <SearchBar className="flex-1 max-sm:hidden" />

      {/* Navigation */}
      <nav className="flex items-center gap-4">
        <Button
          asChild
          className="text-foreground hover:text-muted-foreground size-12 rounded-full p-0 transition-colors [&>svg]:size-8"
          variant="secondary"
        >
          <Link
            to="https://github.com/andrewck24/music-hits"
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiGithubFill />
          </Link>
        </Button>
      </nav>
    </header>
  );
}
