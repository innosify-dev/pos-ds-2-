import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initialProducts } from '../data/products.data.js';

const gradients = [
  'from-violet-600 to-purple-800',
  'from-teal-500 to-cyan-700',
  'from-orange-600 to-rose-700',
  'from-sky-600 to-indigo-700',
];

const ProductsContext = createContext(null);

/**
 * Module-scoped products state — shared by the products list and the
 * add/edit product form screens. Replaced by services/api/ when the backend lands.
 */
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);

  const addProduct = useCallback((values) => {
    const product = {
      id: `p${Date.now()}`,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      gradient: gradients[initialProducts.length % gradients.length],
      returnable: true,
      ...values,
    };
    setProducts((list) => [...list, product]);
    return product;
  }, []);

  const updateProduct = useCallback((id, values) => {
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...values } : p)));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((list) => list.filter((p) => p.id !== id));
  }, []);

  const duplicateProduct = useCallback((product) => {
    const copy = {
      ...product,
      id: `p${Date.now()}`,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-C`,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setProducts((list) => [...list, copy]);
    return copy;
  }, []);

  const value = useMemo(
    () => ({ products, addProduct, updateProduct, deleteProduct, duplicateProduct }),
    [products, addProduct, updateProduct, deleteProduct, duplicateProduct]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
