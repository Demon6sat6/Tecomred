import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, duration = 1500, startOnVisible = true) {
  const [count, setCount] = useState(target);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!startOnVisible) { setStarted(true); return; }
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined') {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        setStarted(true);
        return;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.05, rootMargin: '100px 0px' }
    );
    observer.observe(el);
    const timer = setTimeout(() => setStarted(true), 1500);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [startOnVisible]);

  useEffect(() => {
    if (!started || target === 0) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}
