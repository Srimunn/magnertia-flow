import React from "react";
import { Calculator, ArrowDownRight } from "lucide-react";
import type { RoutingRecord } from "@/services/types";

interface CostAnalysisTabProps {
  record: RoutingRecord;
}

export const CostAnalysisTab: React.FC<CostAnalysisTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Production Cost Engineering & Activity Based Costing
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analyzes machine processing costs, direct labour costs, tooling amortization, and overhead allocation.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-950 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800">
          <span className="text-xs text-muted-foreground font-semibold">Cost Score:</span>
          <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
            {record.costScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-1">
          <span className="text-muted-foreground uppercase font-semibold text-[10px]">Machine Cost</span>
          <div className="text-xl font-bold font-mono text-foreground">
            ₹{record.machineCost.toLocaleString("en-IN")}.00
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-1">
          <span className="text-muted-foreground uppercase font-semibold text-[10px]">Labour Cost</span>
          <div className="text-xl font-bold font-mono text-foreground">
            ₹{record.labourCost.toLocaleString("en-IN")}.00
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-1">
          <span className="text-muted-foreground uppercase font-semibold text-[10px]">Tooling Cost</span>
          <div className="text-xl font-bold font-mono text-foreground">
            ₹{record.toolingCost.toLocaleString("en-IN")}.00
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border-2 border-primary/40 bg-primary/5 space-y-1">
          <span className="text-muted-foreground uppercase font-semibold text-[10px]">Total Routing Cost</span>
          <div className="text-xl font-black font-mono text-primary">
            ₹{record.totalRoutingCost.toLocaleString("en-IN")}.00
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowDownRight className="w-3 h-3" /> Favorable (₹{record.costVariance.toLocaleString("en-IN")}.00 vs Target)
          </div>
        </div>
      </div>
    </div>
  );
};
