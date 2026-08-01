import React from "react";
import { Paperclip, FileText, Download, ArrowRight } from "lucide-react";
import type { ControlPlanRecord } from "@/services/types";

interface ControlPlanAttachmentsRowProps {
  record: ControlPlanRecord;
  onNavigateTab?: (tab: string) => void;
}

export const ControlPlanAttachmentsRow: React.FC<ControlPlanAttachmentsRowProps> = ({
  record,
  onNavigateTab,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-4 text-xs">
      <div className="flex justify-between items-center pb-2.5 border-b border-border mb-3">
        <div className="flex items-center gap-1.5">
          <Paperclip className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-foreground text-xs">Attachments & Controlled Quality Documents</h2>
          <span className="text-[10px] text-muted-foreground font-normal">
            ({record.attachments.length} Controlled Documents)
          </span>
        </div>

        <button
          onClick={() => onNavigateTab?.("attachments")}
          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
        >
          View All Attachments <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {record.attachments.map((att) => (
          <div
            key={att.id}
            className="p-2.5 rounded-lg border border-border/70 bg-muted/20 hover:bg-accent hover:border-accent-foreground/30 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-foreground text-[11px] block truncate" title={att.documentType}>
                  {att.documentType}
                </span>
                <span className="text-[9px] text-muted-foreground block truncate font-mono" title={att.fileName}>
                  {att.fileName}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[9px] text-muted-foreground">
              <span>{att.fileSize}</span>
              <button className="p-0.5 hover:text-primary transition-colors">
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
