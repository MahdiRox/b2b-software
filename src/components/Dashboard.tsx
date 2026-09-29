import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore - Ignore type errors until `npx convex dev` generates the strict types
import { api } from "../../convex/_generated/api";
import { 
  Package, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  Truck, 
  CreditCard,
  Save,
  AlertCircle
} from "lucide-react";

const formatDZD = (amount: number) => {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function Dashboard() {
  // @ts-ignore
  const products = useQuery(api.products.list);
  // @ts-ignore
  const orders = useQuery(api.orders.listIncoming);

  // @ts-ignore
  const updateStock = useMutation(api.products.updateStock);
  // @ts-ignore
  const updateStatus = useMutation(api.orders.updateStatus);

  if (products === undefined || orders === undefined) {
    return (
      <div className="flex bg-white items-center justify-center p-12 mt-12 rounded-2xl shadow-sm border border-slate-200">
        <div className="animate-pulse flex items-center text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-3"></div>
          Synchronizing Live Data from Convex...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT PANEL: Live Inventory Management */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-sm">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                <Package className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Live Inventory Management</h2>
            </div>
            <span className="bg-indigo-50 text-indigo-700 font-medium px-3 py-1 rounded-full text-xs border border-indigo-100">
              {products?.length || 0} Products
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <EmptyState icon={<Package className="w-6 h-6"/>} text="No products found in the database. Seed data via Convex dashboard." />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <th className="py-3 px-6 w-24">SKU</th>
                    <th className="py-3 px-6">Product Name</th>
                    <th className="py-3 px-6 whitespace-nowrap text-right">Price (DA)</th>
                    <th className="py-3 px-6 text-center w-48">Stock Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product: any) => (
                    <ProductRow 
                      key={product._id} 
                      product={product} 
                      updateStock={updateStock} 
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Incoming Orders */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Incoming Orders</h2>
            </div>
            <div className="flex items-center text-xs font-medium text-slate-500">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Real-time
            </div>
          </div>
          
          <div className="p-4 space-y-3 max-h-[700px] overflow-y-auto bg-slate-50/30">
            {orders.length === 0 ? (
              <EmptyState icon={<ShoppingCart className="w-6 h-6"/>} text="No incoming orders at the moment." />
            ) : (
              orders.map((order: any) => (
                <OrderCard 
                  key={order._id} 
                  order={order} 
                  updateStatus={updateStatus} 
                  products={products}
                />
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

// -- Subcomponents --

const ProductRow: React.FC<{ product: any; updateStock: any }> = ({ product, updateStock }) => {
  const [localStock, setLocalStock] = useState<number>(product.currentStock);
  const [isSaving, setIsSaving] = useState(false);

  const isChanged = localStock !== product.currentStock;

  const handleSave = async () => {
    if (localStock < 0) return;
    setIsSaving(true);
    try {
      await updateStock({ productId: product._id, newStock: localStock });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="py-4 px-6 text-slate-400 font-mono text-xs">{product.SKU}</td>
      <td className="py-4 px-6 font-medium text-slate-800">{product.name}</td>
      <td className="py-4 px-6 text-right text-slate-600 tabular-nums">
        {formatDZD(product.priceDA)}
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            min="0"
            value={localStock}
            onChange={(e) => setLocalStock(parseInt(e.target.value) || 0)}
            className="w-20 px-2 py-1.5 border border-slate-200 rounded-md text-sm text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
          <button
            onClick={handleSave}
            disabled={!isChanged || isSaving}
            className={`p-1.5 rounded-md transition-all ${
              isChanged && !isSaving 
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" 
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
            title="Save live stock"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

const OrderCard: React.FC<{ order: any; updateStatus: any; products: any[] }> = ({ order, updateStatus, products }) => {
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pending": 
        return { color: "bg-amber-100 text-amber-800 border-amber-200", icon: <Clock className="w-3.5 h-3.5 mr-1" /> };
      case "Validated": 
        return { color: "bg-blue-100 text-blue-800 border-blue-200", icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> };
      case "In Delivery": 
        return { color: "bg-purple-100 text-purple-800 border-purple-200", icon: <Truck className="w-3.5 h-3.5 mr-1" /> };
      case "Paid": 
        return { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CreditCard className="w-3.5 h-3.5 mr-1" /> };
      default: 
        return { color: "bg-slate-100 text-slate-800 border-slate-200", icon: <AlertCircle className="w-3.5 h-3.5 mr-1" /> };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const statusOptions = ["Pending", "Validated", "In Delivery", "Paid"];

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800">{order.clientName}</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">ID: {order._id.substring(0, 8)}...</p>
        </div>
        <span className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
          {statusConfig.icon}
          {order.status}
        </span>
      </div>

      {/* Items preview list */}
      <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100">
        <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Order Summary ({order.items.length} items)</div>
        <ul className="space-y-1">
          {order.items.map((item: any, idx: number) => {
            const productRef = products.find(p => p._id === item.productId);
            // Ignore missing lookups securely (could be deleted product)
            const label = productRef ? productRef.name : `Unknown (${item.productId.substring(0, 5)})`;
            return (
              <li key={idx} className="text-xs text-slate-600 flex justify-between">
                <span className="truncate pr-4 max-w-[200px]">{label}</span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded text-slate-500 border border-slate-200 text-[10px]">x{item.quantity}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="text-sm">
          <span className="text-slate-500 text-xs mr-1 block">Total Amount</span>
          <span className="font-bold text-slate-800 tabular-nums">{formatDZD(order.totalAmountDA)}</span>
        </div>
        
        {/* Status Mutator */}
        <div className="relative">
          <select 
            value={order.status}
            onChange={(e) => updateStatus({ orderId: order._id, newStatus: e.target.value })}
            className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

const EmptyState: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-slate-400">
      <div className="bg-slate-50 p-4 rounded-full mb-3 border border-slate-100">
        {icon}
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
}
