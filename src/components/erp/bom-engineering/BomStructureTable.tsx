import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  Package,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import type { BomItemNode } from "@/services/types";

interface BomStructureTableProps {
  items: BomItemNode[];
  onAddComponent?: () => void;
}

export const BomStructureTable: React.FC<BomStructureTableProps> = ({
  items,
  onAddComponent,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewLevel, setViewLevel] = useState<"Multi Level" | "Single Level">("Multi Level");
  const [groupBy, setGroupBy] = useState<string>("None");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "item-00": true,
  });

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredItems = items.filter(
    (item) =>
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grandTotalCost = items.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      {/* Table Toolbar Header matching image 2 */}
      <div className="p-3.5 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground">BOM Structure</h2>
          <span className="text-xs text-muted-foreground font-normal">
            (Total {items.length} Items)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">View</span>
            <select
              value={viewLevel}
              onChange={(e) => setViewLevel(e.target.value as any)}
              className="bg-background border border-input rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Multi Level">Multi Level</option>
              <option value="Single Level">Single Level</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">Group By</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="bg-background border border-input rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="None">None</option>
              <option value="Category">Category</option>
              <option value="Make/Buy">Make/Buy</option>
            </select>
          </div>

          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search part number, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-input rounded pl-8 pr-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button className="px-2.5 py-1 border border-input bg-background hover:bg-accent text-xs font-medium rounded shadow-sm">
            Compare BOM
          </button>

          <button className="px-2.5 py-1 border border-input bg-background hover:bg-accent text-xs font-medium rounded shadow-sm flex items-center gap-1">
            <FileSpreadsheet className="w-3 h-3" /> Export
          </button>

          <button className="p-1 border border-input bg-background hover:bg-accent rounded text-muted-foreground">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Hierarchical Tree Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-3 min-w-[260px]">Part Number / Description</th>
              <th className="py-2.5 px-3 w-14 text-center">Level</th>
              <th className="py-2.5 px-3 w-16 text-center">Quantity</th>
              <th className="py-2.5 px-3 w-14 text-center">UOM</th>
              <th className="py-2.5 px-3 min-w-[120px]">Item Category</th>
              <th className="py-2.5 px-3 w-20 text-center">Make/Buy</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Unit Cost (₹)</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Total Cost (₹)</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Lead Time</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredItems.map((item) => {
              const hasChildren = item.level === 0;
              const isExpanded = expandedNodes[item.id];

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-muted/30 transition-colors ${
                    item.level === 0 ? "bg-primary/5 font-semibold" : ""
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingLeft: `${item.level * 16}px` }}
                    >
                      {hasChildren ? (
                        <button
                          onClick={() => toggleNode(item.id)}
                          className="p-0.5 hover:bg-accent rounded text-muted-foreground shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ) : (
                        <span className="w-4 shrink-0" />
                      )}

                      <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-foreground truncate">
                          {item.partNumber}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">
                    {item.level}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-foreground">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-center text-muted-foreground">
                    {item.uom}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted border border-border">
                      {item.itemCategory}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.makeBuy === "Make"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {item.makeBuy}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-foreground whitespace-nowrap">
                    {item.unitCost > 0 ? item.unitCost.toLocaleString("en-IN") : "-"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                    ₹{item.totalCost.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 px-3 text-center text-muted-foreground whitespace-nowrap">
                    {item.leadTimeDays > 0 ? `${item.leadTimeDays} Days` : "-"}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Approved
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="p-3 bg-muted/40 border-t border-border flex flex-col sm:flex-row justify-between items-center text-xs font-bold gap-2">
        <div className="text-muted-foreground">
          Showing 1 - {filteredItems.length} of {items.length} entries
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">Total Cost:</span>
          <span className="text-sm text-primary font-black font-mono">
            ₹{grandTotalCost.toLocaleString("en-IN")}.00
          </span>
        </div>
      </div>
    </div>
  );
};
