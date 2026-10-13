import { useEffect, useRef, useState } from 'react';
import { cn } from '@utils/cn';

function formatElapsed(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

/**
 * Live elapsed-time tracker with pause / resume / stop.
 * Used for shift tracking on the dashboard.
 */
export function ShiftTracker({ title = 'Shift Tracker', className, compact = false }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const interval = useRef(null);

  useEffect(() => {
    if (!running) return undefined;
    interval.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(interval.current);
  }, [running]);

  return (
    <div className={cn('premium-card flex flex-col text-content', compact ? 'gap-2 p-3' : 'gap-3 p-4', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-content">{title}</span>
        {running && (
          <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-success">
            <span className="h-1.5 w-1.5 animate-signal-pulse rounded-full bg-success" />
            Live
          </span>
        )}
      </div>

      <p className={cn('font-semibold tabular-nums text-content', compact ? 'text-xl' : 'text-3xl')}>{formatElapsed(seconds)}</p>
      <p className="text-xs text-content-muted">This timer stays in this browser tab. It is not saved as attendance.</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRunning((value) => !value)}
          className={cn('flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-medium text-content-inverse transition hover:bg-accent-hover', compact ? 'h-8' : 'h-10')}
        >
          {running ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          )}
          {running ? 'Pause' : seconds > 0 ? 'Resume' : 'Start'}
        </button>

        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setSeconds(0);
          }}
          disabled={seconds === 0}
          className={cn('flex items-center justify-center rounded-lg bg-danger text-white transition hover:brightness-95 disabled:pointer-events-none disabled:opacity-40', compact ? 'h-8 w-8' : 'h-10 w-10')}          aria-label="Stop and reset"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}