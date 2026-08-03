import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Layers } from "lucide-react";

interface ExcellenceWorkflowStepperProps {
  currentStage?: string;
}

export const ExcellenceWorkflowStepper: React.FC<ExcellenceWorkflowStepperProps> = ({
  currentStage = "Implementation",
}) => {
  const stages = [
    { id: 1, name: "Current State Assessment", desc: "Define business objectives & baseline KPIs" },
    { id: 2, name: "Operational Excellence Analysis", desc: "Evaluate OEE, Quality, Cost, Delivery & ESG" },
    { id: 3, name: "Continuous Improvement Planning", desc: "Lean, Six Sigma, TPM, Kaizen & Smart Factory" },
    { id: 4, name: "Implementation & Validation", desc: "Execute initiatives & monitor shop floor telemetry" },
    { id: 5, name: "Review Board & Deployment", desc: "Executive authorization & enterprise deployment" },
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold text-foreground">
              Manufacturing Excellence Workflow Process
            </CardTitle>
          </div>
          <Badge className="bg-primary text-primary-foreground text-xs font-semibold">
            Current Stage: {currentStage}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {stages.map((st) => {
            const isPassed = st.id <= 3;
            const isCurrent = st.id === 4;
            return (
              <div
                key={st.id}
                className={`relative flex flex-col justify-between rounded-lg border p-3 text-xs transition-all ${
                  isCurrent
                    ? "border-primary bg-primary/10 font-bold text-primary dark:bg-primary/20"
                    : isPassed
                    ? "border-emerald-200 bg-emerald-50/50 text-foreground dark:border-emerald-950 dark:bg-emerald-950/20"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase">Stage {st.id}</span>
                  {isPassed && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  {isCurrent && <Clock className="h-4 w-4 animate-spin text-primary" />}
                </div>
                <span className="my-1.5 text-xs font-bold leading-tight text-foreground">{st.name}</span>
                <span className="text-[10px] leading-snug text-muted-foreground">{st.desc}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
