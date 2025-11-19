import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { RiCloseLine, RiSearchLine } from "react-icons/ri";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";

/**
 * SearchBar Component
 *
 * Purpose: Global search component (Spotify style)
 *
 * Features:
 * - Spotify style design (rounded, bg-muted)
 * - White ring on focus
 * - Clears input when navigating away from search page
 * - Responsive display
 * - Mobile keyboard handling via useKeyboardHeight hook
 */

interface SearchBarProps {
  className?: string;
  isBottomBar?: boolean;
}

export function SearchBar({ className, isBottomBar }: SearchBarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");

  // 使用自定義 hook 管理鍵盤高度
  const keyboard = useKeyboardHeight(isBottomBar ?? false);

  // Sync input with URL param 'q' and clear if not on search page
  useEffect(() => {
    if (location.pathname === "/search") {
      setInputValue(searchParams.get("q") || "");
    } else {
      setInputValue("");
    }
  }, [location.pathname, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Immediate navigation, use replace to avoid history pollution
    navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true });
  };

  const handleClear = () => {
    setInputValue("");
    navigate("/search?q=", { replace: true });
  };

  return (
    <div
      className={cn(
        "bg-muted flex h-12 max-w-2xl flex-row items-center rounded-full px-4 text-sm",
        "supports-[backdrop-filter]:bg-secondary/60 backdrop-blur",
        "focus-within:ring-foreground focus-within:ring-2",
        "hover:bg-muted/80 transition-all",
        className,
      )}
      style={{ transform: `translateY(${keyboard.translateY}px)` }}
    >
      <RiSearchLine className="text-muted-foreground mr-3 h-6 w-6 shrink-0" />
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={keyboard.onInputFocus}
        onBlur={keyboard.onInputBlur}
        placeholder="搜尋歌曲或藝人..."
        className="placeholder:text-muted-foreground flex-1 bg-transparent text-base text-white outline-none"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="text-muted-foreground ml-2 hover:text-white focus:outline-none"
          aria-label="Clear search"
        >
          <RiCloseLine className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
