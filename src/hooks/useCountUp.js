import { useEffect, useRef, useState } from 'react';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Animates a number from 0 to `target` with an ease-out curve.
 * Re-runs whenever `target` changes, so live data updates re-count.
 */
export function useCountUp(target, { duration = 1400, delay = 0, enabled = true } = {}) {
  const safeTarget = Number.isFinite(target) ? target : 0;
  const [value, setValue] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setValue(safeTarget);
      return undefined;
    }

    let timeoutId;
    const start = () => {
      const begin = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - begin) / duration);
        setValue(safeTarget * easeOutCubic(progress));
        if (progress < 1) frame.current = requestAnimationFrame(tick);
        else setValue(safeTarget);
      };
      frame.current = requestAnimationFrame(tick);
    };

    if (delay > 0) timeoutId = setTimeout(start, delay);
    else start();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      cancelAnimationFrame(frame.current);
    };
  }, [safeTarget, duration, delay, enabled]);

  return value;
}

/**
 * Returns inline styles for a staggered entrance animation.
 * Pass the item index to delay each row/column slightly.
 */
export function useStagger(index = 0, { step = 60, duration = 420, distance = 10 } = {}) {
  return {
    opacity: 0,
    transform: `translateY(${distance}px)`,
    transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${index * step}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${index * step}ms`,
  };
}

/**
 * Mounts a state flag on the next frame so entrance transitions play.
 */
export function useMounted(delay = 0) {
  const [mounted, setMounted] = useState(delay > 0 ? false : true);

  useEffect(() => {
    if (delay <= 0) return undefined;
    const id = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

  return mounted;
}