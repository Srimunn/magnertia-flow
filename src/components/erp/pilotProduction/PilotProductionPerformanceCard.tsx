import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { PilotProductionRecord } from "@/services/types";

interface PilotProductionPerformanceCardProps {
  record: PilotProductionRecord;
}

export const PilotProductionPerformanceCard: React.FC<PilotProductionPerformanceCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">5. Process Performance</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
          <div>
            <span className="text-muted-foreground block text-[10px]">Cp</span>
            <span className="font-mono font-black text-foreground text-sm">{record.cp}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">Cpk</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">{record.cpk}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">SPC Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">MSA Status</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[9px]">
              {record.msaStatus}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">Process Stability</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[9px]">
              {record.processStability}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">Control Plan Compliance</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[9px]">
              {record.controlPlanCompliance}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border/40 font-bold mb-2">
          <span className="text-foreground">Performance Score</span>
          <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">{record.performanceScore} / 100</span>
        </div>

        {/* Process Stability Trend Sparkline Simulation */}
        <div className="bg-muted/30 p-2 rounded border border-border/40">
          <span className="text-[9px] text-muted-foreground font-semibold block mb-1">Process Stability Trend</span>
          <div className="flex items-end justify-between h-8 px-1">
            {record.trendHistory.map((t, idx) => (
              <div key={idx} className="flex flex-col items-center gap-0.5">
                <div
                  className="w-2 bg-primary rounded-t transition-all duration-500"
                  style={{ height: `${(t.score / 100) * 28}px` }}
                  title={`${t.date}: ${t.score}`}
                />
                <span className="text-[7px] text-muted-foreground font-mono">{t.date.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
