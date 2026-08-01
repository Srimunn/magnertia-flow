import React, { useState } from "react";
import { X, Plus, ShieldAlert } from "lucide-react";
import type { PfmeaFailureMode, ActionPriority } from "@/services/types";

interface AddFailureModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (fm: Omit<PfmeaFailureMode, "id">) => void;
  nextStepNo: number;
}

export const AddFailureModeModal: React.FC<AddFailureModeModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  nextStepNo,
}) => {
  const [stepNo, setStepNo] = useState(nextStepNo);
  const [processStep, setProcessStep] = useState("");
  const [potentialFailureMode, setPotentialFailureMode] = useState("");
  const [severity, setSeverity] = useState(7);
  const [potentialEffect, setPotentialEffect] = useState("");
  const [occurrence, setOccurrence] = useState(3);
  const [potentialCause, setPotentialCause] = useState("");
  const [currentControls, setCurrentControls] = useState("");
  const [detection, setDetection] = useState(4);
  const [status, setStatus] = useState<"Open" | "In Progress" | "Completed" | "Verified">("Open");

  if (!isOpen) return null;

  const rpnBefore = severity * occurrence * detection;
  const actionPriority: ActionPriority = rpnBefore >= 100 ? "High (H)" : rpnBefore >= 70 ? "Medium (M)" : "Low (L)";
  const estimatedRpnAfter = Math.round(rpnBefore * 0.3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processStep || !potentialFailureMode) return;

    onAdd({
      stepNo,
      processStep,
      potentialFailureMode,
      severity,
      potentialEffect,
      occurrence,
      potentialCause,
      currentControls,
      detection,
      actionPriority,
      rpnBefore,
      rpnAfter: estimatedRpnAfter,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200 text-xs">
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-sm text-foreground">Add Process Failure Mode (PFMEA)</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Step No.</label>
              <input
                type="number"
                value={stepNo}
                onChange={(e) => setStepNo(Number(e.target.value))}
                className="w-full bg-background border border-input rounded px-3 py-1.5 font-bold text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-muted-foreground mb-1">Process Step *</label>
              <input
                type="text"
                required
                placeholder="e.g. Enclosure Welding, SMT Assembly"
                value={processStep}
                onChange={(e) => setProcessStep(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Potential Failure Mode *</label>
            <input
              type="text"
              required
              placeholder="e.g. Porosity in Weld, Solder Joint Defect"
              value={potentialFailureMode}
              onChange={(e) => setPotentialFailureMode(e.target.value)}
              className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Potential Effect of Failure</label>
              <textarea
                rows={2}
                placeholder="e.g. Structural leak, electrical short circuit"
                value={potentialEffect}
                onChange={(e) => setPotentialEffect(e.target.value)}
                className="w-full bg-background border border-input rounded p-2 focus:ring-1 focus:ring-primary text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Potential Cause of Failure</label>
              <textarea
                rows={2}
                placeholder="e.g. Improper gas flow, incorrect temperature profile"
                value={potentialCause}
                onChange={(e) => setPotentialCause(e.target.value)}
                className="w-full bg-background border border-input rounded p-2 focus:ring-1 focus:ring-primary text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Current Process Controls</label>
            <input
              type="text"
              placeholder="e.g. AOI, SPI, Torque check, COA verification"
              value={currentControls}
              onChange={(e) => setCurrentControls(e.target.value)}
              className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          {/* S / O / D Score Rating Sliders */}
          <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-2">
            <div className="font-bold text-foreground text-xs flex justify-between items-center">
              <span>Risk Evaluation Ratings (S × O × D)</span>
              <span className="font-mono text-primary font-black">
                RPN = {rpnBefore} ({actionPriority})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  Severity (S): {severity}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  Occurrence (O): {occurrence}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={occurrence}
                  onChange={(e) => setOccurrence(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  Detection (D): {detection}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={detection}
                  onChange={(e) => setDetection(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
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
              <Plus className="w-3.5 h-3.5" /> Add Failure Mode
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
