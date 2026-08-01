import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, FileText, CheckCircle2, History, Layers } from "lucide-react";
import type { JigFormInput } from "@/services/types";
import { toast } from "sonner";

export function JigDesignSection({
  form,
}: {
  form: UseFormReturn<JigFormInput>;
}) {
  const { register, watch, setValue } = form;

  const designScore = watch("designReviewScore") ?? 88;

  const designDocuments = [
    { label: "3D CAD Model", filename: "ev_drl_jig_3d.step", type: "CAD", size: "12.4 MB" },
    { label: "Assembly Drawing", filename: "ev_drl_jig_assembly.pdf", type: "PDF", size: "2.6 MB" },
    { label: "Detail Drawings", filename: "ev_drl_jig_details.pdf", type: "PDF", size: "3.1 MB" },
    { label: "Bill of Materials", filename: "ev_drl_jig_bom.xlsx", type: "XLSX", size: "1.2 MB" },
    { label: "Bush Design", filename: "bush_design.pdf", type: "PDF", size: "1.5 MB" },
    { label: "Locator Design", filename: "locator_design.pdf", type: "PDF", size: "1.8 MB" },
    { label: "Clamp Design", filename: "clamp_design.pdf", type: "PDF", size: "1.4 MB" },
    { label: "Material Specification", filename: "aisi_1045_spec.pdf", type: "PDF", size: "2.1 MB" },
  ];

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <CardTitle className="text-base font-bold">Jig Design Specifications</CardTitle>
          </div>
          <CardDescription className="text-xs">
            CAD models, engineering drawings, bushing, locator & clamping specs.
          </CardDescription>
        </div>

        {/* Score Card Badge */}
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2">
          <div>
            <span className="text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400 block tracking-wider">
              Design Review Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 font-mono">
                {designScore}
              </span>
              <span className="text-xs text-blue-500 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Document Specifications Grid Table */}
        <div className="rounded-lg border border-border/80 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
            <div className="col-span-4">Specification Item</div>
            <div className="col-span-5">Attached Document</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          <div className="divide-y divide-border/60 text-xs">
            {designDocuments.map((doc, idx) => (
              <div
                key={doc.label}
                className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-white dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="col-span-4 font-semibold text-foreground flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[10px]">{idx + 1}.</span>
                  {doc.label}
                </div>

                <div className="col-span-5 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600 shrink-0" />
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
                    className="h-7 px-2 text-[11px] gap-1 hover:text-blue-600"
                    onClick={() => toast.success(`Downloading ${doc.filename}`)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
