// src/components/admin/ProductFormModal.tsx
import React, { useState } from 'react';
import { X, Package } from 'lucide-react';
import { Category, Product } from '../../types';

interface ProductFormModalProps {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: {
    name: string;
    sku: string;
    categoryId: any;
    pricePerUnit: number;
    minOrderQuantity: number;
    stockQuantity: number;
    packageSize: string;
  }) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    categoryId: product?.categoryId || (categories[0]?._id || ''),
    pricePerUnit: product?.pricePerUnit || 0,
    minOrderQuantity: product?.minOrderQuantity || 1,
    stockQuantity: product?.stockQuantity || 0,
    packageSize: product?.packageSize || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim() || !formData.sku.trim() || !formData.categoryId) {
      setErrorMsg('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    if (formData.pricePerUnit <= 0) {
      setErrorMsg('Le prix unitaire doit être supérieur à 0.');
      return;
    }

    if (formData.minOrderQuantity <= 0) {
      setErrorMsg('La quantité minimale de commande (MOQ) doit être au moins 1.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        packageSize: formData.packageSize.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de l'enregistrement du produit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg my-6 text-slate-800 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {product ? 'Modifier la Fiche Produit' : 'Ajouter un Produit Grossiste'}
            </h3>
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
              Désignation Marchande du Produit *
            </label>
            <input
              required
              type="text"
              name="name"
              placeholder="ex. Couscous Fin Amor Benamor 1kg"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Code SKU / Réf Interne *
              </label>
              <input
                required
                type="text"
                name="sku"
                placeholder="ex. ABN-COUS-1KG"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono uppercase text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catégorie / Ligne *
              </label>
              <select
                required
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white text-slate-800"
              >
                <option value="" disabled>
                  Sélectionner la catégorie...
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Conditionnement / Colisage *
            </label>
            <input
              required
              type="text"
              name="packageSize"
              placeholder="ex. Carton de 24 x 1kg, Fardeau de 6 x 1.5L"
              value={formData.packageSize}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Prix Unitaire HT (DA) *
              </label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono tabular-nums text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Stock Initial *
              </label>
              <input
                required
                type="number"
                min="0"
                step="1"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono tabular-nums text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Qté Min (MOQ) *
              </label>
              <input
                required
                type="number"
                min="1"
                step="1"
                name="minOrderQuantity"
                value={formData.minOrderQuantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono tabular-nums text-slate-800"
              />
            </div>
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
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? 'Enregistrement...'
                : product
                ? 'Mettre à jour'
                : 'Enregistrer Produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
