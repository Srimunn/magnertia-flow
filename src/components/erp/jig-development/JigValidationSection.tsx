import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, ShieldAlert, Award } from "lucide-react";
import type { JigFormInput } from "@/services/types";

export function JigValidationSection({
  form,
}: {
  form: UseFormReturn<JigFormInput>;
}) {
  const { register, watch, setValue } = form;

  const validationScore = watch("validationScore") ?? 87;

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              4
            </span>
            <CardTitle className="text-base font-bold">Jig Validation & Quality Trial</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Trial run verification, dimensional inspection accuracy, repeatability & process capability (Cp/Cpk).
          </CardDescription>
        </div>

        {/* Score Card Badge */}
        <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-purple-600 dark:text-purple-400 block tracking-wider">
              Validation Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                {validationScore}
              </span>
              <span className="text-xs text-purple-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Verification Checkboxes Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <div className="flex items-center gap-2">
            <Checkbox
              id="trialJigCompleted"
              checked={watch("trialJigCompleted") ?? true}
              onCheckedChange={(v) => setValue("trialJigCompleted", Boolean(v))}
            />
            <label htmlFor="trialJigCompleted" className="font-semibold cursor-pointer">
              Trial Jig Completed ✓
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="dimensionalInspection"
              checked={watch("dimensionalInspection") ?? true}
              onCheckedChange={(v) => setValue("dimensionalInspection", Boolean(v))}
            />
            <label htmlFor="dimensionalInspection" className="font-semibold cursor-pointer">
              Dimensional Inspection Passed ✓
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="safetyValidation"
              checked={watch("safetyValidation") ?? true}
              onCheckedChange={(v) => setValue("safetyValidation", Boolean(v))}
            />
            <label htmlFor="safetyValidation" className="font-semibold cursor-pointer">
              Safety Validation Approved ✓
            </label>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Tool Guidance Accuracy */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Tool Guidance Accuracy (mm)</label>
            <Input
              type="number"
              step="0.001"
              {...register("toolGuidanceAccuracy", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Repeatability Test */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Repeatability Test (mm)</label>
            <Input
              type="number"
              step="0.001"
              {...register("repeatabilityTest", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Process Capability Cp */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Process Capability (Cp)</label>
            <Input
              type="number"
              step="0.01"
              {...register("processCapabilityCp", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Process Capability Cpk */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Process Capability (Cpk)</label>
            <Input
              type="number"
              step="0.01"
              {...register("processCapabilityCpk", { valueAsNumber: true })}
              className="h-9 text-xs font-mono"
            />
          </div>
        </div>

        {/* Remarks */}
        <div className="space-y-1 text-xs">
          <label className="font-semibold text-foreground">Validation Remarks</label>
          <Textarea
            {...register("validationRemarks")}
            rows={2}
            placeholder="Record inspector notes, dimensional deviations, and trial feedback..."
            className="text-xs min-h-[60px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
