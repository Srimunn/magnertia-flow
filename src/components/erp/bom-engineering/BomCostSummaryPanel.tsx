import React from "react";
import { Calculator, ArrowDownRight } from "lucide-react";
import type { BomEngineeringRecord } from "@/services/types";

interface BomCostSummaryPanelProps {
  record: BomEngineeringRecord;
}

export const BomCostSummaryPanel: React.FC<BomCostSummaryPanelProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3 text-xs">
      <div className="flex justify-between items-center pb-2 border-b border-border mb-2">
        <div className="flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold text-foreground text-xs">Cost Summary (₹)</h2>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
          <ArrowDownRight className="w-3 h-3" /> Favorable Variance
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-[11px]">Material Cost</span>
          <span className="font-mono font-medium text-foreground text-xs">
            ₹{record.materialCost.toLocaleString("en-IN")}.00
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-[11px]">Manufacturing Cost</span>
          <span className="font-mono font-medium text-foreground text-xs">
            ₹{record.manufacturingCost.toLocaleString("en-IN")}.00
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-[11px]">Purchased Component Cost</span>
          <span className="font-mono font-medium text-foreground text-xs">
            ₹{record.purchasedComponentCost.toLocaleString("en-IN")}.00
          </span>
        </div>

        <div className="flex justify-between items-center py-1.5 border-t border-b border-border my-1 bg-muted/40 px-2 rounded">
          <span className="font-bold text-foreground text-xs">Total BOM Cost</span>
          <span className="font-mono text-xs font-black text-primary">
            ₹{record.totalBomCost.toLocaleString("en-IN")}.00
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-[11px]">Target Cost</span>
          <span className="font-mono font-medium text-foreground text-xs">
            ₹{record.targetCost.toLocaleString("en-IN")}.00
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-[11px]">Cost Variance</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
            -₹{Math.abs(record.costVariance).toLocaleString("en-IN")}.00
          </span>
        </div>

        <div className="flex justify-between items-center pt-1.5 border-t border-border mt-1">
          <span className="font-semibold text-muted-foreground text-[11px]">Cost Score</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-300 dark:border-emerald-800">
            {record.costScore} / 100
          </span>
        </div>
      </div>
    </div>
  );
};
