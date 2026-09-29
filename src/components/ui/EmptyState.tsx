// src/components/ui/EmptyState.tsx
import React from 'react';

export const EmptyState: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-slate-400">
      <div className="bg-slate-50 p-4 rounded-full mb-3 border border-slate-100">
        {icon}
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
};
