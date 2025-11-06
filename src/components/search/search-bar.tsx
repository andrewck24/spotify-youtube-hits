import { useCallback, useRef, useEffect } from 'react';
import { useSearch } from '@/hooks/use-search';

/**
 * SearchBar Component
 *
 * Purpose: 搜尋列 UI，支援即時搜尋與防抖
 *
 * Features:
 * - Debounced input (300ms)
 * - Clear button
 * - Search icon
 * - Spotify 主題風格
 *
 * Usage:
 *   <SearchBar />
 */

export function SearchBar() {
  const { search, doClearSearch, query: searchQuery } = useSearch();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Clear previous timeout
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce search by 300ms
      debounceTimerRef.current = setTimeout(() => {
        search(value);
      }, 300);
    },
    [search]
  );

  const handleClear = useCallback(() => {
    doClearSearch();
  }, [doClearSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== undefined) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      {/* Search icon */}
      <svg
        className="w-5 h-5 text-[#B3B3B3] flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Input field */}
      <input
        type="text"
        placeholder="Search artists..."
        defaultValue={searchQuery}
        onChange={handleInputChange}
        className="flex-1 bg-transparent text-white placeholder-[#B3B3B3] outline-none text-sm"
      />

      {/* Clear button */}
      {searchQuery && (
        <button
          onClick={handleClear}
          className="text-[#B3B3B3] hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
