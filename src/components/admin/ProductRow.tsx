// src/components/admin/ProductRow.tsx
import React, { useState } from 'react';
import { useMutation } from 'convex/react';
// @ts-ignore
import { api } from '../../../convex/_generated/api';
import { AlertTriangle, Check, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import { Product } from '../../types';
import { formatDZD } from '../../utils/formatters';

interface ProductRowProps {
  product: Product;
  categoryName: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  categoryName,
  onEdit,
  onDelete,
}) => {
  // @ts-ignore
  const adjustStock = useMutation(api.products.adjustStock);
  const [stockAdd, setStockAdd] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock =
    !isOutOfStock && product.stockQuantity <= product.minOrderQuantity * 1.5;

  const handleAdjustStock = async () => {
    const val = parseInt(stockAdd, 10);
    if (isNaN(val) || val === 0) return;
    setIsUpdating(true);
    try {
      await adjustStock({
        productId: product._id as any,
        quantityChange: val,
      });
      setStockAdd('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-colors text-xs border-b border-slate-100 group">
      {/* SKU */}
      <td className="py-3 px-4 font-mono font-semibold text-slate-500 whitespace-nowrap">
        {product.sku}
      </td>

      {/* Product Name & Packaging */}
      <td className="py-3 px-4">
        <div className="font-bold text-slate-900">{product.name}</div>
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
          <span className="text-indigo-600 font-medium">{categoryName}</span>
          <span>·</span>
          <span>Colisage: {product.packageSize}</span>
        </div>
      </td>

      {/* Unit Price */}
      <td className="py-3 px-4 text-right font-mono font-medium text-slate-800 tabular-nums">
        {formatDZD(product.pricePerUnit)}
      </td>

      {/* Stock Level & Quick Adjuster */}
      <td className="py-3 px-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1.5">
            <span
              className={`font-mono font-bold tabular-nums text-xs ${
                isOutOfStock
                  ? 'text-red-600'
                  : isLowStock
                  ? 'text-amber-600'
                  : 'text-slate-800'
              }`}
            >
              {product.stockQuantity} unités
            </span>
            {isOutOfStock && (
              <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-semibold">
                Rupture
              </span>
            )}
            {isLowStock && (
              <AlertTriangle
                className="w-3.5 h-3.5 text-amber-500"
                title="Alerte Stock Bas (proche MOQ)"
              />
            )}
          </div>

          {/* Inline stock adjustment */}
          <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <input
              type="number"
              placeholder="+/-"
              value={stockAdd}
              onChange={(e) => setStockAdd(e.target.value)}
              className="w-14 px-1.5 py-0.5 border border-slate-200 rounded text-[11px] text-center font-mono tabular-nums focus:outline-none focus:border-indigo-500 bg-white"
            />
            <button
              onClick={handleAdjustStock}
              disabled={!stockAdd || isUpdating}
              className="p-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded transition cursor-pointer disabled:opacity-40"
              title="Ajuster le stock en direct (ex: +50 ou -10)"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        </div>
      </td>

      {/* MOQ */}
      <td className="py-3 px-4 text-center font-mono font-medium text-slate-600 tabular-nums">
        {product.minOrderQuantity}
      </td>

      {/* Total Valuation */}
      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
        {formatDZD(product.pricePerUnit * product.stockQuantity)}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition cursor-pointer"
            title="Modifier la fiche produit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition cursor-pointer"
            title="Supprimer la référence"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
