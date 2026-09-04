/**
 * Categories mock data — flat list with parent links, separated from UI per ARCHITECTURE.md.
 * Replace with services/api/ calls when the backend lands.
 */

export const initialCategories = [
  { id: 'c-sarees', name: 'Sarees', parentId: null, productCount: 128, status: 'Active', order: 0 },
  { id: 'c-silk', name: 'Silk Sarees', parentId: 'c-sarees', productCount: 46, status: 'Active', order: 0 },
  { id: 'c-kanjivaram', name: 'Kanjivaram Silk', parentId: 'c-silk', productCount: 18, status: 'Active', order: 0 },
  { id: 'c-banarasi', name: 'Banarasi Silk', parentId: 'c-silk', productCount: 14, status: 'Active', order: 1 },
  { id: 'c-soft', name: 'Soft Silk', parentId: 'c-silk', productCount: 14, status: 'Active', order: 2 },
  { id: 'c-cotton', name: 'Cotton Sarees', parentId: 'c-sarees', productCount: 38, status: 'Active', order: 1 },
  { id: 'c-handloom', name: 'Handloom Cotton', parentId: 'c-cotton', productCount: 22, status: 'Active', order: 0 },
  { id: 'c-pure', name: 'Pure Cotton', parentId: 'c-cotton', productCount: 16, status: 'Active', order: 1 },
  { id: 'c-designer', name: 'Designer Sarees', parentId: 'c-sarees', productCount: 44, status: 'Active', order: 2 },
  { id: 'c-party', name: 'Party Wear', parentId: 'c-designer', productCount: 25, status: 'Active', order: 0 },
  { id: 'c-bridal', name: 'Bridal Sarees', parentId: 'c-designer', productCount: 19, status: 'Active', order: 1 },
];

/**
 * Build a sorted nested tree from the flat list.
 */
export function buildCategoryTree(list) {
  const map = new Map(list.map((c) => [c.id, { ...c, children: [] }]));
  const roots = [];
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortRec = (nodes) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

/**
 * Flatten the tree depth-first (for the summary list).
 * Each entry: { ...category, depth }.
 */
export function flattenCategoryTree(nodes, depth = 0) {
  const out = [];
  for (const n of nodes) {
    const { children, ...rest } = n;
    out.push({ ...rest, depth });
    out.push(...flattenCategoryTree(children, depth + 1));
  }
  return out;
}

/**
 * Collect the ids of a category and all its descendants.
 */
export function collectSubtreeIds(list, rootId) {
  const byParent = new Map();
  for (const c of list) {
    if (!byParent.has(c.parentId)) byParent.set(c.parentId, []);
    byParent.get(c.parentId).push(c.id);
  }
  const ids = [rootId];
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.pop();
    for (const child of byParent.get(current) ?? []) {
      ids.push(child);
      queue.push(child);
    }
  }
  return ids;
}
