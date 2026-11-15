import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Plus, X } from 'lucide-react';

export interface DuplicateItemConfirmModalProps {
  isOpen: boolean;
  itemCode?: string;
  itemName?: string;
  onConfirmNewRow: () => void;
  onCancel: () => void;
}

export const DuplicateItemConfirmModal: React.FC<DuplicateItemConfirmModalProps> = ({
  isOpen,
  itemCode,
  itemName,
  onConfirmNewRow,
  onCancel,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const raf = window.requestAnimationFrame(() => {
      confirmBtnRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-900/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-item-confirm-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="bg-white rounded-2xl border border-amber-300 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-3.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <h3 id="duplicate-item-confirm-title">Duplicate Item Detected</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-amber-700/70 hover:text-amber-900 rounded-lg hover:bg-amber-100 cursor-pointer"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {(itemCode || itemName) && (
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold">
              {itemCode ? <span className="font-mono font-bold text-emerald-700 mr-1.5">[{itemCode}]</span> : null}
              <span>{itemName}</span>
            </div>
          )}

          <p className="text-sm font-semibold text-slate-900 leading-relaxed">
            This item already exists in this invoice. Do you want to add it again in a new row?
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              onClick={onConfirmNewRow}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yes – Add in New Row</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
