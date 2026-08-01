import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { WorkInstructionFormInput } from "@/services/types";

export function QualityRequirementsSection({
  form,
}: {
  form: UseFormReturn<WorkInstructionFormInput>;
}) {
  const { watch } = form;

  const qualityScore = watch("qualityScore") ?? 85;

  const inspectionPoints = watch("inspectionPoints") || [
    "Visual PCB placement & orientation",
    "Screw torque 0.8 Nm verification",
    "Wire pull test 50N",
    "LED indicator status test",
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              4
            </span>
            <CardTitle className="text-base font-bold">Quality Requirements & Control Plan</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Inspection checkpoints, acceptance criteria, defect prevention & quality control plan reference.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400 block tracking-wider">
              Quality Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 font-mono">
                {qualityScore}
              </span>
              <span className="text-xs text-blue-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        <div className="space-y-2">
          <span className="font-bold text-foreground block">Inspection Checkpoints</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {inspectionPoints.map((pt, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="font-medium text-foreground">{pt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-1">
          <span className="font-bold text-foreground block">Acceptance Criteria</span>
          <p className="text-muted-foreground leading-relaxed text-[11px]">
            {watch("acceptanceCriteria") ||
              "Zero wire pinching, all 4 LEDs green, screw torque within +/-0.05 Nm tolerance."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
