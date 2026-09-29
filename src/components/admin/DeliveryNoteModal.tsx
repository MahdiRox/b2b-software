// src/components/admin/DeliveryNoteModal.tsx
import React from 'react';
import { Printer, X, CheckCircle2, Building2, MapPin, Phone, Calendar } from 'lucide-react';
import { formatDZD, formatDate } from '../../utils/formatters';
import { Order, Product } from '../../types';

interface DeliveryNoteModalProps {
  order: Order;
  products: Product[];
  onClose: () => void;
}

export const DeliveryNoteModal: React.FC<DeliveryNoteModalProps> = ({
  order,
  products,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const getProduct = (productId: string) => {
    return products.find((p) => p._id === productId);
  };

  const docNumber = `BL-2026-${order._id.slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl my-6 text-slate-800 overflow-hidden print:m-0 print:border-none print:shadow-none">
        {/* Modal Controls Header (Hidden in print) */}
        <div className="no-print px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800 text-sm">
              Aperçu Bon de Livraison & Facture Proforma
            </span>
            <span className="text-xs text-slate-400 font-mono">({docNumber})</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer le document</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-8 sm:p-10 bg-white" id="printable-delivery-slip">
          {/* Company & Client Header */}
          <div className="border-b-2 border-slate-800 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="bg-slate-900 text-white font-black text-sm px-2 py-1 rounded tracking-wider">
                    ATLAS
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    SARL ATLAS DISTRIBUTION
                  </h1>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Centrale Grossiste & Logistique Agroalimentaire Algérie
                </p>
                <div className="text-[11px] text-slate-500 mt-2 space-y-0.5 font-mono">
                  <p>Zone Industrielle Voie 04, Oued Smar, 16200 Alger</p>
                  <p>RC: 16/00-0984321B21 · NIF: 002116098432194 · NIS: 001916010043</p>
                  <p>Tél: +213 (0) 23 85 40 10 / 12 · Email: commercial@atlas-distribution.dz</p>
                </div>
              </div>

              {/* Document Identity Box */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 min-w-[240px] text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  Bon de Livraison / Réception
                </span>
                <div className="text-lg font-bold font-mono text-slate-900 mt-2">
                  {docNumber}
                </div>
                <div className="text-xs text-slate-600 mt-1 flex items-center justify-end space-x-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Date: {formatDate(order.createdAt || order._creationTime || Date.now())}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Statut: <span className="font-semibold text-slate-800">{order.status}</span>
                </div>
              </div>
            </div>

            {/* Client Destination Details */}
            <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Destinataire / Client B2B
                </span>
                <p className="text-sm font-bold text-slate-900">{order.clientName}</p>
                {order.wilaya && (
                  <p className="text-xs text-slate-600 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                    Wilaya: {order.wilaya}
                  </p>
                )}
                {order.clientPhone && (
                  <p className="text-xs text-slate-600 flex items-center mt-0.5 font-mono">
                    <Phone className="w-3 h-3 mr-1 text-slate-400" />
                    Tél: {order.clientPhone}
                  </p>
                )}
              </div>

              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Conditions de Transport & Règlement
                </span>
                <p>Mode: Livraison directe par flotte logistique Atlas</p>
                <p className="mt-0.5">Paiement: À la livraison (Espèces / Chèque certifié B2B)</p>
                {order.notes && (
                  <p className="mt-1 text-slate-700 italic border-t border-slate-200 pt-1">
                    Note: "{order.notes}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Table of Articles */}
          <div className="mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold">
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3 w-28 font-mono">Réf / SKU</th>
                  <th className="py-2.5 px-3">Désignation Produit</th>
                  <th className="py-2.5 px-3">Conditionnement</th>
                  <th className="py-2.5 px-3 text-right">Qté Livrée</th>
                  <th className="py-2.5 px-3 text-right">P.U. HT (DA)</th>
                  <th className="py-2.5 px-3 text-right">Montant HT (DA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                {order.items.map((item, idx) => {
                  const product = getProduct(item.productId);
                  const unitPrice = item.unitPriceDA || product?.pricePerUnit || 0;
                  const lineTotal = unitPrice * item.quantity;

                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-medium text-slate-700">
                        {product?.sku || item.productId.slice(0, 8)}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {product?.name || "Produit Référencé"}
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {product?.packageSize || "-"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {formatDZD(unitPrice)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatDZD(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6 mb-6">
            <div className="text-xs text-slate-500 max-w-sm">
              <p className="font-semibold text-slate-700 mb-1">Mentions Légales & Rétention:</p>
              <p>
                Marchandises réceptionnées conformes en quantité et qualité marchande. Toute contestation doit être signalée par écrit dans les 48 heures ouvrées suivant la livraison.
              </p>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Total Brut HT:</span>
                <span className="font-mono font-medium">{formatDZD(order.totalAmountDA)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>TVA (Exonération Vente Gros):</span>
                <span className="font-mono">0,00 DA</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Timbre Fiscal / Frais:</span>
                <span className="font-mono">0,00 DA</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span>Total Net à Payer (DA):</span>
                <span className="font-mono text-indigo-700">{formatDZD(order.totalAmountDA)}</span>
              </div>
            </div>
          </div>

          {/* Stamps & Signatures */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs text-slate-600 pt-2">
            <div className="border border-dashed border-slate-300 rounded-lg p-6 min-h-[110px] flex flex-col justify-between">
              <span className="font-semibold text-slate-800">
                Visa & Cachet Magasin Expéditeur
              </span>
              <span className="text-[10px] text-slate-400 italic">Signature Responsable Quai</span>
            </div>
            <div className="border border-dashed border-slate-300 rounded-lg p-6 min-h-[110px] flex flex-col justify-between">
              <span className="font-semibold text-slate-800">
                Visa, Nom & Cachet Réceptionnaire Client
              </span>
              <span className="text-[10px] text-slate-400 italic">Mention "Bon pour accord"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
