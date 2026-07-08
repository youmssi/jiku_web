import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref and visibility flag that becomes true once the element
 * enters the viewport (by default at 10% threshold) and stays true.
 * The observer is disconnected after the first intersection.
 */
export function useOnScreen(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}
