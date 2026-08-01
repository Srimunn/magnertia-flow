import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Send, Printer, CheckCircle2, AlertTriangle, Award } from "lucide-react";
import type { FactoryLayoutRecord } from "@/services/types";

export function FactoryActionBar({
  record,
  onSaveDraft,
  onSubmitForReview,
  onExportReport,
  onApprove,
  onRequestRevision,
}: {
  record: FactoryLayoutRecord;
  onSaveDraft?: () => void;
  onSubmitForReview?: () => void;
  onExportReport?: () => void;
  onApprove?: () => void;
  onRequestRevision?: () => void;
}) {
  const readinessScore = record.overallFactoryReadiness ?? 87;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-border/80 shadow-lg px-4 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-xl px-3 py-1.5">
            <Award className="h-5 w-5 text-primary" />
            <div>
              <span className="text-[10px] font-bold text-primary uppercase block tracking-wider leading-none">
                Overall Factory Readiness
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-extrabold text-primary font-mono leading-none">
                  {readinessScore}
                </span>
                <span className="text-[11px] font-bold text-primary/80 font-mono">/100</span>
              </div>
            </div>
          </div>

          <Badge variant="outline" className="hidden md:inline-flex bg-slate-100 dark:bg-slate-800 text-xs">
            Status: {record.workflowStatus}
          </Badge>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            className="gap-1.5 border-border hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
          >
            <Save className="h-4 w-4 text-slate-500" />
            Save Draft
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportReport}
            className="gap-1.5 border-border hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            Export Report
          </Button>

          {record.workflowStatus === "Under Review" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onRequestRevision}
                className="gap-1.5 border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-semibold"
              >
                <AlertTriangle className="h-4 w-4" />
                Request Revision
              </Button>

              <Button
                size="sm"
                onClick={onApprove}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs text-xs font-semibold"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Layout
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={onSubmitForReview}
              className="gap-1.5 bg-primary hover:bg-primary/90 text-white shadow-xs text-xs font-semibold"
            >
              <Send className="h-4 w-4" />
              Submit for Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
