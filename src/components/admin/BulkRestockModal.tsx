// src/components/admin/BulkRestockModal.tsx
import React, { useState } from 'react';
import { X, ArrowDownCircle, Check, PackagePlus } from 'lucide-react';
import { Product } from '../../types';

interface BulkRestockModalProps {
  products: Product[];
  onClose: () => void;
  onRestock: (productId: string, quantityToAdd: number, note?: string) => Promise<void>;
}

export const BulkRestockModal: React.FC<BulkRestockModalProps> = ({
  products,
  onClose,
  onRestock,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?._id || ''
  );
  const [quantity, setQuantity] = useState<number>(100);
  const [supplierNote, setSupplierNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!selectedProductId) return;
    if (quantity <= 0) {
      setErrorMsg('La quantité reçue doit être supérieure à 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRestock(selectedProductId, quantity, supplierNote);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la réception de stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-800">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Réception Arrivage Marchandise
              </h3>
              <p className="text-xs text-slate-500">
                Entrée en stock d'un arrivage usine / fournisseur
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Produit Réceptionné *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white text-slate-800"
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku}) — Stock actuel: {p.stockQuantity}
                </option>
              ))}
            </select>
            {selectedProduct && (
              <div className="mt-1 text-[11px] text-slate-500 flex space-x-2">
                <span>Conditionnement: {selectedProduct.packageSize}</span>
                <span>·</span>
                <span>Stock Actuel: {selectedProduct.stockQuantity}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantité Reçue (Unités) *
              </label>
              <input
                required
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono tabular-nums text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nouveau Stock Estimé
              </label>
              <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-mono font-bold text-xs flex items-center justify-between">
                <span>Total:</span>
                <span>
                  {(selectedProduct?.stockQuantity || 0) + (quantity || 0)} unités
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Référence Bon de Livraison Fournisseur / Usine
            </label>
            <input
              type="text"
              placeholder="ex. BL-CEV-89412 (Camion citerne ou semi-remorque)"
              value={supplierNote}
              onChange={(e) => setSupplierNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || quantity <= 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>{isSubmitting ? "Enregistrement..." : "Confirmer Entrée Quai"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
