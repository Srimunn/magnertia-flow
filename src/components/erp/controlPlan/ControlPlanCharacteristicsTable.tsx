import React from "react";
import { ArrowRight, Plus } from "lucide-react";
import type { ControlPlanCharacteristic } from "@/services/types";

interface ControlPlanCharacteristicsTableProps {
  characteristics: ControlPlanCharacteristic[];
  onAddCharacteristic?: () => void;
  onViewAll?: () => void;
}

export const ControlPlanCharacteristicsTable: React.FC<ControlPlanCharacteristicsTableProps> = ({
  characteristics,
  onAddCharacteristic,
  onViewAll,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden text-xs">
      <div className="p-3 border-b border-border bg-muted/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground">
            2. Process & Product Characteristics
          </h2>
          <span className="text-xs text-muted-foreground font-normal">
            ({characteristics.length} Operations Defined)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddCharacteristic}
            className="px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Characteristic
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-2 w-12 text-center">Step No.</th>
              <th className="py-2.5 px-3 min-w-[90px]">Operation No.</th>
              <th className="py-2.5 px-3 min-w-[160px]">Process Step / Operation</th>
              <th className="py-2.5 px-3 min-w-[150px]">Product Characteristic</th>
              <th className="py-2.5 px-3 min-w-[150px]">Process Characteristic</th>
              <th className="py-2.5 px-3 min-w-[130px]">Special Characteristics</th>
              <th className="py-2.5 px-3 min-w-[150px]">Specification / Tolerance</th>
              <th className="py-2.5 px-3 min-w-[140px]">Control Method</th>
              <th className="py-2.5 px-3 text-center min-w-[100px]">Readiness Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {characteristics.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-2 text-center font-bold text-muted-foreground">{c.stepNo}</td>
                <td className="py-2.5 px-3 font-bold font-mono text-primary">{c.operationNo}</td>
                <td className="py-2.5 px-3 font-bold text-foreground">{c.processStep}</td>
                <td className="py-2.5 px-3 text-foreground font-medium">{c.productCharacteristic}</td>
                <td className="py-2.5 px-3 text-muted-foreground text-[11px]">{c.processCharacteristic}</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300">
                    {c.specialCharacteristics}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono font-semibold text-foreground">{c.specification}</td>
                <td className="py-2.5 px-3 text-muted-foreground">{c.controlMethod}</td>
                <td className="py-2.5 px-3 text-center font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  {c.readinessScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-muted/30 border-t border-border flex justify-between items-center text-[10px]">
        <span className="text-muted-foreground font-semibold">
          Legend: <span className="text-purple-600 font-mono font-bold">SC-xx</span> Special Characteristics
        </span>

        <button
          onClick={onViewAll}
          className="font-bold text-primary hover:underline flex items-center gap-1"
        >
          View All Characteristics <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
