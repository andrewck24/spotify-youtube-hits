import {
  selectSearchQuery,
  selectSearchResults,
} from "@/features/search/search-selectors";
import { searchArtists } from "@/features/search/search-service";
import { clearSearch, performSearch } from "@/features/search/search-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { useCallback } from "react";

/**
 * Custom Hook: useSearch
 *
 * Purpose: 封裝搜尋邏輯與 Redux state 管理
 *
 * Features:
 * - 取得搜尋結果與查詢字串
 * - 執行模糊搜尋
 * - 清除搜尋
 *
 * Usage:
 *   const { results, query, search, clearSearch } = useSearch()
 *   search('Gorillaz')
 */

interface UseSearchReturn {
  /** 搜尋結果 */
  results: ReturnType<typeof selectSearchResults>;
  /** 目前搜尋查詢 */
  query: string;
  /** 執行搜尋函數 */
  search: (q: string) => void;
  /** 清除搜尋 */
  doClearSearch: () => void;
}

export function useSearch(): UseSearchReturn {
  const dispatch = useAppDispatch();
  const results = useAppSelector(selectSearchResults);
  const query = useAppSelector(selectSearchQuery);
  const fuseInstance = useAppSelector((state) => state.search.fuseInstance);

  const search = useCallback(
    (q: string) => {
      if (!fuseInstance) {
        return;
      }

      const searchResults = searchArtists(fuseInstance, q);
      dispatch(
        performSearch({
          query: q,
          results: searchResults,
        }),
      );
    },
    [fuseInstance, dispatch],
  );

  const doClearSearch = useCallback(() => {
    dispatch(clearSearch());
  }, [dispatch]);

  return {
    results,
    query,
    search,
    doClearSearch,
  };
}
