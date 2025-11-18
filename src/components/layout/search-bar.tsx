import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RiSearchLine, RiCloseLine } from "react-icons/ri";

/**
 * SearchBar Component
 *
 * Purpose: 全局搜尋框元件（Spotify 風格）
 *
 * Features:
 * - Spotify 風格設計（圓形、bg-muted）
 * - 左側搜尋 icon (RiSearchLine)
 * - 右側清除按鈕 (RiCloseLine)，有輸入時顯示
 * - 即時導航至 /search?q={query}（replace: true 避免污染歷史）
 * - 同步 URL query 參數到 input value
 * - 響應式顯示（接收 className prop）
 *
 * Props:
 * - className: 額外的 CSS class（用於響應式隱藏）
 *
 * Usage:
 *   <SearchBar className="max-lg:hidden" />
 */

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className = "" }: SearchBarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // 即時導航，使用 replace 避免污染歷史
    navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true });
  };

  const handleClear = () => {
    setInputValue("");
    navigate("/search?q=", { replace: true });
  };

  return (
    <div className={className}>
      <div className="bg-muted rounded-full px-4 py-2 flex items-center gap-2 max-w-md mx-auto">
        {/* Search Icon */}
        <RiSearchLine className="text-muted-foreground flex-shrink-0" size={20} />

        {/* Search Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="輸入藝人或歌曲"
          className="bg-transparent border-none outline-none text-white placeholder:text-muted-foreground flex-1 w-full"
        />

        {/* Clear Button */}
        {inputValue && (
          <button
            onClick={handleClear}
            className="text-muted-foreground hover:text-white transition-colors flex-shrink-0"
            aria-label="清除搜尋"
          >
            <RiCloseLine size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
