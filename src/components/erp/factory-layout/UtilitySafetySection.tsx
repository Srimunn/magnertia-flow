import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, FileText, ShieldCheck, Zap } from "lucide-react";
import type { FactoryLayoutFormInput } from "@/services/types";
import { toast } from "sonner";

export function UtilitySafetySection({
  form,
}: {
  form: UseFormReturn<FactoryLayoutFormInput>;
}) {
  const { watch, setValue } = form;

  const utilitySafetyScore = watch("utilitySafetyScore") ?? 88;

  const utilityDocs = [
    { label: "Electrical Distribution Layout", filename: "electrical_layout_v1.2.dwg", size: "5.2 MB" },
    { label: "Compressed Air Layout", filename: "cir_layout_v1.2.dwg", size: "3.8 MB" },
    { label: "Water Distribution Layout", filename: "water_layout_v1.2.dwg", size: "2.9 MB" },
    { label: "Fire Safety Layout", filename: "fire_safety_layout_v1.2.pdf", size: "3.1 MB" },
    { label: "Emergency Exit Plan", filename: "emergency_exit_v1.2.pdf", size: "2.4 MB" },
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              5
            </span>
            <CardTitle className="text-base font-bold">Utilities & Safety Compliance</CardTitle>
          </div>
          <CardDescription className="text-xs">
            High-voltage electrical distribution, pneumatic piping, fire suppression & emergency evacuation planning.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-teal-600 dark:text-teal-400 block tracking-wider">
              Utility & Safety Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-teal-700 dark:text-teal-300 font-mono">
                {utilitySafetyScore}
              </span>
              <span className="text-xs text-teal-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg border border-border/80 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
            <div className="col-span-4">Utility / Safety Drawing</div>
            <div className="col-span-5">Attached Schematic</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          <div className="divide-y divide-border/60 text-xs">
            {utilityDocs.map((doc, idx) => (
              <div
                key={doc.label}
                className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-white dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="col-span-4 font-semibold text-foreground flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[10px]">{idx + 1}.</span>
                  {doc.label}
                </div>

                <div className="col-span-5 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-teal-600 shrink-0" />
                  <span className="font-mono text-xs truncate text-primary font-medium cursor-pointer hover:underline">
                    {doc.filename}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {doc.size}
                  </Badge>
                </div>

                <div className="col-span-3 flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] gap-1 hover:text-primary"
                    onClick={() => toast.info(`Previewing ${doc.filename}`)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] gap-1 hover:text-teal-600"
                    onClick={() => toast.success(`Downloading ${doc.filename}`)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EHS Compliance Banner Checkbox */}
        <div className="p-3.5 border border-emerald-200 dark:border-emerald-800 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Checkbox
              id="ehsCompliance"
              checked={watch("ehsCompliance") ?? true}
              onCheckedChange={(val) => setValue("ehsCompliance", Boolean(val))}
            />
            <label htmlFor="ehsCompliance" className="font-bold text-emerald-800 dark:text-emerald-300 cursor-pointer">
              Environment, Health & Safety (EHS) Compliance Verified ✓
            </label>
          </div>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" /> Certified Safe
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
