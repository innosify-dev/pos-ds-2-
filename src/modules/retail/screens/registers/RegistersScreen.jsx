import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { ConfirmationDialog } from '@shared/dialogs/ConfirmationDialog';
import { useRegisters } from '@modules/retail/store/RegistersContext.jsx';
import {
  CloseSessionModal,
  OpenSessionModal,
  RegisterDetailsModal,
  RegisterStats,
  RegistersTable,
} from '@modules/retail/components/registers';
import { RegisterSessionPanel } from '@modules/retail/components/registers/RegisterSessionPanel.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useToast } from '@shared/feedback/Toast.jsx';

/**
 * Registers screen — manage store registers and cash sessions.
 * List state comes from RegistersProvider; add/edit live on form routes.
 */
export function RegistersScreen() {
  const { registers, deleteRegister, openSession, closeSession } = useRegisters();
  const { branch } = useTenant();
  const toast = useToast();
  const navigate = useNavigate();
  const [storeFilter, setStoreFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [detailsRegister, setDetailsRegister] = useState(null);
  const [openTarget, setOpenTarget] = useState(null);
  const [closeTarget, setCloseTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const stores = useMemo(() => [...new Set(registers.map((r) => r.store))], [registers]);
  const needle = query.trim().toLowerCase();
  const visible = registers.filter((r) => {
    const inBranch = storeFilter === 'all' || r.store === storeFilter;
    const text = `${r.name} ${r.code || ''} ${r.cashier || ''}`.toLowerCase();
    return inBranch && (!needle || text.includes(needle));
  });

  const total = visible.length;
  const openCount = visible.filter((r) => r.status === 'Open').length;
  const closedCount = total - openCount;
  const sales = visible.reduce((sum, r) => sum + (r.todaysSales ?? 0), 0);

  const handleToggleSession = (register) => {
    if (register.status === 'Open') setCloseTarget(register);
    else setOpenTarget(register);
  };

  const confirmOpen = ({ openingCash, cashier }) => {
    const result = openSession(openTarget.id, { openingCash, cashier });
    toast.push(result?.ok === false ? result.error : `${openTarget.name} is open.`, result?.ok === false ? 'danger' : 'success');
    if (result?.ok !== false) setOpenTarget(null);
  };

  const confirmClose = ({ closingCash, reason }) => {
    const result = closeSession(closeTarget.id, { closingCash, reason });
    toast.push(result?.ok === false ? result.error : `${closeTarget.name} is closed.`, result?.ok === false ? 'danger' : 'success');
    if (result?.ok !== false) setCloseTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteRegister(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4 p-5">
      <nav aria-label="Breadcrumb" className="text-xs text-content-muted">
        <Link to="/retail/dashboard" className="hover:text-accent">Dashboard</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-accent">Registers</span>
      </nav>

      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h2 className="text-lg font-bold text-content">Registers</h2>
          <p className="mt-0.5 text-xs text-content-muted">Checkout counters for the branches you can manage. Cash totals come from demo sales.</p>
        </div>
        <div className="ml-auto flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="min-w-0 sm:w-52">
            <Input aria-label="Search registers" placeholder="Search name or code" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="sm:w-44">
            <Select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} aria-label="Branch">
              <option value="all">All branches</option>
              {stores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <Button onClick={() => navigate('new')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Add Register
          </Button>
        </div>
      </div>

      <RegisterStats total={total} open={openCount} closed={closedCount} sales={sales} />

      <RegisterSessionPanel register={registers.find((item) => item.status === 'Open' && item.branchId === branch?.id) || registers.find((item) => item.status === 'Open')} />

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
          <h3 className="text-sm font-semibold text-content">No registers configured for this branch.</h3>
          <p className="mt-1 text-xs text-content-muted">Add a register when this business should take bills at a counter.</p>
        </div>
      ) : (
        <div className="min-w-0">
          <RegistersTable
            rows={visible}
            onViewDetails={setDetailsRegister}
            onToggleSession={handleToggleSession}
            onEdit={(r) => navigate(`${r.id}/edit`)}
            onDelete={setDeleteTarget}
          />
          <p className="mt-3 text-xs text-content-muted">Showing {visible.length} of {registers.length} registers on your branches.</p>
        </div>
      )}

      <RegisterDetailsModal
        open={Boolean(detailsRegister)}
        register={detailsRegister}
        onClose={() => setDetailsRegister(null)}
      />

      <OpenSessionModal
        open={Boolean(openTarget)}
        register={openTarget}
        onClose={() => setOpenTarget(null)}
        onConfirm={confirmOpen}
      />

      <CloseSessionModal
        open={Boolean(closeTarget)}
        register={closeTarget}
        onClose={() => setCloseTarget(null)}
        onConfirm={confirmClose}
      />

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Register"
        message={deleteTarget ? `Delete "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
