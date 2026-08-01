import React from "react";
import { Calculator, DollarSign, TrendingDown, ArrowDownRight, CheckCircle2 } from "lucide-react";
import type { BomEngineeringRecord } from "@/services/types";

interface CostEngineeringTabProps {
  record: BomEngineeringRecord;
}

export const CostEngineeringTab: React.FC<CostEngineeringTabProps> = ({
  record,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            BOM Cost Engineering & Margin Optimization
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analyzes raw material costs, manufacturing processing costs, target cost comparisons, and variance reporting.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-950 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800">
          <span className="text-xs text-muted-foreground font-semibold">Cost Score:</span>
          <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
            {record.costScore} / 100
          </span>
        </div>
      </div>

      {/* Primary Cost Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-card p-4 rounded-lg border border-border space-y-1">
          <span className="text-muted-foreground uppercase font-semibold text-[10px]">Material Cost</span>
          <div className="text-xl font-bold font-mono text-foreground">
            ₹{record.materialCost.toLocaleString("en-IN")}.00
          </div>
          <span className="text-[10px] text-muted-foreground">Fabricated & Raw Materials</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-1">
          <span className="text-muted-foreground uppercase font-semibold text-[10px]">Manufacturing Cost</span>
          <div className="text-xl font-bold font-mono text-foreground">
            ₹{record.manufacturingCost.toLocaleString("en-IN")}.00
          </div>
          <span className="text-[10px] text-muted-foreground">Labor, Tooling & Assembly</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-1">
          <span className="text-muted-foreground uppercase font-semibold text-[10px]">Purchased Components</span>
          <div className="text-xl font-bold font-mono text-foreground">
            ₹{record.purchasedComponentCost.toLocaleString("en-IN")}.00
          </div>
          <span className="text-[10px] text-muted-foreground">Off-the-shelf Sub-systems</span>
        </div>

        <div className="bg-card p-4 rounded-lg border-2 border-primary/40 bg-primary/5 space-y-1">
          <span className="text-muted-foreground uppercase font-semibold text-[10px]">Total BOM Cost</span>
          <div className="text-xl font-black font-mono text-primary">
            ₹{record.totalBomCost.toLocaleString("en-IN")}.00
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowDownRight className="w-3 h-3" /> Favorable (-₹14,320.00 vs Target)
          </div>
        </div>
      </div>

      {/* Target Cost Comparison */}
      <div className="bg-card p-4 rounded-lg border border-border text-xs space-y-4">
        <h3 className="font-bold text-foreground pb-2 border-b border-border">
          Target Cost vs Actual BOM Cost Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-muted/40 rounded border border-border/60">
            <span className="text-muted-foreground block font-semibold text-[10px] uppercase">Target Cost Limit</span>
            <span className="text-lg font-bold font-mono text-foreground">₹{record.targetCost.toLocaleString("en-IN")}.00</span>
          </div>

          <div className="p-3 bg-muted/40 rounded border border-border/60">
            <span className="text-muted-foreground block font-semibold text-[10px] uppercase">Actual Calculated BOM Cost</span>
            <span className="text-lg font-bold font-mono text-foreground">₹{record.totalBomCost.toLocaleString("en-IN")}.00</span>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800">
            <span className="text-emerald-700 dark:text-emerald-300 block font-semibold text-[10px] uppercase">Cost Variance</span>
            <span className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              -₹{Math.abs(record.costVariance).toLocaleString("en-IN")}.00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
