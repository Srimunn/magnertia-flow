import React, { useState } from "react";
import { X, Plus, Kanban } from "lucide-react";
import type { ControlPlanCharacteristic, ControlMethod } from "@/services/types";

interface AddCharacteristicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (char: Omit<ControlPlanCharacteristic, "id">) => void;
  nextStepNo: number;
}

export const AddCharacteristicModal: React.FC<AddCharacteristicModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  nextStepNo,
}) => {
  const [stepNo, setStepNo] = useState(nextStepNo);
  const [operationNo, setOperationNo] = useState(`OP-${nextStepNo * 10}`);
  const [processStep, setProcessStep] = useState("");
  const [productCharacteristic, setProductCharacteristic] = useState("");
  const [processCharacteristic, setProcessCharacteristic] = useState("");
  const [specialCharacteristics, setSpecialCharacteristics] = useState(`SC-0${nextStepNo}`);
  const [specification, setSpecification] = useState("");
  const [controlMethod, setControlMethod] = useState<ControlMethod>("Dimensional Inspection");
  const [readinessScore, setReadinessScore] = useState(85);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processStep || !productCharacteristic) return;

    onAdd({
      stepNo,
      operationNo,
      processStep,
      productCharacteristic,
      processCharacteristic,
      specialCharacteristics,
      specification,
      controlMethod,
      readinessScore,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 text-xs">
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Kanban className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Add Process & Product Characteristic</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Step No.</label>
              <input
                type="number"
                value={stepNo}
                onChange={(e) => setStepNo(Number(e.target.value))}
                className="w-full bg-background border border-input rounded px-3 py-1.5 font-bold text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Operation No. *</label>
              <input
                type="text"
                required
                value={operationNo}
                onChange={(e) => setOperationNo(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Process Step / Operation *</label>
            <input
              type="text"
              required
              placeholder="e.g. Enclosure Welding, Powder Coating"
              value={processStep}
              onChange={(e) => setProcessStep(e.target.value)}
              className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Product Characteristic *</label>
              <input
                type="text"
                required
                placeholder="e.g. Weld Strength, Cut Length"
                value={productCharacteristic}
                onChange={(e) => setProductCharacteristic(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Process Characteristic</label>
              <input
                type="text"
                placeholder="e.g. Weld Quality, Cutting Accuracy"
                value={processCharacteristic}
                onChange={(e) => setProcessCharacteristic(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Special Characteristics</label>
              <input
                type="text"
                placeholder="e.g. SC-01, SC-04"
                value={specialCharacteristics}
                onChange={(e) => setSpecialCharacteristics(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Specification / Tolerance *</label>
              <input
                type="text"
                required
                placeholder="e.g. Min. 120 N/mm², 500 ± 0.5 mm"
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Control Method</label>
            <select
              value={controlMethod}
              onChange={(e) => setControlMethod(e.target.value as ControlMethod)}
              className="w-full bg-background border border-input rounded px-3 py-1.5 font-semibold text-xs focus:ring-1 focus:ring-primary"
            >
              <option value="Visual Inspection">Visual Inspection</option>
              <option value="Dimensional Inspection">Dimensional Inspection</option>
              <option value="Functional Test">Functional Test</option>
              <option value="SPC Monitoring">SPC Monitoring</option>
              <option value="100% Inspection">100% Inspection</option>
              <option value="Sampling Inspection">Sampling Inspection</option>
              <option value="Automated Inspection">Automated Inspection</option>
            </select>
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
              <Plus className="w-3.5 h-3.5" /> Add Characteristic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
