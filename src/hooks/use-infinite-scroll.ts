import { useCallback, useEffect, useRef } from "react";

/**
 * useInfiniteScroll Hook
 *
 * IntersectionObserver-based infinite scroll hook for loading more content
 * when the user scrolls near the bottom of a container.
 *
 * Features:
 * - Uses native IntersectionObserver API for optimal performance
 * - Prevents duplicate triggers with isLoading guard
 * - Configurable threshold and root margin
 * - Cleanup on unmount
 *
 * @param callback - Function to call when sentinel element is visible
 * @param options - IntersectionObserver options
 * @returns Ref to attach to the sentinel element
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
  const targetRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date without causing effect re-runs
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        callbackRef.current();
      }
    },
    [],
  );

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.1,
      rootMargin: "300px", // Trigger 300px before reaching the sentinel
      ...options,
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, options]);

  return targetRef;
}
