import { cn } from '@utils/cn';

export function Table({ children, className }) {
  return (
    <div className="premium-card overflow-x-auto">
      <table className={cn('w-full text-left text-sm', className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children }) {
  return <thead className="border-b border-border bg-surface-muted">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TableRow({ children, className, onClick }) {
  return (
    <tr
      className={cn('transition-colors', onClick && 'cursor-pointer hover:bg-surface-muted', className)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, className }) {
  return (
    <th className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-content-muted', className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }) {
  return <td className={cn('px-4 py-3 text-content', className)}>{children}</td>;
}
