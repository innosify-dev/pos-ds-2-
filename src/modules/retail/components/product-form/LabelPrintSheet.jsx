import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Off-screen label sheet. Browser print shows only this node.
 * afterprint fires for both print and cancel, so callers must not report success.
 */
export function LabelPrintSheet({ job, onDone, children }) {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!job) return undefined;
    document.body.setAttribute('data-label-print', 'on');
    const style = document.createElement('style');
    style.setAttribute('data-label-page', 'true');
    style.textContent = job.page === 'a4'
      ? '@media print { @page { size: A4 portrait; margin: 8mm; } }'
      : `@media print { @page { size: ${job.width}mm ${job.height}mm; margin: 2mm; } }`;
    document.head.appendChild(style);
    const frame = requestAnimationFrame(() => window.print());
    const finish = () => doneRef.current?.();
    window.addEventListener('afterprint', finish);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('afterprint', finish);
      document.body.removeAttribute('data-label-print');
      style.remove();
    };
  }, [job]);

  if (!job) return null;
  return createPortal(
    <div id="label-print-root" className="bg-white text-black">{children}</div>,
    document.body,
  );
}
