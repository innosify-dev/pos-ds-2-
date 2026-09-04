import { cn } from '@utils/cn';

function Chevron({ expanded }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={cn('h-3.5 w-3.5 text-content-muted transition-transform', !expanded && '-rotate-90')}
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon({ active }) {
  return active ? (
    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-content-inverse">
        <path d="M3 6a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    </span>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0 text-content-muted">
      <path d="M3 6a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function TreeNode({ node, depth, expandedIds, selectedId, onToggle, onSelect }) {
  const expanded = expandedIds.includes(node.id);
  const selected = selectedId === node.id;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px]',
          selected ? 'bg-accent-muted font-medium text-accent' : 'text-content hover:bg-surface-muted'
        )}
        style={{ paddingLeft: `${0.5 + depth * 1.1}rem` }}
        onClick={() => onSelect(node.id)}
        role="treeitem"
        aria-expanded={hasChildren ? expanded : undefined}
        aria-selected={selected}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={expanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
            className="rounded p-0.5 hover:bg-border/60"
          >
            <Chevron expanded={expanded} />
          </button>
        ) : (
          <span className="w-4" />
        )}
        <FolderIcon active={selected} />
        <span className="truncate">{node.name}</span>
      </div>
      {hasChildren && expanded && (
        <div role="group">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Category hierarchy tree — presentational recursive tree.
 */
export function CategoryTree({ nodes, expandedIds, selectedId, onToggle, onSelect }) {
  return (
    <div role="tree" aria-label="Category hierarchy" className="space-y-0.5">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          expandedIds={expandedIds}
          selectedId={selectedId}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
