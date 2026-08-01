import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import type { ProcessValidationRecord } from "@/services/types";

interface QualityVerificationTabProps {
  record: ProcessValidationRecord;
}

export const QualityVerificationTab: React.FC<QualityVerificationTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Quality Verification & Defect Rate Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitors incoming, validation, and final quality inspection gates, First Pass Yield (FPY), scrap rates, and rework percentages.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-xs text-muted-foreground font-semibold">Validation Score:</span>
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
            {record.validationScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Inspection Checkpoints</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Incoming Inspection</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Validation Inspection</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Final Inspection</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border text-center space-y-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">First Pass Yield (FPY)</span>
          <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{record.fpy}%</span>
          <span className="text-[10px] text-muted-foreground font-bold block">1,487 / 1,500 Conforming Parts</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border text-center space-y-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">Defect Rate</span>
          <span className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">{record.defectRate}%</span>
          <span className="text-[10px] text-muted-foreground font-bold block">Target Defect Rate &lt; 1.5%</span>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border">Scrap & Rework Tracking</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Scrap Rate</span>
              <span className="font-mono font-bold text-foreground">{record.scrapRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Rework Rate</span>
              <span className="font-mono font-bold text-foreground">{record.reworkRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
