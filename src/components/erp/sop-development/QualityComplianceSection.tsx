import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, Award } from "lucide-react";
import type { SopFormInput } from "@/services/types";

export function QualityComplianceSection({
  form,
}: {
  form: UseFormReturn<SopFormInput>;
}) {
  const { watch } = form;

  const complianceScore = watch("complianceScore") ?? 90;

  const standards = watch("applicableStandards") || ["ISO 9001:2015", "ISO 14001:2015", "IATF 16949"];
  const regulations = watch("regulatoryRequirements") || ["Factories Act", "OSHA Compliance", "BIS Standards"];
  const policies = watch("internalPolicies") || ["Quality Policy", "EHS Policy", "Cleanroom Protocol"];
  const checklist = watch("complianceChecklist") || [
    "ISO 9001:2015 Process Control Clause 8.5 ✓",
    "OSHA Workplace Safety Standard Verified ✓",
    "Cleanroom Class 10,000 Certification ✓",
    "Environmental Emission Compliance ✓",
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              4
            </span>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              Quality & Regulatory Compliance Audit
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            ISO standards verification, regulatory rules, internal quality policies & compliance checklist.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400 block tracking-wider">
              Compliance Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 font-mono">
                {complianceScore}
              </span>
              <span className="text-xs text-blue-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block">Applicable ISO Standards</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {standards.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block">Regulatory Rules</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {regulations.map((r, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-foreground text-[10px] font-semibold">
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-foreground block">Internal Policies</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {policies.map((p, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-bold text-foreground block">Compliance Audit Checklist</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {checklist.map((chk, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-foreground">{chk}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
