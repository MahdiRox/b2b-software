// src/components/admin/CreateOrderModal.tsx
import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingBag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Product, ALGERIAN_WILAYAS } from '../../types';
import { formatDZD } from '../../utils/formatters';

interface CreateOrderModalProps {
  products: Product[];
  onClose: () => void;
  onSubmit: (data: {
    clientName: string;
    clientPhone?: string;
    wilaya?: string;
    items: { productId: any; quantity: number; unitPriceDA: number }[];
    totalAmountDA: number;
    notes?: string;
    status: "Pending" | "Validated" | "In Delivery" | "Paid";
  }) => Promise<void>;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  products,
  onClose,
  onSubmit,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [wilaya, setWilaya] = useState(ALGERIAN_WILAYAS[0]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<"Pending" | "Validated">("Pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available products with stock > 0
  const availableProducts = products.filter((p) => p.stockQuantity > 0);

  // Dynamic order items
  const [items, setItems] = useState<
    { productId: string; quantity: number; unitPriceDA: number }[]
  >(() => {
    if (availableProducts.length > 0) {
      return [
        {
          productId: availableProducts[0]._id,
          quantity: availableProducts[0].minOrderQuantity,
          unitPriceDA: availableProducts[0].pricePerUnit,
        },
      ];
    }
    return [];
  });

  const handleAddItem = () => {
    if (availableProducts.length === 0) return;
    const defaultProduct = availableProducts[0];
    setItems((prev) => [
      ...prev,
      {
        productId: defaultProduct._id,
        quantity: defaultProduct.minOrderQuantity,
        unitPriceDA: defaultProduct.pricePerUnit,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const selected = products.find((p) => p._id === newProductId);
    if (!selected) return;

    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              productId: selected._id,
              quantity: selected.minOrderQuantity,
              unitPriceDA: selected.pricePerUnit,
            }
          : item
      )
    );
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: qty } : item))
    );
  };

  // Calculate order total
  const totalAmount = items.reduce(
    (sum, item) => sum + item.unitPriceDA * (item.quantity || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clientName.trim()) {
      setErrorMsg("Veuillez renseigner le nom de l'établissement ou client B2B.");
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Veuillez ajouter au moins un produit à la commande.");
      return;
    }

    // Validate quantities against MOQ and warehouse stock
    for (const it of items) {
      const p = products.find((prod) => prod._id === it.productId);
      if (!p) continue;
      if (it.quantity < p.minOrderQuantity) {
        setErrorMsg(
          `La quantité minimale de commande (MOQ) pour "${p.name}" est de ${p.minOrderQuantity} unités.`
        );
        return;
      }
      if (it.quantity > p.stockQuantity) {
        setErrorMsg(
          `Stock insuffisant pour "${p.name}". Stock disponible: ${p.stockQuantity}, demandé: ${it.quantity}.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || undefined,
        wilaya,
        items,
        totalAmountDA: totalAmount,
        notes: notes.trim() || undefined,
        status,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'enregistrement de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nouvelle Commande Grossiste B2B
              </h3>
              <p className="text-xs text-slate-500">
                Saisie de bon de commande quai avec déstockage automatique
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
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Client Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">
                Client / Établissement *
              </label>
              <input
                required
                type="text"
                placeholder="ex. Supérette El Baraka"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Wilaya de Livraison *
              </label>
              <select
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white text-slate-800"
              >
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Téléphone Client
              </label>
              <input
                type="text"
                placeholder="0550 12 34 56"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Articles & Lines Section */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700 uppercase tracking-wide text-[11px]">
                Lignes d'Articles Commandés ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un article</span>
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-slate-400 py-3 text-center">
                Aucun article sélectionné. Cliquez sur "Ajouter un article".
              </p>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, index) => {
                  const product = products.find((p) => p._id === item.productId);
                  const maxStock = product?.stockQuantity || 0;
                  const moq = product?.minOrderQuantity || 1;
                  const lineTotal = (item.quantity || 0) * (item.unitPriceDA || 0);

                  return (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                    >
                      {/* Product Selector */}
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                          Produit en Stock
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {products.map((p) => (
                            <option
                              key={p._id}
                              value={p._id}
                              disabled={p.stockQuantity <= 0}
                            >
                              {p.name} ({p.sku}) — Stock: {p.stockQuantity} [MOQ: {p.minOrderQuantity}]
                            </option>
                          ))}
                        </select>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex space-x-2">
                          <span>Cond: {product?.packageSize}</span>
                          <span>·</span>
                          <span>Disponible: {maxStock}</span>
                        </div>
                      </div>

                      {/* Quantity Input */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                          Quantité (Min: {moq})
                        </label>
                        <input
                          type="number"
                          min={moq}
                          max={maxStock}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(index, parseInt(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono tabular-nums text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Line Subtotal */}
                      <div className="sm:col-span-3 text-right">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                          Sous-total
                        </label>
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {formatDZD(lineTotal)}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {formatDZD(item.unitPriceDA)} / u
                        </div>
                      </div>

                      {/* Delete Line */}
                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes and Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Instructions Quai / Livraison (Optionnel)
              </label>
              <textarea
                rows={2}
                placeholder="ex. Livraison avant midi, accès semi-remorque validé..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Statut Initial de la Commande
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white text-slate-800"
              >
                <option value="Pending">En Attente (Validation Quai)</option>
                <option value="Validated">Validée (Prête pour Préparation)</option>
              </select>

              <div className="mt-2 p-2 bg-indigo-50/60 rounded border border-indigo-100 flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Total Commande DA:</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">
                  {formatDZD(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
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
              disabled={isSubmitting || items.length === 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Enregistrement & Déstockage..." : "Valider & Enregistrer Commande"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
