import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GitCommit,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  ArrowDown,
  Layers,
} from "lucide-react";

interface SmartFactoryWorkflowStepperProps {
  currentStage?: string;
}

export const SmartFactoryWorkflowStepper: React.FC<SmartFactoryWorkflowStepperProps> = ({
  currentStage = "Development",
}) => {
  const stages = [
    { id: 1, name: "Business Vision", desc: "Define factory vision & ROI objectives" },
    { id: 2, name: "Industry 4.0 Assessment", desc: "Evaluate maturity level & readiness" },
    { id: 3, name: "Digital Infrastructure Design", desc: "Ethernet, 5G, Edge & Cloud setup" },
    { id: 4, name: "System Integration", desc: "ERP, MES, PLC, SCADA, Robotics, IIoT, Digital Twin" },
    { id: 5, name: "Smart Production Deployment", desc: "Autonomous lines, AMR/AGV, AI vision" },
    { id: 6, name: "Testing & Validation", desc: "FAT, SAT, Cybersecurity, AI validation" },
    { id: 7, name: "Executive Review Board", desc: "Technical & business authorization" },
    { id: 8, name: "Smart Factory Go-Live", desc: "Production release & operational sign-off" },
    { id: 9, name: "Continuous Monitoring & AI", desc: "OEE tracking & AI self-learning" },
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold text-foreground">
              Industry 4.0 Transformation Workflow
            </CardTitle>
          </div>
          <Badge className="bg-primary text-primary-foreground text-xs font-semibold">
            Current Stage: {currentStage}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-9">
          {stages.map((st, idx) => {
            const isPassed = st.id <= 4;
            const isCurrent = st.id === 5;
            return (
              <div
                key={st.id}
                className={`relative flex flex-col justify-between rounded-lg border p-2.5 text-xs transition-all ${
                  isCurrent
                    ? "border-primary bg-primary/10 font-bold text-primary dark:bg-primary/20"
                    : isPassed
                    ? "border-emerald-200 bg-emerald-50/50 text-foreground dark:border-emerald-950 dark:bg-emerald-950/20"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase">Stage {st.id}</span>
                  {isPassed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                  {isCurrent && <Clock className="h-3.5 w-3.5 animate-spin text-primary" />}
                </div>
                <span className="my-1 text-xs font-bold leading-tight text-foreground">{st.name}</span>
                <span className="text-[10px] leading-snug text-muted-foreground">{st.desc}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
