import React from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ApqpRecord } from "@/services/types";

interface RiskAssessmentTabProps {
  record: ApqpRecord;
}

export const RiskAssessmentTab: React.FC<RiskAssessmentTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Quality Risk Assessment & CAPA Action Plans
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identifies high-risk product characteristics, critical control gates, corrective actions, and lessons learned.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800">
          <span className="text-xs text-muted-foreground font-semibold">Risk Score:</span>
          <span className="text-sm font-extrabold text-red-600 dark:text-red-400">
            {record.riskReadinessScore} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> High-Risk Characteristics & Control Gates
          </h3>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">High Risk Characteristics</span>
            <p className="font-medium text-foreground mt-1">{record.highRiskCharacteristics}</p>
          </div>
          <div className="pt-2 border-t border-border/40">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Critical Control Points</span>
            <p className="font-medium text-foreground mt-1">{record.criticalControlPoints}</p>
          </div>
          <div className="pt-2 border-t border-border/40">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Open Risks</span>
            <p className="font-medium text-amber-600 dark:text-amber-400 mt-1">{record.openRisks}</p>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border space-y-3">
          <h3 className="font-bold text-foreground pb-2 border-b border-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Corrective & Preventive Actions (CAPA)
          </h3>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Corrective Actions</span>
            <p className="font-medium text-foreground mt-1">{record.correctiveActions}</p>
          </div>
          <div className="pt-2 border-t border-border/40">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Preventive Actions</span>
            <p className="font-medium text-foreground mt-1">{record.preventiveActions}</p>
          </div>
          <div className="pt-2 border-t border-border/40">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Lessons Learned</span>
            <p className="font-medium text-foreground mt-1 italic">"{record.lessonsLearned}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};
