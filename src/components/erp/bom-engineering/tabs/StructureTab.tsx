import React, { useState } from "react";
import { Plus, Search, Filter, Layers, Download, CheckCircle2, AlertCircle } from "lucide-react";
import type { BomEngineeringRecord, BomItemNode } from "@/services/types";

interface StructureTabProps {
  record: BomEngineeringRecord;
  onAddComponent: () => void;
}

export const StructureTab: React.FC<StructureTabProps> = ({
  record,
  onAddComponent,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const filteredItems = record.items.filter((item) => {
    const matchesSearch =
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || item.itemCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-card p-4 rounded-lg border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">
            BOM Engineering Structure & Part Attributes
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            MAICW Controlled Product Structure Tree with Assembly Leveling, Reference Designators, and Completeness Scoring.
          </p>
        </div>
        <button
          onClick={onAddComponent}
          className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded shadow flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add BOM Component
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card p-3 rounded-lg border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by part number, description, ref designator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-input rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground font-semibold">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-input rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Categories</option>
            <option value="Assembly">Assembly</option>
            <option value="Sub-Assembly">Sub-Assembly</option>
            <option value="Purchased Part">Purchased Part</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Electronic Component">Electronic Component</option>
          </select>
        </div>
      </div>

      {/* Structured Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <th className="py-3 px-3 min-w-[180px]">Part Number</th>
                <th className="py-3 px-3 min-w-[200px]">Part Description</th>
                <th className="py-3 px-3 w-16 text-center">Level</th>
                <th className="py-3 px-3 min-w-[130px]">Item Category</th>
                <th className="py-3 px-3 w-16 text-center">Qty</th>
                <th className="py-3 px-3 w-16 text-center">UOM</th>
                <th className="py-3 px-3 min-w-[120px]">Ref Designator</th>
                <th className="py-3 px-3 min-w-[130px]">Alternate Part</th>
                <th className="py-3 px-3 text-right">Unit Cost (₹)</th>
                <th className="py-3 px-3 text-right">Total Cost (₹)</th>
                <th className="py-3 px-3 text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold font-mono text-foreground">
                    {item.partNumber}
                  </td>
                  <td className="py-2.5 px-3 text-foreground">{item.description}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">
                    {item.level}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted border border-border">
                      {item.itemCategory}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-foreground">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-center text-muted-foreground">
                    {item.uom}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground font-mono">
                    {item.referenceDesignator || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground font-mono">
                    {item.alternatePart || "N/A"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-foreground">
                    {item.unitCost > 0 ? item.unitCost.toLocaleString("en-IN") : "-"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                    ₹{item.totalCost.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">
                      {item.completenessScore || 90}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
