// src/pages/admin/CategoriesWorkspace.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
// @ts-ignore
import { api } from '../../../convex/_generated/api';
import { Layers, Plus, Edit2, Trash2, Package, AlertCircle } from 'lucide-react';
import { Category, Product } from '../../types';
import { CategoryFormModal } from '../../components/admin/CategoryFormModal';
import { formatDZD } from '../../utils/formatters';

export default function CategoriesWorkspace() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Convex Queries and Mutations
  // @ts-ignore
  const categories = (useQuery(api.categories.getCategories) as Category[]) || [];
  // @ts-ignore
  const products = (useQuery(api.products.list) as Product[]) || [];
  // @ts-ignore
  const createCategory = useMutation(api.categories.createCategory);
  // @ts-ignore
  const updateCategory = useMutation(api.categories.updateCategory);
  // @ts-ignore
  const deleteCategory = useMutation(api.categories.deleteCategory);

  const handleOpenAdd = () => {
    setActionError(null);
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setActionError(null);
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDelete = async (cat: Category) => {
    setActionError(null);
    const assignedProducts = products.filter((p) => p.categoryId === cat._id);
    if (assignedProducts.length > 0) {
      setActionError(
        `Impossible de supprimer "${cat.name}" : ${assignedProducts.length} produit(s) y sont rattachés. Réassignez ou supprimez ces produits d'abord.`
      );
      return;
    }

    if (
      window.confirm(
        `Confirmez-vous la suppression de la catégorie "${cat.name}" ?`
      )
    ) {
      try {
        await deleteCategory({ id: cat._id as any });
      } catch (err: any) {
        setActionError(err.message || 'Erreur lors de la suppression.');
      }
    }
  };

  const handleSaveCategory = async (data: {
    name: string;
    slug: string;
    description?: string;
  }) => {
    if (editingCategory) {
      await updateCategory({
        id: editingCategory._id as any,
        ...data,
      });
    } else {
      await createCategory(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-700 mb-1">
            <Layers className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Nomenclature Grossiste
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Catégories & Lignes de Produits
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Structuration des gammes marchandes pour l'inventaire, le catalogue B2B et les bons de livraison.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Catégorie</span>
        </button>
      </div>

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">
            Aucune catégorie définie.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Créez vos premières catégories (ex. Céréales, Huiles, Boissons).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const assignedProducts = products.filter(
              (p) => p.categoryId === cat._id
            );
            const totalStock = assignedProducts.reduce(
              (sum, p) => sum + p.stockQuantity,
              0
            );
            const totalValuation = assignedProducts.reduce(
              (sum, p) => sum + p.stockQuantity * p.pricePerUnit,
              0
            );

            return (
              <div
                key={cat._id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {cat.name}
                      </h3>
                      <span className="font-mono text-[11px] text-slate-400 mt-0.5 block">
                        slug: {cat.slug}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 min-h-[32px]">
                    {cat.description || (
                      <span className="text-slate-400 italic">
                        Aucune description renseignée pour cette catégorie.
                      </span>
                    )}
                  </p>
                </div>

                {/* Quantitative statistics */}
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Références
                    </span>
                    <span className="font-mono font-bold text-slate-800 tabular-nums">
                      {assignedProducts.length} articles
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Stock Global
                    </span>
                    <span className="font-mono font-bold text-slate-800 tabular-nums">
                      {totalStock} unités
                    </span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Valeur Marchande (DA)
                    </span>
                    <span className="font-mono font-bold text-indigo-700 tabular-nums text-xs">
                      {formatDZD(totalValuation)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
}
