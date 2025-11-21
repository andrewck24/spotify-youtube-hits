import { useCallback, useEffect, useRef } from "react";

/**
 * useInfiniteScroll Hook
 *
 * IntersectionObserver-based infinite scroll hook for loading more content
 * when the user scrolls near the bottom of a container.
 *
 * Features:
 * - Uses native IntersectionObserver API for optimal performance
 * - Uses callback ref to handle dynamic sentinel elements (e.g., when viewMode changes)
 * - Prevents duplicate triggers with isLoading guard
 * - Configurable threshold and root margin
 * - Cleanup on unmount
 *
 * @param callback - Function to call when sentinel element is visible
 * @param options - IntersectionObserver options
 * @returns Callback ref to attach to the sentinel element
 *
 * @example
 * ```tsx
 * function ItemList() {
 *   const [items, setItems] = useState([]);
 *   const [isLoading, setIsLoading] = useState(false);
 *   const [hasMore, setHasMore] = useState(true);
 *
 *   const loadMore = useCallback(() => {
 *     if (!isLoading && hasMore) {
 *       setIsLoading(true);
 *       fetchMoreItems().then((newItems) => {
 *         setItems(prev => [...prev, ...newItems]);
 *         setHasMore(newItems.length > 0);
 *         setIsLoading(false);
 *       });
 *     }
 *   }, [isLoading, hasMore]);
 *
 *   const sentinelRef = useInfiniteScroll(loadMore);
 *
 *   return (
 *     <div>
 *       {items.map(item => <Item key={item.id} {...item} />)}
 *       {isLoading && <LoadingSpinner />}
 *       {hasMore && <div ref={sentinelRef} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteScroll(
  callback: () => void,
  options?: IntersectionObserverInit,
) {
  const callbackRef = useRef(callback);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Keep callback ref up to date without causing effect re-runs
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Callback ref pattern: automatically handles DOM element appearing/disappearing
  // This fixes the issue where sentinel element doesn't exist on initial render
  // (e.g., when viewMode="preview") but appears later (when viewMode="full")
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Disconnect existing observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // Create new observer if node exists
      if (node) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
              callbackRef.current();
            }
          },
          {
            threshold: 0.1,
            rootMargin: "300px", // Trigger 300px before reaching the sentinel
            ...options,
          },
        );
        observerRef.current.observe(node);
      }
    },
    [options],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return sentinelRef;
}
