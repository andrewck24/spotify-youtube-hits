import {
  selectDataError,
  selectDataLoaded,
  selectDataLoading,
} from "@/features/data/data-selectors";
import { loadLocalData } from "@/features/data/data-slice";
import { createSearchIndex } from "@/features/search/search-service";
import { initializeSearch } from "@/features/search/search-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { useEffect } from "react";

/**
 * Custom Hook: useDataLoader
 *
 * Purpose: 管理資料載入與搜尋索引初始化
 *
 * Features:
 * - 在 component mount 時載入資料
 * - 資料載入成功後初始化 Fuse.js 搜尋引擎
 * - 回傳載入狀態與錯誤訊息
 *
 * Usage:
 *   const { dataLoaded, dataLoading, error } = useDataLoader()
 *   if (dataLoading) return <LoadingFallback />
 *   if (error) return <ErrorFallback message={error} />
 *   return <Dashboard />
 */

interface UseDataLoaderReturn {
  /** 資料是否已載入 */
  dataLoaded: boolean;
  /** 正在載入中 */
  dataLoading: boolean;
  /** 載入錯誤訊息（若有） */
  error: string | null;
}

export function useDataLoader(): UseDataLoaderReturn {
  const dispatch = useAppDispatch();
  const dataLoaded = useAppSelector(selectDataLoaded);
  const dataLoading = useAppSelector(selectDataLoading);
  const error = useAppSelector(selectDataError);

  useEffect(() => {
    // 若已載入，不重複載入
    if (dataLoaded) {
      return;
    }

    // 開始載入資料（T027 & T028 整合）
    const loadData = async () => {
      const result = await dispatch(loadLocalData());

      // 載入成功後初始化搜尋引擎
      if (loadLocalData.fulfilled.match(result)) {
        const tracksData = result.payload.tracks;
        if (tracksData.length > 0) {
          const fuseInstance = createSearchIndex(tracksData);
          dispatch(initializeSearch(fuseInstance));
        }
      }
    };

    loadData();
  }, [dataLoaded, dispatch]);

  return {
    dataLoaded,
    dataLoading,
    error,
  };
}
