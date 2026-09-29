// src/pages/admin/InventoryWorkspace.tsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
// @ts-ignore
import { api } from '../../../convex/_generated/api';
import {
  Package,
  Plus,
  Search,
  Download,
  PackagePlus,
  AlertTriangle,
  Boxes,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { ProductRow } from '../../components/admin/ProductRow';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { BulkRestockModal } from '../../components/admin/BulkRestockModal';
import { formatDZD, exportToCSV } from '../../utils/formatters';

export default function InventoryWorkspace() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<string>('ALL');

  // Queries & Mutations
  // @ts-ignore
  const products = (useQuery(api.products.list) as Product[]) || [];
  // @ts-ignore
  const categories = (useQuery(api.categories.getCategories) as Category[]) || [];
  // @ts-ignore
  const createProduct = useMutation(api.products.createProduct);
  // @ts-ignore
  const updateProduct = useMutation(api.products.updateProduct);
  // @ts-ignore
  const deleteProduct = useMutation(api.products.deleteProduct);
  // @ts-ignore
  const adjustStock = useMutation(api.products.adjustStock);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.packageSize.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'ALL' || p.categoryId === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'LOW') {
        matchesStock =
          p.stockQuantity <= p.minOrderQuantity * 1.5 && p.stockQuantity > 0;
      } else if (stockFilter === 'OUT') {
        matchesStock = p.stockQuantity === 0;
      } else if (stockFilter === 'OK') {
        matchesStock = p.stockQuantity > p.minOrderQuantity * 1.5;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Aggregate Metrics
  const totalValuation = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stockQuantity * p.pricePerUnit, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (p) => p.stockQuantity <= p.minOrderQuantity * 1.5 && p.stockQuantity > 0
    ).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => p.stockQuantity === 0).length;
  }, [products]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        'Confirmez-vous la suppression de ce produit ? Cette action est irréversible.'
      )
    ) {
      try {
        await deleteProduct({ id: id as any });
      } catch (e: any) {
        alert(e.message || 'Impossible de supprimer ce produit.');
      }
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) return;
    const rows = products.map((p) => {
      const cat = categories.find((c) => c._id === p.categoryId);
      return {
        SKU: p.sku,
        Designation: p.name,
        Categorie: cat?.name || 'Inconnue',
        Conditionnement: p.packageSize,
        Prix_HT_DA: p.pricePerUnit,
        Stock_Actuel: p.stockQuantity,
        MOQ: p.minOrderQuantity,
        Valeur_Stock_DA: p.stockQuantity * p.pricePerUnit,
      };
    });
    exportToCSV(`Inventaire_Atlas_Grossiste_${Date.now()}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-700 mb-1">
            <Package className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Gestion de Stock & Catalogue
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Espace Inventaire & Marchandises
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des références, seuils de réapprovisionnement MOQ, valorisation du magasin et entrées d'arrivages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="Exporter l'inventaire en CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={() => setIsRestockOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="Enregistrer un arrivage fournisseur"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Réception Arrivage</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Produit</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Références Actives
          </span>
          <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {products.length} articles
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Valeur du Stock (DA)
          </span>
          <span className="text-lg font-bold text-indigo-700 font-mono tabular-nums">
            {formatDZD(totalValuation)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Alertes Stock Bas (&le; 1.5 &times; MOQ)
          </span>
          <span className="text-lg font-bold text-amber-600 font-mono tabular-nums">
            {lowStockCount} articles
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Ruptures Quai
          </span>
          <span className="text-lg font-bold text-red-600 font-mono tabular-nums">
            {outOfStockCount} articles
          </span>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher désignation, SKU, colisage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">Toutes les catégories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Level Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tous les niveaux de stock</option>
            <option value="LOW">Alertes Stock Bas ({lowStockCount})</option>
            <option value="OUT">Ruptures de Stock ({outOfStockCount})</option>
            <option value="OK">Stock Nominal</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">
                Aucun produit ne correspond à ces critères.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Ajustez vos filtres ou ajoutez une nouvelle référence.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-xs font-semibold border-b border-slate-200">
                  <th className="py-3 px-4 w-28">SKU</th>
                  <th className="py-3 px-4">Désignation & Gamme</th>
                  <th className="py-3 px-4 text-right">P.U. HT (DA)</th>
                  <th className="py-3 px-4 text-center">Niveau de Stock</th>
                  <th className="py-3 px-4 text-center">MOQ Requis</th>
                  <th className="py-3 px-4 text-right">Valeur Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const category = categories.find(
                    (c) => c._id === product.categoryId
                  );
                  return (
                    <ProductRow
                      key={product._id}
                      product={product}
                      categoryName={category?.name || 'Non classé'}
                      onEdit={() => handleOpenEdit(product)}
                      onDelete={() => handleDelete(product._id)}
                    />
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data) => {
            if (editingProduct) {
              await updateProduct({ id: editingProduct._id as any, ...data });
            } else {
              await createProduct(data);
            }
          }}
        />
      )}

      {isRestockOpen && (
        <BulkRestockModal
          products={products}
          onClose={() => setIsRestockOpen(false)}
          onRestock={async (productId, quantityToAdd) => {
            await adjustStock({
              productId: productId as any,
              quantityChange: quantityToAdd,
            });
          }}
        />
      )}
    </div>
  );
}
