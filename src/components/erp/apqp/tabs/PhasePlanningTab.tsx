import React from "react";
import { Kanban, CheckCircle2, Clock } from "lucide-react";
import type { ApqpRecord } from "@/services/types";

interface PhasePlanningTabProps {
  record: ApqpRecord;
}

export const PhasePlanningTab: React.FC<PhasePlanningTabProps> = ({ record }) => {
  return (
    <div className="space-y-6 text-xs">
      <div className="bg-card p-4 rounded-lg border border-border flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-foreground">
            5-Phase APQP Program Planning & Gate Execution Matrix
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Follows standard AIAG / VDA 5-phase APQP methodology from Program Planning to Launch and Continuous Improvement.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800">
          <span className="text-xs text-muted-foreground font-semibold">Phase Readiness Score:</span>
          <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
            {record.phaseReadinessScore} / 100
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {record.deliverables.map((d) => (
          <div key={d.phaseNumber} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">
                  {d.phaseNumber}
                </span>
                <span>{d.phaseName}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                d.status === "Completed"
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  : d.status === "In Progress"
                  ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                  : "bg-muted text-muted-foreground"
              }`}>
                {d.status} ({d.completionPercentage}%)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div>
                <span className="text-muted-foreground block text-[10px]">Key Deliverables</span>
                <span className="font-semibold text-foreground">{d.keyDeliverables}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Phase Owner</span>
                <span className="font-semibold text-foreground">{d.owner}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Target Gate Date</span>
                <span className="font-semibold font-mono text-foreground">{d.targetDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
