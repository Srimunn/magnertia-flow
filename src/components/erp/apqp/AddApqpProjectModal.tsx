import React, { useState } from "react";
import { X, Plus, Layers } from "lucide-react";
import type { ApqpFormInput } from "@/services/types";

interface AddApqpProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (input: ApqpFormInput) => void;
}

export const AddApqpProjectModal: React.FC<AddApqpProjectModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [apqpProjectName, setApqpProjectName] = useState("");
  const [apqpNumber, setApqpNumber] = useState(`APQP-EVSE-${Math.floor(100 + Math.random() * 900)}`);
  const [product, setProduct] = useState("Autonomous W-EVSE 22kW");
  const [productRevision, setProductRevision] = useState("REV-2.1");
  const [customer, setCustomer] = useState("EcoVolt Mobility Pvt. Ltd.");
  const [projectManager, setProjectManager] = useState("Rahul Sharma");
  const [targetSopDate, setTargetSopDate] = useState("15 Jul 2024");
  const [projectScope, setProjectScope] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apqpProjectName || !product) return;

    onAdd({
      apqpProjectName,
      apqpNumber,
      product,
      productRevision,
      customer,
      projectManager,
      targetSopDate,
      projectScope,
      workflowStatus: "Draft",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 text-xs">
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Create New APQP Project</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">APQP Project Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. 7kW Smart EVSE Wall-Mounted Charger Quality Program"
              value={apqpProjectName}
              onChange={(e) => setApqpProjectName(e.target.value)}
              className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">APQP Number *</label>
              <input
                type="text"
                required
                value={apqpNumber}
                onChange={(e) => setApqpNumber(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Product Revision *</label>
              <input
                type="text"
                required
                value={productRevision}
                onChange={(e) => setProductRevision(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Product *</label>
              <input
                type="text"
                required
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Customer *</label>
              <input
                type="text"
                required
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Project Manager</label>
              <input
                type="text"
                value={projectManager}
                onChange={(e) => setProjectManager(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Target SOP Date</label>
              <input
                type="text"
                value={targetSopDate}
                onChange={(e) => setTargetSopDate(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Project Scope</label>
            <textarea
              rows={2}
              placeholder="Brief description of product APQP scope..."
              value={projectScope}
              onChange={(e) => setProjectScope(e.target.value)}
              className="w-full bg-background border border-input rounded p-2 focus:ring-1 focus:ring-primary text-xs"
            />
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
              <Plus className="w-3.5 h-3.5" /> Initialize APQP Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
