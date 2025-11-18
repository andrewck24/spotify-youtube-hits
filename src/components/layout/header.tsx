import Spotify from "@/components/icons/spotify.svg?react";
import { RiGithubFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { SearchBar } from "./search-bar";

/**
 * Header Component
 *
 * Purpose: 應用頂部欄（Logo + SearchBar + Navigation）
 *
 * Features:
 * - Application branding
 * - Global search bar (Spotify-style, hidden on small screens)
 * - Navigation links
 * - Spotify 主題
 *
 * Layout:
 *   [Logo] [SearchBar (flex-1, centered)] [GitHub]
 *
 * Usage:
 *   <Header />
 */

export function Header() {
  return (
    <header className="flex w-full items-center justify-between gap-4 px-6 py-4">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <Spotify className="size-8" />
        <h1 className="text-foreground text-xl font-bold max-lg:hidden">
          Music Hits
        </h1>
      </Link>

      {/* Search Bar (centered, hidden on small screens) */}
      <SearchBar className="flex-1 max-lg:hidden" />

      {/* Navigation */}
      <nav className="flex items-center gap-4">
        <Link
          to="https://github.com/andrewck24/music-hits"
          className="text-foreground hover:text-muted-foreground transition-colors"
          aria-label="GitHub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <RiGithubFill className="size-6" />
        </Link>
      </nav>
    </header>
  );
}
