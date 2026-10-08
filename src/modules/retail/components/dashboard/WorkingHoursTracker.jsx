import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@utils/cn';
import { parseClock, readWorkingHours } from '@modules/retail/data';

const STEP = 15;
const TRACK_GRADIENT = 'linear-gradient(90deg, #FF8F78 0%, #FFD84D 48%, #7CFF4F 100%)';

const currency = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

function nowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function formatClock(minutes) {
  const hour24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(mins).padStart(2, '0')} ${suffix}`;
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${String(mins).padStart(2, '0')}m`;
}

function salesBetween(hourly, start, end) {
  return hourly.reduce((total, amount, hour) => {
    const hourStart = hour * 60;
    const overlap = Math.max(0, Math.min(end, hourStart + 60) - Math.max(start, hourStart));
    return total + amount * (overlap / 60);
  }, 0);
}

/** Latest minute that can be selected. Today cannot extend past the current time. */
function latestMinute(close) {
  return Math.min(close, nowMinutes());
}

function initialRange(open, close) {
  const latest = latestMinute(close);
  if (latest <= open) return { start: open, end: open };
  return { start: open, end: latest };
}

function minutesFromPointer(track, clientX, open, close) {
  const rect = track.getBoundingClientRect();
  const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
  const span = close - open;
  const snapped = open + Math.round((Math.min(1, Math.max(0, ratio)) * span) / STEP) * STEP;
  return Math.min(latestMinute(close), Math.max(open, snapped));
}

function axisLabels(open, close) {
  return [0, 0.25, 0.5, 0.75, 1].map((mark, index, marks) => {
    if (index === 0) return formatClock(open);
    if (index === marks.length - 1) return formatClock(close);
    const minutes = Math.round((open + (close - open) * mark) / 60) * 60;
    return formatClock(Math.min(close, Math.max(open, minutes)));
  });
}

/**
 * Working-hours tracker.
 * The track is the store's opening-to-closing window from Settings,
 * and the range opens at opening time and now.
 */
export function WorkingHoursTracker({ hourly, className, delay = 0 }) {
  const trackRef = useRef(null);
  const labelRef = useRef(null);
  const dragRef = useRef(null);
  const [labelLeft, setLabelLeft] = useState(48);
  const [hours, setHours] = useState(readWorkingHours);
  const open = parseClock(hours.openingTime);
  const close = parseClock(hours.closingTime);

  const [range, setRange] = useState(() => initialRange(open, close));

  useEffect(() => {
    const sync = () => setHours(readWorkingHours());
    window.addEventListener('takshi-working-hours', sync);
    return () => window.removeEventListener('takshi-working-hours', sync);
  }, []);

  useEffect(() => {
    setRange(initialRange(open, close));
  }, [open, close]);

  const windowTotal = useMemo(() => salesBetween(hourly, open, close), [hourly, open, close]);
  const selectedSales = salesBetween(hourly, range.start, range.end);
  const share = windowTotal === 0 ? 0 : Math.round((selectedSales / windowTotal) * 100);
  const latest = latestMinute(close);
  const span = Math.max(close - open, 1);
  const startPct = ((range.start - open) / span) * 100;
  const endPct = ((range.end - open) / span) * 100;
  const labels = axisLabels(open, close);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const label = labelRef.current;
    if (!track || !label) return;

    const place = () => {
      const trackWidth = track.clientWidth;
      const labelWidth = label.offsetWidth;
      const fillLeft = (startPct / 100) * trackWidth;
      const fillWidth = ((endPct - startPct) / 100) * trackWidth;
      const insideLeft = fillLeft + 28;
      const fitsInside = fillWidth >= labelWidth + 36;
      const afterColor = fillLeft + fillWidth + 16;
      const nextLeft = fitsInside ? insideLeft : Math.min(afterColor, trackWidth - labelWidth);
      setLabelLeft(Math.max(0, nextLeft));
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(track);
    return () => observer.disconnect();
  }, [startPct, endPct]);

  const moveHandle = (which, minutes) => {
    setRange((current) => {
      const latest = latestMinute(close);
      if (latest <= open) return { start: open, end: open };
      if (which === 'start') {
        const maxStart = Math.min(current.end - STEP, latest);
        return { ...current, start: Math.max(open, Math.min(minutes, maxStart)) };
      }
      const minEnd = Math.min(latest, current.start + STEP);
      return { ...current, end: Math.min(latest, Math.max(minutes, minEnd)) };
    });
  };

  const onTrackPointerDown = (event) => {
    if (event.target.closest('[data-handle]')) return;
    const minutes = minutesFromPointer(trackRef.current, event.clientX, open, close);
    const which = Math.abs(minutes - range.start) <= Math.abs(minutes - range.end) ? 'start' : 'end';
    dragRef.current = which;
    moveHandle(which, minutes);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onHandlePointerDown = (which) => (event) => {
    dragRef.current = which;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!dragRef.current || !trackRef.current) return;
    moveHandle(dragRef.current, minutesFromPointer(trackRef.current, event.clientX, open, close));
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onHandleKeyDown = (which) => (event) => {
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? STEP : event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -STEP : 0;
    if (!delta) return;
    event.preventDefault();
    const current = which === 'start' ? range.start : range.end;
    moveHandle(which, Math.min(latestMinute(close), Math.max(open, current + delta)));
  };

  return (
    <section
      className={cn('animate-fade-up rounded-lg border border-border bg-surface p-5', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-content tabular-nums" aria-live="polite">
            {currency(selectedSales)}
          </p>
          <p className="mt-1 text-xs text-content-muted">
            Sales from {formatClock(range.start)} to {formatClock(range.end)}
          </p>
        </div>
        <p className="text-xs font-medium text-success">{share}% of today</p>
      </header>

      <div className="mt-5 flex items-center gap-4">
        <div
          ref={trackRef}
          className="relative h-11 flex-1 touch-none rounded-full bg-canvas"
          onPointerDown={onTrackPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="pointer-events-none absolute inset-y-0 rounded-full"
            style={{
              left: `${startPct}%`,
              width: `${Math.max(endPct - startPct, 0)}%`,
              backgroundImage: TRACK_GRADIENT,
            }}
          />
          <span
            ref={labelRef}
            className="pointer-events-none absolute top-1/2 z-[1] -translate-y-1/2 whitespace-nowrap text-sm font-medium text-ink"
            style={{ left: labelLeft }}
          >
            Time tracking
          </span>
          <RangeHandle
            label="Range start"
            minutes={range.start}
            min={open}
            max={latest}
            percent={startPct}
            onPointerDown={onHandlePointerDown('start')}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onKeyDown={onHandleKeyDown('start')}
          />
          <RangeHandle
            label="Range end"
            minutes={range.end}
            min={open}
            max={latest}
            percent={endPct}
            onPointerDown={onHandlePointerDown('end')}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onKeyDown={onHandleKeyDown('end')}
          />
        </div>
        <span className="w-[4.5rem] shrink-0 text-right text-sm font-medium tabular-nums text-content">
          {formatDuration(range.end - range.start)}
        </span>
      </div>

      <div className="mt-2 flex justify-between px-1 text-[10px] text-content-muted">
        {labels.map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
    </section>
  );
}

function RangeHandle({ label, minutes, min, max, percent, onPointerDown, onPointerMove, onPointerUp, onKeyDown }) {
  return (
    <button
      type="button"
      data-handle
      role="slider"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={minutes}
      aria-valuetext={formatClock(minutes)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className="absolute top-1/2 z-[2] flex h-8 w-6 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center focus:outline-none"
      style={{ left: `${percent}%` }}
    >
      <span className="h-6 w-1.5 rounded-full bg-ink shadow-sm" />
    </button>
  );
}
