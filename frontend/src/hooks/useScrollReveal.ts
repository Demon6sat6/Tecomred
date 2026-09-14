import { useEffect, useRef, useState } from 'react';

export function useScrollReveal(threshold = 0.05) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      // Check if already in viewport
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        setIsVisible(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold, rootMargin: '120px 0px' }
      );

      observer.observe(el);

      // Safety fallback: ensure content is revealed even if observer doesn't trigger
      const timer = setTimeout(() => setIsVisible(true), 1200);

      return () => {
        observer.disconnect();
        clearTimeout(timer);
      };
    } else {
      setIsVisible(true);
    }
  }, [threshold]);

  return { ref, isVisible };
}
