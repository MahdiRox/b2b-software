// src/components/admin/OrderCard.tsx
import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Truck,
  CreditCard,
  AlertCircle,
  Printer,
  ChevronRight,
  Trash2,
  MapPin,
  Phone,
} from 'lucide-react';
import { Order, Product, OrderStatus } from '../../types';
import { formatDZD, formatDate } from '../../utils/formatters';
import { DeliveryNoteModal } from './DeliveryNoteModal';

interface OrderCardProps {
  order: Order;
  updateStatus: (args: { orderId: any; newStatus: OrderStatus }) => Promise<void>;
  deleteOrder?: (args: { orderId: any }) => Promise<void>;
  products: Product[];
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  updateStatus,
  deleteOrder,
  products,
}) => {
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5 mr-1" />,
          label: 'En attente validation',
        };
      case 'Validated':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
          label: 'Validée (Préparation)',
        };
      case 'In Delivery':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: <Truck className="w-3.5 h-3.5 mr-1" />,
          label: 'En cours de livraison',
        };
      case 'Paid':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <CreditCard className="w-3.5 h-3.5 mr-1" />,
          label: 'Livrée & Réglée',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
          label: status,
        };
    }
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'Pending':
        return 'Validated';
      case 'Validated':
        return 'In Delivery';
      case 'In Delivery':
        return 'Paid';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(order.status);

  const handleAdvanceStatus = async () => {
    if (!nextStatus || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateStatus({
        orderId: order._id as any,
        newStatus: nextStatus,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteOrder) return;
    if (
      window.confirm(
        `Annuler et supprimer la commande de "${order.clientName}" ? Le stock réservé sera restitué à l'entrepôt.`
      )
    ) {
      await deleteOrder({ orderId: order._id as any });
    }
  };

  const badge = getStatusBadge(order.status);
  const statusOptions: OrderStatus[] = [
    'Pending',
    'Validated',
    'In Delivery',
    'Paid',
  ];

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">
                {order.clientName}
              </h3>
              <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500">
                <span className="font-mono text-slate-400">
                  #{order._id.slice(-6).toUpperCase()}
                </span>
                {order.wilaya && (
                  <>
                    <span>·</span>
                    <span className="flex items-center text-slate-600">
                      <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                      {order.wilaya}
                    </span>
                  </>
                )}
              </div>
            </div>

            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${badge.bg}`}
            >
              {badge.icon}
              <span>{order.status}</span>
            </span>
          </div>

          {/* Client phone or note */}
          {(order.clientPhone || order.notes) && (
            <div className="text-[11px] text-slate-500 mb-3 space-y-0.5">
              {order.clientPhone && (
                <div className="flex items-center font-mono text-slate-600">
                  <Phone className="w-3 h-3 mr-1 text-slate-400" />
                  {order.clientPhone}
                </div>
              )}
              {order.notes && (
                <div className="text-slate-500 italic truncate" title={order.notes}>
                  Note: {order.notes}
                </div>
              )}
            </div>
          )}

          {/* Items Summary */}
          <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex justify-between">
              <span>Articles Commandés ({order.items.length})</span>
              <span className="font-mono text-slate-500">
                {formatDate(order.createdAt || order._creationTime)}
              </span>
            </div>
            <ul className="space-y-1">
              {order.items.slice(0, 3).map((item, idx) => {
                const product = products.find((p) => p._id === item.productId);
                const name = product ? product.name : `Article (${item.productId.slice(0, 6)})`;
                return (
                  <li key={idx} className="flex justify-between text-slate-700">
                    <span className="truncate max-w-[170px]" title={name}>
                      {name}
                    </span>
                    <span className="font-mono font-semibold text-slate-800 tabular-nums">
                      x{item.quantity}
                    </span>
                  </li>
                );
              })}
              {order.items.length > 3 && (
                <li className="text-[10px] text-slate-400 italic pt-0.5">
                  + {order.items.length - 3} autre(s) article(s)...
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer Area */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Montant Net HT
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                {formatDZD(order.totalAmountDA)}
              </span>
            </div>

            {/* Quick Status Dropdown */}
            <div className="relative">
              <select
                value={order.status}
                disabled={isUpdating}
                onChange={(e) =>
                  updateStatus({
                    orderId: order._id as any,
                    newStatus: e.target.value as OrderStatus,
                  })
                }
                className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 py-1 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs hover:bg-slate-50"
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => setShowSlipModal(true)}
              className="flex items-center space-x-1 text-xs text-indigo-700 hover:text-indigo-900 font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition cursor-pointer"
              title="Voir et imprimer le Bon de Livraison"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Bon de Livraison</span>
            </button>

            <div className="flex items-center space-x-1">
              {nextStatus && (
                <button
                  onClick={handleAdvanceStatus}
                  disabled={isUpdating}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition cursor-pointer shadow-2xs disabled:opacity-50"
                  title={`Passer à l'état ${nextStatus}`}
                >
                  <span>
                    {nextStatus === 'Validated'
                      ? 'Valider'
                      : nextStatus === 'In Delivery'
                      ? 'Expédier'
                      : 'Régler'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {deleteOrder && (
                <button
                  onClick={handleDelete}
                  className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition cursor-pointer"
                  title="Annuler et supprimer la commande"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSlipModal && (
        <DeliveryNoteModal
          order={order}
          products={products}
          onClose={() => setShowSlipModal(false)}
        />
      )}
    </>
  );
};
