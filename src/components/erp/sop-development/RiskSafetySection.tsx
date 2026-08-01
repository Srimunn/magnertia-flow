import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, FileText, AlertTriangle } from "lucide-react";
import type { SopFormInput } from "@/services/types";

export function RiskSafetySection({
  form,
}: {
  form: UseFormReturn<SopFormInput>;
}) {
  const { watch } = form;

  const riskScore = watch("riskScore") ?? 82;

  const ehs = watch("ehsRequirements") || ["PPE Required", "Machine Guarding", "Proper Ventilation", "ESD Anti-Static Wristband"];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              5
            </span>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              Risk Assessment & Safety Protocols
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Occupational hazard identification, risk matrix evaluation, emergency response & EHS compliance.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400 block tracking-wider">
              Risk Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 font-mono">
                {riskScore}
              </span>
              <span className="text-xs text-amber-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Risk Level
            </span>
            <Badge className="bg-amber-500 text-white font-bold text-xs">
              {watch("riskLevel") || "Medium Risk"}
            </Badge>
            <span className="text-[10px] text-muted-foreground block">Evaluated via FMEA Risk Matrix</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" /> Risk Report Document
            </span>
            <span className="text-xs font-mono font-bold text-primary truncate block">
              {watch("riskAssessmentReport") || "Risk_Assessment_Report_RA-SOP-001.pdf"}
            </span>
            <span className="text-[10px] text-muted-foreground block font-mono">Signed by EHS Manager</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Emergency Procedure
            </span>
            <span className="text-xs font-semibold text-foreground truncate block">
              {watch("emergencyProcedure") || "Machine Stop, First Aid, Evacuation Route 4"}
            </span>
            <span className="text-[10px] text-muted-foreground block font-mono">OSHA Certified Protocol</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2">
          <span className="font-bold text-foreground block">Mandatory EHS Safety Requirements</span>
          <div className="flex flex-wrap gap-2">
            {ehs.map((req, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                {req}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
