import React from "react";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import type { ApqpRecord } from "@/services/types";

interface ApqpPhaseStepperProps {
  record: ApqpRecord;
}

export const ApqpPhaseStepper: React.FC<ApqpPhaseStepperProps> = ({ record }) => {
  const phases = [
    {
      number: 1,
      name: "Phase 1",
      subtitle: "Plan & Define Program",
      status: "Completed",
      percentage: 100,
    },
    {
      number: 2,
      name: "Phase 2",
      subtitle: "Product Design & Development",
      status: "Completed",
      percentage: 100,
    },
    {
      number: 3,
      name: "Phase 3",
      subtitle: "Process Design & Development",
      status: "In Progress",
      percentage: 65,
    },
    {
      number: 4,
      name: "Phase 4",
      subtitle: "Product & Process Validation",
      status: "Pending",
      percentage: 25,
    },
    {
      number: 5,
      name: "Phase 5",
      subtitle: "Launch & Continuous Improvement",
      status: "Pending",
      percentage: 0,
    },
  ];

  return (
    <div className="bg-card border-b border-border p-4 shadow-sm text-xs">
      <h3 className="font-bold text-foreground mb-3 text-xs">APQP Phase Progress</h3>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {phases.map((p, idx) => {
          const isCompleted = p.status === "Completed";
          const isInProgress = p.status === "In Progress";

          return (
            <div
              key={p.number}
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all relative ${
                isCompleted
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                  : isInProgress
                  ? "bg-blue-50/60 dark:bg-blue-950/40 border-2 border-blue-500 shadow-sm"
                  : "bg-muted/20 border-border"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : isInProgress ? (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                        3
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-muted-foreground/30 text-muted-foreground text-[10px] flex items-center justify-center font-bold">
                        {p.number}
                      </div>
                    )}
                    <span className="text-foreground font-extrabold">{p.name}</span>
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-muted-foreground mt-1 truncate">
                  {p.subtitle}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
                <span className={`text-[10px] font-bold ${
                  isCompleted ? "text-emerald-600 dark:text-emerald-400" : isInProgress ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                }`}>
                  {p.status}
                </span>
                <span className="font-mono font-bold text-foreground text-xs">
                  {p.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
