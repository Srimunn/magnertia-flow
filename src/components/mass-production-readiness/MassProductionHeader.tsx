import React from "react";
import {
  ChevronRight,
  Save,
  Eye,
  Send,
  MoreVertical,
  ExternalLink,
  Copy,
  FileText,
  Printer,
  Archive,
  RefreshCw,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MassProductionReadiness } from "@/lib/mass-production-readiness/types";
import { toast } from "sonner";

interface MassProductionHeaderProps {
  record: MassProductionReadiness;
  onSaveDraft: () => void;
  onSubmitForApproval: () => void;
  onDuplicate?: () => void;
  onExportPdf?: () => void;
  onPrint?: () => void;
  onArchive?: () => void;
  onRevalidate?: () => void;
}

export const MassProductionHeader: React.FC<MassProductionHeaderProps> = ({
  record,
  onSaveDraft,
  onSubmitForApproval,
  onDuplicate,
  onExportPdf,
  onPrint,
  onArchive,
  onRevalidate,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Mass Production Authorized":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300";
      case "Minor Improvements Required":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300";
      case "Revalidation Required":
        return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300";
      case "Archived":
        return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300";
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-card text-card-foreground border-b border-border p-4 shadow-sm space-y-4 text-xs">
        {/* Top Bar: Breadcrumb + Title + Header Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="hover:text-foreground cursor-pointer">Development</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="hover:text-foreground cursor-pointer">Manufacturing Development</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-semibold">Mass Production Readiness</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Mass Production Readiness</h1>
            <p className="text-xs text-muted-foreground font-medium">
              Mass Production Readiness · <span className="font-semibold text-foreground">{record.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Draft: Icon-only floppy with tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onSaveDraft}
                  className="p-2 border border-input bg-background hover:bg-accent text-foreground rounded-md shadow-sm transition-colors flex items-center justify-center"
                  aria-label="Save Draft"
                >
                  <Save className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save Draft</p>
              </TooltipContent>
            </Tooltip>

            {/* Preview: Icon-only eye with tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => toast.info("Opening Record Preview...")}
                  className="p-2 border border-input bg-background hover:bg-accent text-foreground rounded-md shadow-sm transition-colors flex items-center justify-center"
                  aria-label="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preview</p>
              </TooltipContent>
            </Tooltip>

            {/* Submit for Approval: Primary blue solid labeled button */}
            <button
              onClick={onSubmitForApproval}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" /> Submit for Approval
            </button>

            {/* Kebab Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 border border-input bg-background hover:bg-accent text-foreground rounded-md shadow-sm transition-colors flex items-center justify-center"
                  aria-label="More Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onDuplicate || (() => toast.info("Record duplicated"))}>
                  <Copy className="w-4 h-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportPdf || (() => toast.info("Exporting PDF report..."))}>
                  <FileText className="w-4 h-4 mr-2" /> Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPrint || (() => window.print())}>
                  <Printer className="w-4 h-4 mr-2" /> Print
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRevalidate || (() => toast.warning("Triggering revalidation reset..."))}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Revalidate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onArchive || (() => toast.warning("Record archived"))}>
                  <Archive className="w-4 h-4 mr-2" /> Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Identity Row (First Grey Band, 6 fields) */}
        <div className="bg-muted/50 p-3 rounded-lg border border-border/60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Readiness ID
            </span>
            <span className="font-extrabold text-foreground">{record.id}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Form Code
            </span>
            <span className="font-bold text-foreground">{record.formCode}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Readiness Title
            </span>
            <span className="font-extrabold text-foreground truncate block" title={record.readinessTitle}>
              {record.readinessTitle}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Readiness Number
            </span>
            <span className="font-bold text-foreground">{record.readinessNumber}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Version
            </span>
            <span className="font-extrabold text-foreground">{record.version}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Workflow Status
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${getStatusColor(
                record.workflowStatus
              )}`}
            >
              {record.workflowStatus}
            </span>
          </div>
        </div>

        {/* Metadata Row (Second Grey Band, 7 fields) */}
        <div className="bg-muted/40 p-3 rounded-lg border border-border/40 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Product
            </span>
            <span className="font-semibold text-foreground">{record.product}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Product Revision
            </span>
            <span className="font-semibold text-foreground">{record.productRevision}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Manufacturing Plant
            </span>
            <span className="font-semibold text-foreground">{record.manufacturingPlant}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Production Line
            </span>
            <span className="font-semibold text-foreground">{record.productionLine}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Pilot Production Ref
            </span>
            <a
              href={`/manufacturing-development/pilot-production/${record.pilotProductionRef}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {record.pilotProductionRef} <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Created Date
            </span>
            <span className="font-medium text-foreground">{record.createdDate}</span>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Last Updated
            </span>
            <span className="font-medium text-foreground">{record.lastUpdated}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
