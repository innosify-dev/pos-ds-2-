import { Link } from 'react-router-dom';

export function RecentSales({ rows }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-content">Recent Sales</h3>
        <Link to="/retail/sales" className="text-xs font-medium text-accent hover:underline">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead>
            <tr className="text-content-muted">
              {['Invoice', 'Customer', 'Items', 'Amount', 'Payment', 'Status'].map((h) => (
                <th key={h} className="px-2 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.invoice} className="border-t border-border/60">
                <td className="px-2 py-2.5 font-medium text-accent">{r.invoice}</td>
                <td className="px-2 py-2.5 text-content">{r.customer}</td>
                <td className="px-2 py-2.5 text-content">{r.items}</td>
                <td className="px-2 py-2.5 font-medium text-content">{r.amount}</td>
                <td className="px-2 py-2.5 text-content">{r.payment}</td>
                <td className="px-2 py-2.5">
                  <span className="rounded-full bg-success-muted px-2.5 py-1 text-[11px] font-medium text-success">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
