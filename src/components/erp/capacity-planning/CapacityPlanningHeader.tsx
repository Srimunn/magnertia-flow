import {
  Save,
  Send,
  MoreHorizontal,
  Printer,
  Share2,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CapacityPlanningRecord } from "@/services/types";
import { toast } from "sonner";

export function CapacityPlanningHeader({
  record,
  onSaveDraft,
  onSubmitForReview,
  onExportReport,
}: {
  record: CapacityPlanningRecord;
  onSaveDraft?: () => void;
  onSubmitForReview?: () => void;
  onExportReport?: () => void;
}) {
  return (
    <div className="space-y-4 mb-4">
      <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Manufacturing Development
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 text-[11px] font-semibold"
                >
                  {record.workflowStatus}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {record.projectName}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {record.planningVersion}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
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
                size="sm"
                onClick={onSubmitForReview}
                className="gap-1.5 bg-primary hover:bg-primary/90 text-white shadow-xs text-xs font-semibold"
              >
                <Send className="h-4 w-4" />
                Submit for Review
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 border border-border">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onExportReport} className="gap-2 cursor-pointer">
                    <Printer className="h-4 w-4 text-slate-500" />
                    Export PDF / Print
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.success("Shareable link copied to clipboard")}
                    className="gap-2 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4 text-slate-500" />
                    Share Capacity Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => toast.info("Audit log exported")}
                    className="gap-2 cursor-pointer"
                  >
                    <FileCheck className="h-4 w-4 text-slate-500" />
                    Export Audit Trail
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4 text-xs">
            <div>
              <span className="text-muted-foreground block font-medium">Capacity Planning ID</span>
              <span className="font-bold text-foreground font-mono">{record.planningId}</span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Form Code</span>
              <span className="font-semibold text-foreground font-mono">{record.formCode}</span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Capacity Planning Project</span>
              <span className="font-semibold text-foreground truncate block" title={record.projectName}>
                {record.projectName}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Planning Version</span>
              <span className="font-semibold text-foreground font-mono">{record.planningVersion}</span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Workflow Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {record.workflowStatus}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Created On</span>
              <span className="font-semibold text-foreground">{record.createdOn}</span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Manufacturing Plant</span>
              <span className="font-semibold text-primary truncate block">{record.plantName}</span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Business Unit</span>
              <span className="font-semibold text-foreground truncate block">{record.businessUnit}</span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Capacity Planning Engineer</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[9px] font-bold">
                  RS
                </span>
                <span className="font-semibold text-foreground truncate">{record.engineerName}</span>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Planning Period</span>
              <span className="font-semibold text-foreground font-mono">{record.planningPeriod}</span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Development Stage</span>
              <span className="font-semibold text-foreground">{record.developmentStage}</span>
            </div>

            <div>
              <span className="text-muted-foreground block font-medium">Next Review Date</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                {record.nextReviewDate}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
