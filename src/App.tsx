// src/App.tsx
import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
// @ts-ignore
import { api } from '../convex/_generated/api';
import {
  Factory,
  LayoutDashboard,
  PackageSearch,
  Layers,
  TrendingUp,
  Plus,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Database,
  Building2,
} from 'lucide-react';
import OrdersDashboard from './pages/admin/OrdersDashboard';
import InventoryWorkspace from './pages/admin/InventoryWorkspace';
import CategoriesWorkspace from './pages/admin/CategoriesWorkspace';
import WarehouseAnalytics from './pages/admin/WarehouseAnalytics';
import { CreateOrderModal } from './components/admin/CreateOrderModal';
import { Product } from './types';

type ActiveTab = 'orders' | 'inventory' | 'categories' | 'analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  // Convex seed & reset
  // @ts-ignore
  const populate = useMutation(api.seed.populate);
  // @ts-ignore
  const clearAll = useMutation(api.seed.clearAll);
  // @ts-ignore
  const products = (useQuery(api.products.list) as Product[]) || [];
  // @ts-ignore
  const createOrder = useMutation(api.orders.createOrder);

  const handleSeedDemo = async () => {
    try {
      const res = await populate();
      setSeedNotice(res || 'Catalogue grossiste initialisé avec succès !');
      setTimeout(() => setSeedNotice(null), 4000);
    } catch (e: any) {
      setSeedNotice(e.message || 'Erreur lors du peuplement des données.');
      setTimeout(() => setSeedNotice(null), 4000);
    }
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        'Réinitialiser toutes les données (commandes, stocks et catégories) ?'
      )
    ) {
      try {
        await clearAll();
        setSeedNotice('Toutes les données ont été réinitialisées.');
        setTimeout(() => setSeedNotice(null), 4000);
      } catch (e: any) {
        setSeedNotice(e.message || 'Erreur de réinitialisation.');
        setTimeout(() => setSeedNotice(null), 4000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 pb-16 selection:bg-indigo-200">
      {/* Top Bar Header (Top Bar Contract: 3 Zones) */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-2xs">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 leading-tight block">
              Atlas Distribution
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-wide">
              Centrale Grossiste B2B · Alger
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60 text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 font-medium rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Commandes & Livraisons</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 font-medium rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PackageSearch className="w-3.5 h-3.5" />
            <span>Inventaire & Stocks</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-1.5 font-medium rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Catégories & Gammes</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 font-medium rounded-md flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Analytique Entrepôt</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions & Utilities */}
        <div className="flex items-center space-x-2.5">
          {/* Seed Demo Data Button */}
          <button
            onClick={handleSeedDemo}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer shadow-2xs"
            title="Peupler la base de données avec des produits et commandes réels d'Algérie"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Catalogue Démo</span>
          </button>

          {/* Quick Create Order */}
          <button
            onClick={() => setIsCreateOrderOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Commande</span>
          </button>

          {/* Live Sync Status */}
          <div className="hidden md:flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Convex Sync</span>
          </div>
        </div>
      </header>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-around text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-indigo-50 text-indigo-700 font-bold'
              : 'text-slate-600'
          }`}
        >
          Commandes
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-indigo-50 text-indigo-700 font-bold'
              : 'text-slate-600'
          }`}
        >
          Inventaire
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-indigo-50 text-indigo-700 font-bold'
              : 'text-slate-600'
          }`}
        >
          Catégories
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-indigo-50 text-indigo-700 font-bold'
              : 'text-slate-600'
          }`}
        >
          Analytique
        </button>
      </div>

      {/* Seed notification toast */}
      {seedNotice && (
        <div className="max-w-xl mx-auto mt-4 px-4">
          <div className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{seedNotice}</span>
            </div>
            <button
              onClick={() => setSeedNotice(null)}
              className="text-slate-400 hover:text-white text-xs ml-3"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {activeTab === 'orders' && <OrdersDashboard />}
        {activeTab === 'inventory' && <InventoryWorkspace />}
        {activeTab === 'categories' && <CategoriesWorkspace />}
        {activeTab === 'analytics' && <WarehouseAnalytics />}
      </main>

      {/* Global Create Order Modal */}
      {isCreateOrderOpen && (
        <CreateOrderModal
          products={products}
          onClose={() => setIsCreateOrderOpen(false)}
          onSubmit={async (data) => {
            await createOrder(data);
          }}
        />
      )}
    </div>
  );
}
