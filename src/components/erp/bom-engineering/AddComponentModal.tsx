import React, { useState } from "react";
import { X, Plus, Package } from "lucide-react";
import type { BomItemCategory, BomMakeBuyDecision, BomItemNode } from "@/services/types";

interface AddComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<BomItemNode, "id">) => void;
}

export const AddComponentModal: React.FC<AddComponentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [partNumber, setPartNumber] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [uom, setUom] = useState("Nos");
  const [itemCategory, setItemCategory] = useState<BomItemCategory>("Purchased Part");
  const [makeBuy, setMakeBuy] = useState<BomMakeBuyDecision>("Buy");
  const [unitCost, setUnitCost] = useState(1200);
  const [leadTimeDays, setLeadTimeDays] = useState(5);
  const [referenceDesignator, setReferenceDesignator] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partNumber || !description) return;

    onAdd({
      partNumber,
      description,
      level,
      quantity,
      uom,
      itemCategory,
      makeBuy,
      unitCost,
      totalCost: unitCost * quantity,
      leadTimeDays,
      status: "Approved",
      referenceDesignator: referenceDesignator || undefined,
      completenessScore: 100,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Add New BOM Component</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Part Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. AW-CAP-100uF"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Level *</label>
              <input
                type="number"
                min={0}
                max={5}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Part Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. High Temp Capacitor 100uF 450V"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Quantity *</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">UOM</label>
              <select
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              >
                <option value="Nos">Nos</option>
                <option value="Set">Set</option>
                <option value="Kg">Kg</option>
                <option value="Meter">Meter</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Make / Buy</label>
              <select
                value={makeBuy}
                onChange={(e) => setMakeBuy(e.target.value as BomMakeBuyDecision)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              >
                <option value="Make">Make</option>
                <option value="Buy">Buy</option>
                <option value="Outsource">Outsource</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Item Category</label>
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value as BomItemCategory)}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              >
                <option value="Raw Material">Raw Material</option>
                <option value="Purchased Part">Purchased Part</option>
                <option value="Fabricated Part">Fabricated Part</option>
                <option value="Sub-Assembly">Sub-Assembly</option>
                <option value="Fastener">Fastener</option>
                <option value="Electronic Component">Electronic Component</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Unit Cost (₹)</label>
              <input
                type="number"
                min={0}
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">Lead Time (Days)</label>
              <input
                type="number"
                min={0}
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Reference Designator</label>
            <input
              type="text"
              placeholder="e.g. C101, C102"
              value={referenceDesignator}
              onChange={(e) => setReferenceDesignator(e.target.value)}
              className="w-full bg-background border border-input rounded px-3 py-1.5 focus:ring-1 focus:ring-primary"
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
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
