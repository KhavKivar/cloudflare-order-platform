import { useRef, useCallback } from "react";

interface UseIntersectionObserverProps {
  onIntersect: () => void;
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}

export function useIntersectionObserver({
  onIntersect,
  rootMargin = "100px",
  threshold = 0.1,
  enabled = true,
}: UseIntersectionObserverProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!enabled) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              onIntersect();
            }
          },
          { rootMargin, threshold },
        );
        observerRef.current.observe(node);
      }
    },
    [enabled, onIntersect, rootMargin, threshold],
  );

  return ref;
}
