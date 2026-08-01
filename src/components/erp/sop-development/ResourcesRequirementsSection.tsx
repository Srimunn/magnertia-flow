import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Layers, CheckCircle2, Monitor, FileText } from "lucide-react";
import type { SopFormInput } from "@/services/types";

export function ResourcesRequirementsSection({
  form,
}: {
  form: UseFormReturn<SopFormInput>;
}) {
  const { watch } = form;

  const resources = watch("resources") || [];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
            3
          </span>
          <CardTitle className="text-base font-bold">Resources & System Requirements</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Required machinery, tools, MES/ERP software systems, forms, input/output documents & availability verification.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <span className="font-bold text-foreground block flex items-center gap-1.5 text-xs">
              <Wrench className="h-4 w-4 text-blue-600" /> Required Equipment & Tools
            </span>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              {resources.filter(r => r.category === "Required Equipment" || r.category === "Required Tools").map((r) => (
                <div key={r.id} className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="font-semibold text-foreground">{r.name} ({r.itemCount})</span>
                  <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700">Verified ✓</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <span className="font-bold text-foreground block flex items-center gap-1.5 text-xs">
              <Monitor className="h-4 w-4 text-indigo-600" /> Software Systems & Forms
            </span>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              {resources.filter(r => r.category === "Software Systems" || r.category === "Forms & Templates").map((r) => (
                <div key={r.id} className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="font-semibold text-foreground">{r.name}</span>
                  <Badge variant="outline" className="text-[9px] bg-indigo-50 text-indigo-700">Active</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <span className="font-bold text-foreground block flex items-center gap-1.5 text-xs">
              <FileText className="h-4 w-4 text-emerald-600" /> Input & Output Documents
            </span>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              {resources.filter(r => r.category === "Input Documents" || r.category === "Output Documents").map((r) => (
                <div key={r.id} className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="font-semibold text-foreground">{r.name}</span>
                  <span className="font-mono text-[10px] text-emerald-600 font-bold">Verified</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-foreground block">Complete Resource Verification</span>
              <span className="text-[11px] text-muted-foreground">
                All 8 resource categories verified and ready for Manufacturing SOP-MFG-001 release.
              </span>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white text-xs font-mono">
            100% Verified
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
