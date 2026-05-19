import { useEffect, useRef } from "react";

type UseIntersectionObserverOptions = {
  enabled?: boolean;
  rootMargin?: string;
  onIntersect: () => void;
};

export const useIntersectionObserver = ({
  enabled = true,
  rootMargin = "200px",
  onIntersect,
}: UseIntersectionObserverOptions) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const target = targetRef.current;

    if (!enabled || !target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onIntersectRef.current();
        }
      },
      { rootMargin },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [enabled, rootMargin]);

  return targetRef;
};
