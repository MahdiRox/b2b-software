// src/pages/admin/OrdersDashboard.tsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
// @ts-ignore
import { api } from '../../../convex/_generated/api';
import {
  ShoppingCart,
  Search,
  Plus,
  Download,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { Order, Product, OrderStatus } from '../../types';
import { OrderCard } from '../../components/admin/OrderCard';
import { CreateOrderModal } from '../../components/admin/CreateOrderModal';
import { exportToCSV, formatDate } from '../../utils/formatters';

export default function OrdersDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Queries & Mutations
  // @ts-ignore
  const products = (useQuery(api.products.list) as Product[]) || [];
  // @ts-ignore
  const orders = (useQuery(api.orders.listIncoming) as Order[]) || [];
  // @ts-ignore
  const updateStatus = useMutation(api.orders.updateStatus);
  // @ts-ignore
  const createOrder = useMutation(api.orders.createOrder);
  // @ts-ignore
  const deleteOrder = useMutation(api.orders.deleteOrder);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus =
        selectedStatus === 'ALL' || o.status === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.clientName.toLowerCase().includes(q) ||
        (o.wilaya && o.wilaya.toLowerCase().includes(q)) ||
        o._id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchQuery]);

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const rows = orders.map((o) => ({
      ID: o._id,
      Client: o.clientName,
      Wilaya: o.wilaya || '',
      Telephone: o.clientPhone || '',
      Statut: o.status,
      Total_DA: o.totalAmountDA,
      Articles_Count: o.items.length,
      Date: formatDate(o.createdAt || o._creationTime),
      Notes: o.notes || '',
    }));
    exportToCSV(`Commandes_Atlas_Grossiste_${Date.now()}.csv`, rows);
  };

  const statusCounts = useMemo(() => {
    return {
      ALL: orders.length,
      Pending: orders.filter((o) => o.status === 'Pending').length,
      Validated: orders.filter((o) => o.status === 'Validated').length,
      'In Delivery': orders.filter((o) => o.status === 'In Delivery').length,
      Paid: orders.filter((o) => o.status === 'Paid').length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-700 mb-1">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Flux des Ventes & Expéditions
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Tableau de Bord des Commandes Grossiste
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi en temps réel des commandes clients, validation des préparations et édition des bons de livraison.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="Exporter les commandes au format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nouvelle Commande</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60 text-xs">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Toutes ({statusCounts.ALL})
          </button>
          <button
            onClick={() => setSelectedStatus('Pending')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              selectedStatus === 'Pending'
                ? 'bg-white text-amber-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En attente ({statusCounts.Pending})
          </button>
          <button
            onClick={() => setSelectedStatus('Validated')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              selectedStatus === 'Validated'
                ? 'bg-white text-blue-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Validées ({statusCounts.Validated})
          </button>
          <button
            onClick={() => setSelectedStatus('In Delivery')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              selectedStatus === 'In Delivery'
                ? 'bg-white text-purple-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En livraison ({statusCounts['In Delivery']})
          </button>
          <button
            onClick={() => setSelectedStatus('Paid')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              selectedStatus === 'Paid'
                ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payées ({statusCounts.Paid})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher client, wilaya, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">
            Aucune commande ne correspond à vos critères.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Modifiez vos filtres ou créez une nouvelle commande B2B.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              updateStatus={updateStatus}
              deleteOrder={deleteOrder}
              products={products}
            />
          ))}
        </div>
      )}

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <CreateOrderModal
          products={products}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={async (data) => {
            await createOrder(data);
          }}
        />
      )}
    </div>
  );
}
