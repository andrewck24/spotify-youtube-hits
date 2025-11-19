import { useEffect, useRef, useState } from "react";

/**
 * Hook: useKeyboardHeight
 *
 * 監聽 iOS Safari 虛擬鍵盤彈出/收回，動態計算搜尋欄的位移值。
 * 使用 visualViewport API 偵測鍵盤高度，並在輸入框聚焦時將搜尋欄上移。
 *
 * @param isBottomBar - 是否為底部固定的搜尋欄（移動端）
 * @returns {
 *   translateY: number - 應套用的 Y 軸位移（像素）
 *   onInputFocus: () => void - input onFocus 事件處理器
 *   onInputBlur: () => void - input onBlur 事件處理器
 * }
 *
 * 使用方法：
 * ```tsx
 * const keyboard = useKeyboardHeight(isBottomBar);
 *
 * return (
 *   <div style={{ transform: `translateY(${keyboard.translateY}px)` }}>
 *     <input
 *       onFocus={keyboard.onInputFocus}
 *       onBlur={keyboard.onInputBlur}
 *     />
 *   </div>
 * );
 * ```
 */
export function useKeyboardHeight(isBottomBar: boolean): {
  translateY: number;
  onInputFocus: () => void;
  onInputBlur: () => void;
} {
  const [translateY, setTranslateY] = useState(0);
  const isInputFocusedRef = useRef(false);

  // 核心邏輯：監聽 visualViewport 變動
  useEffect(() => {
    if (!isBottomBar || !window.visualViewport) return undefined;

    const handleViewportResize = () => {
      if (!window.visualViewport) return;

      const keyboardHeight = window.innerHeight - window.visualViewport.height;

      // 只有在輸入框聚焦時才移動搜尋欄
      if (isInputFocusedRef.current && keyboardHeight > 0) {
        setTranslateY(-keyboardHeight);
      } else if (keyboardHeight === 0) {
        // 鍵盤收起，重置位移
        setTranslateY(0);
      }
    };

    window.visualViewport.addEventListener("resize", handleViewportResize);

    return () => {
      window.visualViewport?.removeEventListener(
        "resize",
        handleViewportResize,
      );
    };
  }, [isBottomBar]);

  const handleInputFocus = () => {
    isInputFocusedRef.current = true;
  };

  const handleInputBlur = () => {
    // 延遲清除焦點狀態，給予瀏覽器充足時間反應鍵盤收起事件
    setTimeout(() => {
      isInputFocusedRef.current = false;
      setTranslateY(0);
    }, 100);
  };

  return {
    translateY,
    onInputFocus: handleInputFocus,
    onInputBlur: handleInputBlur,
  };
}
