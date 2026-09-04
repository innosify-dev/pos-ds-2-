import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
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

/**
 * Registers screen — manage store registers and cash sessions.
 * List state comes from RegistersProvider; add/edit live on form routes.
 */
export function RegistersScreen() {
  const { registers, deleteRegister, openSession, closeSession } = useRegisters();
  const navigate = useNavigate();
  const [storeFilter, setStoreFilter] = useState('Main Store');
  const [detailsRegister, setDetailsRegister] = useState(null);
  const [openTarget, setOpenTarget] = useState(null);
  const [closeTarget, setCloseTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const stores = useMemo(() => [...new Set(registers.map((r) => r.store))], [registers]);
  const effectiveStore = stores.includes(storeFilter) ? storeFilter : stores[0];
  const visible = registers.filter((r) => r.store === effectiveStore);

  const total = visible.length;
  const openCount = visible.filter((r) => r.status === 'Open').length;
  const closedCount = total - openCount;
  const sales = visible.reduce((sum, r) => sum + (r.todaysSales ?? 0), 0);

  const handleToggleSession = (register) => {
    if (register.status === 'Open') setCloseTarget(register);
    else setOpenTarget(register);
  };

  const confirmOpen = ({ openingCash, cashier }) => {
    openSession(openTarget.id, { openingCash, cashier });
    setOpenTarget(null);
  };

  const confirmClose = ({ closingCash }) => {
    closeSession(closeTarget.id, { closingCash });
    setCloseTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteRegister(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4 bg-surface-elevated/50 p-5">
      <nav aria-label="Breadcrumb" className="text-xs text-content-muted">
        <Link to="/retail/dashboard" className="hover:text-accent">Dashboard</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-accent">Registers</span>
      </nav>

      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h2 className="text-lg font-bold text-content">Registers</h2>
          <p className="mt-0.5 text-xs text-content-muted">Manage store registers and cash sessions</p>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <div className="w-44">
            <Select value={effectiveStore} onChange={(e) => setStoreFilter(e.target.value)} aria-label="Store">
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

      <div className="rounded-xl border border-border bg-surface p-4">
        <RegistersTable
          rows={visible}
          onViewDetails={setDetailsRegister}
          onToggleSession={handleToggleSession}
          onEdit={(r) => navigate(`${r.id}/edit`)}
          onDelete={setDeleteTarget}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border/60 pt-3 text-xs text-content-muted">
          <span>Showing 1 to {visible.length} of {visible.length} registers</span>
        </div>
      </div>

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
