import React from "react";
import { Calculator, ArrowDownRight } from "lucide-react";
import type { RoutingRecord } from "@/services/types";

interface ProductionCostAnalysisCardProps {
  record: RoutingRecord;
}

export const ProductionCostAnalysisCard: React.FC<ProductionCostAnalysisCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h3 className="font-bold text-foreground text-xs">6. Production Cost Analysis</h3>
          <span className="px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[10px]">
            {record.costScore} / 100
          </span>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Machine Cost</span>
            <span className="font-mono text-foreground">₹{record.machineCost.toLocaleString("en-IN")}.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Labour Cost</span>
            <span className="font-mono text-foreground">₹{record.labourCost.toLocaleString("en-IN")}.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tooling Cost</span>
            <span className="font-mono text-foreground">₹{record.toolingCost.toLocaleString("en-IN")}.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Overhead Cost</span>
            <span className="font-mono text-foreground">₹{record.overheadCost.toLocaleString("en-IN")}.00</span>
          </div>
          <div className="flex justify-between items-center py-1 border-t border-b border-border my-1 font-bold">
            <span className="text-foreground">Total Routing Cost</span>
            <span className="font-mono text-primary">₹{record.totalRoutingCost.toLocaleString("en-IN")}.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Target Cost</span>
            <span className="font-mono text-foreground">₹{record.targetCost.toLocaleString("en-IN")}.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Cost Variance</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              ₹{record.costVariance.toLocaleString("en-IN")}.00 (Favorable)
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border mt-2 flex justify-between items-center">
        <span className="font-semibold text-muted-foreground text-[10px]">Cost Score</span>
        <span className="font-extrabold text-teal-600 dark:text-teal-400">{record.costScore} / 100</span>
      </div>
    </div>
  );
};
