import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { WorkInstructionFormInput } from "@/services/types";

export function SafetyComplianceSection({
  form,
}: {
  form: UseFormReturn<WorkInstructionFormInput>;
}) {
  const { watch } = form;

  const safetyScore = watch("safetyScore") ?? 90;

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              5
            </span>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Safety, Ergonomics & EHS Compliance
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Occupational hazard identification, Lockout/Tagout protocol, ergonomic workstation setup & regulatory rules.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider">
              Safety Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                {safetyScore}
              </span>
              <span className="text-xs text-emerald-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-500" /> Hazards Identified
            </span>
            <span className="text-xl font-bold font-mono text-amber-600">
              {watch("hazardsIdentified") ?? 3} Potential Risks
            </span>
            <span className="text-[10px] text-muted-foreground block">ESD & High Voltage Testing</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block">Lockout / Tagout (LOTO)</span>
            <span className="text-sm font-bold text-foreground">
              {watch("lockoutTagoutRequired") ? "Mandatory" : "Not Required"}
            </span>
            <span className="text-[10px] text-muted-foreground block font-mono">Standard Operating State</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> EHS Certification
            </span>
            <span className="text-sm font-bold text-emerald-600">EHS Compliant ✓</span>
            <span className="text-[10px] text-muted-foreground block font-mono">ISO 45001 Verified</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-1">
          <span className="font-bold text-foreground block">Ergonomic Assessment</span>
          <p className="text-muted-foreground leading-relaxed text-[11px]">
            {watch("ergonomicAssessment") ||
              "Ergonomic seating & anti-fatigue matting defined for assembly workstation WS-ACCU-01."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
