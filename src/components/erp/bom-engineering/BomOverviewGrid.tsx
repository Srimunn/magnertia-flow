import React from "react";
import {
  PieChart,
  DollarSign,
  ShieldCheck,
  Activity,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { BomEngineeringRecord } from "@/services/types";

interface BomOverviewGridProps {
  record: BomEngineeringRecord;
  onNavigateTab?: (tab: string) => void;
}

export const BomOverviewGrid: React.FC<BomOverviewGridProps> = ({
  record,
  onNavigateTab,
}) => {
  const categoryBreakdown = [
    { label: "Purchased Part", count: 52, percentage: 60, color: "#3b82f6" },
    { label: "Sub-Assembly", count: 12, percentage: 14, color: "#10b981" },
    { label: "Raw Material", count: 10, percentage: 12, color: "#f59e0b" },
    { label: "Electronic Component", count: 8, percentage: 9, color: "#8b5cf6" },
    { label: "Others", count: 4, percentage: 5, color: "#64748b" },
  ];

  const topCostlyComponents = [
    { code: "AW-POWER-ELEC", name: "Power Electronics Assembly", cost: 68900 },
    { code: "AW-ROBOT-ARM", name: "Robotic Arm Assembly", cost: 45600 },
    { code: "AW-COIL-TX", name: "Transmitter Coil Assembly", cost: 35800 },
    { code: "AW-EVSE-HSG", name: "EVSE Housing Assembly", cost: 32450 },
    { code: "AW-DOCK-UNIT", name: "Docking Unit Assembly", cost: 28750 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Material & Component Summary */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-2.5 border-b border-border mb-3">
            <PieChart className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold text-foreground">Material & Component Summary</h3>
          </div>

          <div className="space-y-2 text-xs">
            {categoryBreakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-foreground">{item.count}</span>
                  <span className="text-[10px] text-muted-foreground">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-border mt-3 flex justify-between items-center text-xs font-bold">
          <span className="text-muted-foreground">Total Items:</span>
          <span className="text-foreground">{record.totalItemsCount}</span>
        </div>
      </div>

      {/* 2. Top 5 Costly Components */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-2.5 border-b border-border mb-3">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-foreground">Top 5 Costly Components</h3>
          </div>

          <div className="space-y-2 text-xs">
            {topCostlyComponents.map((comp, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-foreground truncate">{comp.code}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{comp.name}</div>
                </div>
                <div className="font-mono font-bold text-foreground shrink-0">
                  ₹{comp.cost.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onNavigateTab?.("cost")}
          className="pt-3 border-t border-border mt-3 text-[11px] font-bold text-primary hover:underline flex items-center justify-between w-full"
        >
          View All Cost Analysis <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Compliance Status */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-2.5 border-b border-border mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-foreground">Compliance Status</h3>
          </div>

          <div className="space-y-2 text-xs">
            {record.complianceChecklist.map((chk, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">{chk.standard}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> {chk.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onNavigateTab?.("quality")}
          className="pt-3 border-t border-border mt-3 text-[11px] font-bold text-primary hover:underline flex items-center justify-between w-full"
        >
          View Compliance Checklist <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. BOM Health Summary */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-2.5 border-b border-border mb-3">
            <Activity className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-bold text-foreground">BOM Health Summary</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Structure Validation</span>
              <span className="font-bold font-mono text-emerald-600">92 / 100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Material Validation</span>
              <span className="font-bold font-mono text-blue-600">88 / 100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Manufacturing Validation</span>
              <span className="font-bold font-mono text-amber-600">90 / 100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Quality Validation</span>
              <span className="font-bold font-mono text-purple-600">86 / 100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cost Validation</span>
              <span className="font-bold font-mono text-teal-600">87 / 100</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border mt-3 flex justify-between items-center text-xs">
          <span className="font-bold text-foreground">Overall Health Score</span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xs border border-emerald-300 dark:border-emerald-800">
            {record.overallReadinessScore} / 100
          </span>
        </div>
      </div>
    </div>
  );
};
