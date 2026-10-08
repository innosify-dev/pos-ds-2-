import { useMemo, useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/tables/Table';
import { initialBrands } from '@modules/retail/data/brands.data.js';
import { useProducts } from '@modules/retail/store/ProductsContext.jsx';

/**
 * Brands screen — names used on products in the inventory.
 */
export function BrandsScreen() {
  const { products } = useProducts();
  const [brands, setBrands] = useState(initialBrands);
  const [name, setName] = useState('');

  const rows = useMemo(
    () =>
      brands.map((brand) => ({
        ...brand,
        products: products.filter((product) => product.brand?.toLowerCase() === brand.name.toLowerCase()).length,
      })),
    [brands, products],
  );

  const addBrand = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (brands.some((brand) => brand.name.toLowerCase() === trimmed.toLowerCase())) return;
    setBrands((list) => [...list, { id: `b-${Date.now()}`, name: trimmed }]);
    setName('');
  };

  return (
    <div className="space-y-4 bg-surface-elevated/50 p-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-content">Brands</h2>
          <p className="mt-0.5 text-xs text-content-muted">Brands available when adding products.</p>
        </div>
      </header>

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          addBrand();
        }}
      >
        <div className="w-full max-w-xs">
          <Input label="Brand name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nalli" />
        </div>
        <Button type="submit" size="md">
          Add brand
        </Button>
      </form>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Brand</TableHeader>
            <TableHeader>Products</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell className="font-medium">{brand.name}</TableCell>
              <TableCell>{brand.products}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
