import React, { useState } from "react";
import { X, Plus, Activity } from "lucide-react";
import type { ValidationTrialRunSummary } from "@/services/types";

interface AddValidationTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (summary: ValidationTrialRunSummary) => void;
  currentSummary: ValidationTrialRunSummary;
}

export const AddValidationTrialModal: React.FC<AddValidationTrialModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  currentSummary,
}) => {
  const [totalParts, setTotalParts] = useState(currentSummary.totalPartsProduced);
  const [conformingParts, setConformingParts] = useState(currentSummary.conformingParts);
  const [nonConformingParts, setNonConformingParts] = useState(currentSummary.nonConformingParts);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fpy = Number(((conformingParts / (totalParts || 1)) * 100).toFixed(2));
    const defectRate = Number(((nonConformingParts / (totalParts || 1)) * 100).toFixed(2));

    onUpdate({
      totalPartsProduced: totalParts,
      conformingParts,
      nonConformingParts,
      currentFpy: fpy,
      defectRate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 text-xs">
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Log Trial Run Production Results</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Total Parts Produced *</label>
            <input
              type="number"
              required
              value={totalParts}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTotalParts(val);
                setConformingParts(Math.max(0, val - nonConformingParts));
              }}
              className="w-full bg-background border border-input rounded px-3 py-1.5 font-bold font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Conforming Parts</label>
              <input
                type="number"
                required
                value={conformingParts}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setConformingParts(val);
                  setNonConformingParts(Math.max(0, totalParts - val));
                }}
                className="w-full bg-background border border-input rounded px-3 py-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Non-Conforming Parts</label>
              <input
                type="number"
                required
                value={nonConformingParts}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setNonConformingParts(val);
                  setConformingParts(Math.max(0, totalParts - val));
                }}
                className="w-full bg-background border border-input rounded px-3 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-muted/40 rounded border border-border space-y-1 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Calculated FPY:</span>
              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                {((conformingParts / (totalParts || 1)) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Calculated Defect Rate:</span>
              <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400">
                {((nonConformingParts / (totalParts || 1)) * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-input rounded hover:bg-accent font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded shadow flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Save Trial Run Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
