import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle2, ShieldCheck, ClipboardCheck } from "lucide-react";
import type { JigFormInput } from "@/services/types";
import { toast } from "sonner";

export function JigCommissioningSection({
  form,
}: {
  form: UseFormReturn<JigFormInput>;
}) {
  const { register, watch, setValue } = form;

  const commissioningScore = watch("commissioningScore") ?? 86;

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              5
            </span>
            <CardTitle className="text-base font-bold">Installation & Commissioning</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Shopfloor installation, production line integration, operator training & preventive maintenance schedule.
          </CardDescription>
        </div>

        {/* Score Card Badge */}
        <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-teal-600 dark:text-teal-400 block tracking-wider">
              Commissioning Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-teal-700 dark:text-teal-300 font-mono">
                {commissioningScore}
              </span>
              <span className="text-xs text-teal-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Checkboxes List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-slate-50/50 dark:bg-slate-800/40 text-xs">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="installationCompleted"
                  checked={watch("installationCompleted") ?? true}
                  onCheckedChange={(v) => setValue("installationCompleted", Boolean(v))}
                />
                <label htmlFor="installationCompleted" className="font-semibold cursor-pointer">
                  Shopfloor Installation Completed
                </label>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Done
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-slate-50/50 dark:bg-slate-800/40 text-xs">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="processIntegration"
                  checked={watch("processIntegration") ?? true}
                  onCheckedChange={(v) => setValue("processIntegration", Boolean(v))}
                />
                <label htmlFor="processIntegration" className="font-semibold cursor-pointer">
                  Production Line Process Integration
                </label>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Integrated
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-slate-50/50 dark:bg-slate-800/40 text-xs">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="operatorTraining"
                  checked={watch("operatorTraining") ?? true}
                  onCheckedChange={(v) => setValue("operatorTraining", Boolean(v))}
                />
                <label htmlFor="operatorTraining" className="font-semibold cursor-pointer">
                  Operator & Technician Training
                </label>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-slate-50/50 dark:bg-slate-800/40 text-xs">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="productionApproval"
                  checked={watch("productionApproval") ?? true}
                  onCheckedChange={(v) => setValue("productionApproval", Boolean(v))}
                />
                <label htmlFor="productionApproval" className="font-semibold cursor-pointer">
                  Final Production Sign-Off Approval
                </label>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Signed Off
              </span>
            </div>
          </div>

          {/* Maintenance & Calibration Files Box */}
          <div className="lg:col-span-5 space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <span className="text-xs font-bold text-foreground block">
              Schedules & Maintenance Protocols
            </span>

            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-border text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="font-semibold block">Maintenance Plan</span>
                  <span className="text-[10px] text-muted-foreground font-mono">maintenance_plan.pdf</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => toast.success("Downloading maintenance plan")}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-border text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <div>
                  <span className="font-semibold block">Calibration Schedule</span>
                  <span className="text-[10px] text-muted-foreground font-mono">calibration_schedule.pdf</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => toast.success("Downloading calibration schedule")}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
