import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Modal, ModalFooter } from '@shared/dialogs/Modal';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { cn } from '@utils/cn';

function PickerTree({ nodes, depth, selectedId, onPick, excludeIds }) {
  return (
    <>
      {nodes.map((node) => {
        if (excludeIds.includes(node.id)) return null;
        const selected = selectedId === node.id;
        return (
          <div key={node.id}>
            <button
              type="button"
              onClick={() => onPick(node.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px]',
                selected ? 'bg-accent-muted font-medium text-accent' : 'text-content hover:bg-surface-muted'
              )}
              style={{ paddingLeft: `${0.625 + depth * 1.1}rem` }}
            >
              {selected && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5 shrink-0">
                  <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-content-muted">
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              <span className="truncate">{node.name}</span>
            </button>
            {node.children.length > 0 && (
              <PickerTree
                nodes={node.children}
                depth={depth + 1}
                selectedId={selectedId}
                onPick={onPick}
                excludeIds={excludeIds}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

/**
 * Parent category picker — custom dropdown showing the hierarchy tree.
 * Value is a category id or null (root).
 */
function ParentPicker({ value, onChange, tree, excludeIds, disabled, fixedLabel }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  const selectedName = useMemo(() => {
    if (value === null) return 'No Parent / Root Category';
    const find = (nodes) => {
      for (const n of nodes) {
        if (n.id === value) return n.name;
        const hit = find(n.children);
        if (hit) return hit;
      }
      return null;
    };
    return find(tree) ?? 'No Parent / Root Category';
  }, [value, tree]);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (r) setPos({ left: r.left, top: r.bottom + 4, width: r.width });
    };
    place();
    const close = (e) => {
      const inWrap = wrapRef.current?.contains(e.target);
      const inPanel = panelRef.current?.contains(e.target);
      if (!inWrap && !inPanel) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open ]);

  const panel = open && !disabled && pos && (
    <div
      ref={panelRef}
      className="fixed z-[60] max-h-64 overflow-auto rounded-lg border border-border bg-surface p-1.5 shadow-lg"
      style={{ left: pos.left, top: pos.top, width: pos.width }}
    >
      <button
        type="button"
        onClick={() => { onChange(null); setOpen(false); }}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px]',
          value === null ? 'bg-accent-muted font-medium text-accent' : 'text-content hover:bg-surface-muted'
        )}
      >
        {value === null && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5 shrink-0">
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        No Parent / Root Category
      </button>
      <PickerTree
        nodes={tree}
        depth={0}
        selectedId={value}
        onPick={(id) => { onChange(id); setOpen(false); }}
        excludeIds={excludeIds}
      />
    </div>
  );

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-content">Parent Category *</span>
      <div ref={wrapRef} className="relative">
        <button
          ref={btnRef}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded border border-border bg-surface px-3 text-sm text-content',
            'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          <span className="truncate">{disabled && fixedLabel ? fixedLabel : selectedName}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn('h-4 w-4 text-content-muted transition-transform', open && 'rotate-180')}>
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {panel && createPortal(panel, document.body)}
      </div>
    </div>
  );
}

const MODES = {
  create: { title: 'Create Category', confirm: 'Create Category', hint: 'Add a category at any level of your hierarchy' },
  sub: { title: 'Add Subcategory', confirm: 'Create Category', hint: 'Add a subcategory under the selected parent' },
  edit: { title: 'Edit Category', confirm: 'Save Changes', hint: 'Rename or move this category' },
};

/**
 * Create / edit category dialog.
 */
export function CategoryModal({ open, mode, category, tree, excludeIds, onClose, onSave }) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState(null);
  const [status, setStatus] = useState('Active');
  const [error, setError] = useState('');
  const config = MODES[mode] ?? MODES.create;
  const parentLocked = mode === 'sub';

  useEffect(() => {
    if (open) {
      setError('');
      setName(category && mode === 'edit' ? category.name : '');
      setStatus(category?.status ?? 'Active');
      setParentId(mode === 'sub' ? category?.id ?? null : category?.parentId ?? null);
    }
  }, [open, category, mode]);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    onSave({ name: name.trim(), parentId, status });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={config.title}
      size="md"
      footer={
        <ModalFooter onCancel={onClose} onConfirm={handleSave} confirmLabel={config.confirm} />
      }
    >
      <p className="mb-4 text-[13px] text-content-muted">{config.hint}</p>
      <div className="space-y-4">
        <Input
          label="Category Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
        />
        <ParentPicker
          value={parentId}
          onChange={setParentId}
          tree={tree}
          excludeIds={excludeIds}
          disabled={parentLocked}
          fixedLabel={category?.name}
        />
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </Select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
