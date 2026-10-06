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
export function ShiftTracker({ title = 'Shift Tracker', className }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const interval = useRef(null);

  useEffect(() => {
    if (!running) return undefined;
    interval.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(interval.current);
  }, [running]);

  return (
    <div className={cn('flex flex-col gap-3 rounded-lg bg-plum p-4 text-content-inverse', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium opacity-80">{title}</span>
        {running && (
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide opacity-80">
            <span className="h-1.5 w-1.5 animate-signal-pulse rounded-full bg-gold" />
            Live
          </span>
        )}
      </div>

      <p className="text-4xl font-semibold tabular-nums">{formatElapsed(seconds)}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRunning((value) => !value)}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-ivory text-sm font-medium text-plum transition-transform hover:scale-[1.02] active:scale-95"
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
          className="flex h-10 w-10 items-center justify-center rounded-full bg-danger text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:pointer-events-none disabled:opacity-40"          aria-label="Stop and reset"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}