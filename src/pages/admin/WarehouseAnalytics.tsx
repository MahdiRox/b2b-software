// src/pages/admin/WarehouseAnalytics.tsx
import React from 'react';
import { useQuery } from 'convex/react';
// @ts-ignore
import { api } from '../../../convex/_generated/api';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  CreditCard,
  Building,
  Truck,
  Clock,
  CheckCircle2,
  PieChart,
  Boxes,
} from 'lucide-react';
import { Order, Product, Category } from '../../types';
import { formatDZD } from '../../utils/formatters';

export default function WarehouseAnalytics() {
  // @ts-ignore
  const products = (useQuery(api.products.list) as Product[]) || [];
  // @ts-ignore
  const orders = (useQuery(api.orders.listIncoming) as Order[]) || [];
  // @ts-ignore
  const categories = (useQuery(api.categories.getCategories) as Category[]) || [];

  // Metric Computations
  const totalStockValuation = products.reduce(
    (sum, p) => sum + p.stockQuantity * p.pricePerUnit,
    0
  );

  const totalStockUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity <= p.minOrderQuantity * 1.5 && p.stockQuantity > 0
  );

  const outOfStockProducts = products.filter((p) => p.stockQuantity === 0);

  const totalOrdersAmount = orders.reduce((sum, o) => sum + o.totalAmountDA, 0);

  const paidOrders = orders.filter((o) => o.status === 'Paid');
  const paidAmount = paidOrders.reduce((sum, o) => sum + o.totalAmountDA, 0);

  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const pendingAmount = pendingOrders.reduce((sum, o) => sum + o.totalAmountDA, 0);

  const validatedOrders = orders.filter((o) => o.status === 'Validated');
  const inDeliveryOrders = orders.filter((o) => o.status === 'In Delivery');

  // Wilaya distribution count
  const wilayaDistribution: Record<string, number> = {};
  orders.forEach((o) => {
    const w = o.wilaya || 'Non spécifiée';
    wilayaDistribution[w] = (wilayaDistribution[w] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-700 mb-1">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Pilotage Financier & Logistique
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Analytique Entrepôt & Flux Grossiste
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Valorisation en temps réel des actifs en stock, cadence des commandes et rotation marchande.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg self-start sm:self-auto font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Données synchronisées live</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Valorisation Stock Global
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {formatDZD(totalStockValuation)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
            <span className="font-semibold text-slate-700 font-mono">
              {totalStockUnits.toLocaleString()}
            </span>
            <span>unités réparties sur {products.length} références</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Encaissements Réalisés
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
            {formatDZD(paidAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">{paidOrders.length}</span>{' '}
            commandes payées sur {orders.length}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Encours Commandes Quai
            </span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
            {formatDZD(pendingAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">
              {pendingOrders.length}
            </span>{' '}
            commandes en attente de validation
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Alertes Réapprovisionnement
            </span>
            <div className="p-2 bg-red-50 text-red-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-red-600 font-mono tabular-nums">
            {lowStockProducts.length + outOfStockProducts.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="text-red-600 font-semibold">
              {lowStockProducts.length} sous seuil MOQ
            </span>{' '}
            · {outOfStockProducts.length} rupture
          </div>
        </div>
      </div>

      {/* Middle Grid: Category Breakdown & Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Share */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Boxes className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Répartition de la Valeur Stock par Catégorie
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {categories.length} gammes
            </span>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => {
              const catProds = products.filter((p) => p.categoryId === cat._id);
              const val = catProds.reduce(
                (sum, p) => sum + p.stockQuantity * p.pricePerUnit,
                0
              );
              const percentage =
                totalStockValuation > 0
                  ? Math.round((val / totalStockValuation) * 100)
                  : 0;

              return (
                <div key={cat._id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800">{cat.name}</span>
                    <span className="font-mono text-slate-600">
                      {formatDZD(val)}{' '}
                      <span className="text-slate-400 font-sans">
                        ({percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Funnel */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">
                Pipeline des Commandes Actives
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-amber-900">
                    En Attente de Validation
                  </span>
                </div>
                <span className="font-mono font-bold text-amber-900">
                  {pendingOrders.length}
                </span>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    Validées / En Préparation
                  </span>
                </div>
                <span className="font-mono font-bold text-blue-900">
                  {validatedOrders.length}
                </span>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-purple-900">
                    En Cours de Livraison Quai
                  </span>
                </div>
                <span className="font-mono font-bold text-purple-900">
                  {inDeliveryOrders.length}
                </span>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-900">
                    Livrées & Payées
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-900">
                  {paidOrders.length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500 font-medium">Chiffre d'Affaires Global:</span>
            <span className="font-mono font-bold text-indigo-700">
              {formatDZD(totalOrdersAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Low Stock Alert Focus Table & Wilaya Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Critical Low Stock SKUs */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="font-bold text-slate-800 text-sm">
                Radar de Réapprovisionnement Critique
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Articles dont le stock &le; 1.5 &times; MOQ
            </span>
          </div>

          {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
              <p className="font-medium text-slate-700">Tous les stocks sont au niveau nominal.</p>
              <p className="mt-0.5">Aucun article ne nécessite de commande usine urgente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Produit</th>
                    <th className="py-2.5 px-3 text-center">Stock Actuel</th>
                    <th className="py-2.5 px-3 text-center">MOQ Requis</th>
                    <th className="py-2.5 px-3 text-right">Statut Risque</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...outOfStockProducts, ...lowStockProducts].map((p) => {
                    const isOut = p.stockQuantity === 0;
                    return (
                      <tr key={p._id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-slate-500">{p.sku}</td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {p.name}
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {p.packageSize}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-red-600">
                          {p.stockQuantity}
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-slate-500">
                          {p.minOrderQuantity}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isOut
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isOut ? 'Rupture Totale' : 'Stock Bas'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Wilaya Deliveries */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <Building className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Répartition par Wilaya
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {Object.entries(wilayaDistribution).length === 0 ? (
              <p className="text-slate-400 text-center py-6">Aucune commande enregistrée.</p>
            ) : (
              Object.entries(wilayaDistribution).map(([wilayaName, count]) => (
                <div
                  key={wilayaName}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="font-medium text-slate-700">{wilayaName}</span>
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                    {count} {count > 1 ? 'commandes' : 'commande'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
