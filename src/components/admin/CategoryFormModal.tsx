// src/components/admin/CategoryFormModal.tsx
import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';
import { Category } from '../../types';

interface CategoryFormModalProps {
  category?: Category | null;
  onClose: () => void;
  onSave: (data: { name: string; slug: string; description?: string }) => Promise<void>;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  category,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-generate slug when name changes if user hasn't customized it manually
  const handleNameChange = (val: string) => {
    setName(val);
    if (!category) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim() || !slug.trim()) {
      setErrorMsg('Le nom et le slug de la catégorie sont obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la sauvegarde de la catégorie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-slate-800">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {category ? 'Modifier la Catégorie' : 'Nouvelle Catégorie de Produits'}
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
              Nom de la Catégorie / Gamme *
            </label>
            <input
              required
              type="text"
              placeholder="ex. Produits Laitiers & Fromages"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Slug d'Identification Unique *
            </label>
            <input
              required
              type="text"
              placeholder="ex. produits-laitiers-fromages"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono text-slate-800"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Utilisé pour l'indexation et le filtrage rapide Convex.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description de la Gamme (Optionnel)
            </label>
            <textarea
              rows={3}
              placeholder="ex. Lait en poudre, fromages portion, beurre et crèmes pour détaillants..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 resize-none"
            />
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
              {isSubmitting ? 'Enregistrement...' : category ? 'Mettre à jour' : 'Créer la Catégorie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
