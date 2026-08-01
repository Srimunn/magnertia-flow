import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, Award } from "lucide-react";
import type { WorkInstructionFormInput } from "@/services/types";

export function TrainingCompetencySection({
  form,
}: {
  form: UseFormReturn<WorkInstructionFormInput>;
}) {
  const { watch } = form;

  const competencyScore = watch("competencyScore") ?? 84;

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              6
            </span>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-purple-600" />
              Operator Training & Competency Framework
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Operator skill levels, certification requirements, authorized operator count & training materials.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-purple-600 dark:text-purple-400 block tracking-wider">
              Competency Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                {competencyScore}
              </span>
              <span className="text-xs text-purple-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block">Training Mandatory</span>
            <span className="text-sm font-bold text-primary">Yes ✓</span>
            <span className="text-[10px] text-muted-foreground block">Pre-operation qualification</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block">Skill Level</span>
            <span className="text-sm font-bold text-foreground font-mono">
              {watch("skillLevel") || "Intermediate"}
            </span>
            <span className="text-[10px] text-muted-foreground block">Level 2 Operator</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block">Authorized Operators</span>
            <span className="text-sm font-bold text-emerald-600 font-mono">
              {watch("authorizedOperators") ?? 12} Operators
            </span>
            <span className="text-[10px] text-muted-foreground block">Certified on WS-ACCU-01</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block">Certification</span>
            <span className="text-sm font-bold text-purple-600">Required ✓</span>
            <span className="text-[10px] text-muted-foreground block">Annual Re-certification</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
