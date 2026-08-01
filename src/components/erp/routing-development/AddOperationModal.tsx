import React, { useState } from "react";
import { X, Plus, GitCommit } from "lucide-react";
import type { RoutingOperation } from "@/services/types";

interface AddOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (op: Omit<RoutingOperation, "id">) => void;
  nextSeq: number;
}

export const AddOperationModal: React.FC<AddOperationModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  nextSeq,
}) => {
  const [operationNo, setOperationNo] = useState(`OP-${(nextSeq * 10)}`);
  const [operationName, setOperationName] = useState("");
  const [workCentre, setWorkCentre] = useState("AS-04");
  const [machine, setMachine] = useState("Assembly Station-4");
  const [setupTimeMins, setSetupTimeMins] = useState(15);
  const [cycleTimeMins, setCycleTimeMins] = useState(10.0);
  const [labourCount, setLabourCount] = useState(1);
  const [criticalOp, setCriticalOp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operationNo || !operationName) return;

    onAdd({
      seq: nextSeq,
      operationNo,
      operationName,
      workCentre,
      machine,
      setupTimeMins,
      cycleTimeMins,
      labourCount,
      status: "Active",
      criticalOp,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Add Manufacturing Operation</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Operation No. *</label>
              <input
                type="text"
                required
                placeholder="e.g. OP-130"
                value={operationNo}
                onChange={(e) => setOperationNo(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Sequence #</label>
              <input
                type="number"
                readOnly
                value={nextSeq}
                className="w-full bg-muted border border-input rounded px-3 py-1.5 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Operation Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Final Quality Audit & Barcode Labeling"
              value={operationName}
              onChange={(e) => setOperationName(e.target.value)}
              className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Work Centre *</label>
              <input
                type="text"
                required
                placeholder="e.g. QC-03"
                value={workCentre}
                onChange={(e) => setWorkCentre(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Machine / Station *</label>
              <input
                type="text"
                required
                placeholder="e.g. Label Printing & Scanner Bench"
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Setup Time (min)</label>
              <input
                type="number"
                min={0}
                value={setupTimeMins}
                onChange={(e) => setSetupTimeMins(Number(e.target.value))}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Cycle Time (min)</label>
              <input
                type="number"
                step="0.5"
                min={0.1}
                value={cycleTimeMins}
                onChange={(e) => setCycleTimeMins(Number(e.target.value))}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Labour Count</label>
              <input
                type="number"
                min={1}
                value={labourCount}
                onChange={(e) => setLabourCount(Number(e.target.value))}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="criticalOpCheck"
              checked={criticalOp}
              onChange={(e) => setCriticalOp(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="criticalOpCheck" className="text-muted-foreground font-semibold">
              Mark as Critical Operation (Requires SPC / Special Quality Gate)
            </label>
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
              <Plus className="w-3.5 h-3.5" /> Add Operation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
