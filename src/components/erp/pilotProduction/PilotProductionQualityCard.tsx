import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { PilotProductionRecord } from "@/services/types";

interface PilotProductionQualityCardProps {
  record: PilotProductionRecord;
}

export const PilotProductionQualityCard: React.FC<PilotProductionQualityCardProps> = ({
  record,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 flex flex-col justify-between text-xs">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">4. Quality Verification</h2>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Incoming Quality Inspection</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yes
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">In-Process Inspection</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yes
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Final Inspection</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yes
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Defect Rate</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{record.defectRate}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">First Pass Yield (FPY)</span>
            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{record.fpy}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Scrap Rate</span>
            <span className="font-mono font-bold text-foreground">{record.scrapRate}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold">Rework Rate</span>
            <span className="font-mono font-bold text-foreground">{record.reworkRate}%</span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-border/40 font-bold">
            <span className="text-foreground">Quality Score</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">{record.qualityScore} / 100</span>
          </div>
        </div>
      </div>
    </div>
  );
};
