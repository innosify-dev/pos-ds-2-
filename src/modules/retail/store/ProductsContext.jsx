import { createContext, useCallback, useContext, useMemo } from 'react';
import { useDemo } from '@services/demo';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { totalStock } from '@services/demo/engine.js';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const { state, dispatch } = useDemo();
  const { tenant, branch } = useTenant();
  const tenantId = tenant?.id;

  const products = useMemo(
    () => state.products
      .filter((product) => product.tenantId === tenantId)
      .map((product) => ({ ...product, stock: totalStock(product) })),
    [state.products, tenantId],
  );

  const save = useCallback((values) => {
    const branchId = branch?.id;
    const stockByBranch = values.stockByBranch || {
      ...(values.id ? state.products.find((item) => item.id === values.id)?.stockByBranch : {}),
      [branchId || 'unassigned']: Number(values.stock ?? values.openingStock ?? 0),
    };
    return dispatch({
      type: 'product.save',
      tenantId,
      product: {
          ...values,
          tenantId,
          stockByBranch,
          taxRate: Number(values.taxRate ?? values.details?.tax?.rate ?? 5),
          costPrice: Number(values.costPrice ?? values.details?.costPrice ?? 0),
        },
    });
  }, [branch?.id, dispatch, state.products, tenantId]);

  const addProduct = useCallback((values) => save(values), [save]);
  const updateProduct = useCallback((id, values) => save({ ...state.products.find((item) => item.id === id), ...values, id }), [save, state.products]);
  const deleteProduct = useCallback((id) => dispatch({ type: 'product.delete', id }), [dispatch]);
  const duplicateProduct = useCallback((product) => save({
    ...product,
    id: undefined,
    name: `${product.name} (Copy)`,
    sku: `${product.sku}-C${Date.now().toString(36).slice(-3)}`,
    barcode: undefined,
  }), [save]);

  const value = useMemo(
    () => ({ products, addProduct, updateProduct, deleteProduct, duplicateProduct }),
    [products, addProduct, updateProduct, deleteProduct, duplicateProduct],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
