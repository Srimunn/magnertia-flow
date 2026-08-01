import React from "react";
import { FileText, Download, ArrowRight } from "lucide-react";
import type { PfmeaAttachment } from "@/services/types";

interface PfmeaDocumentLinksCardProps {
  attachments: PfmeaAttachment[];
  onViewAll?: () => void;
}

export const PfmeaDocumentLinksCard: React.FC<PfmeaDocumentLinksCardProps> = ({
  attachments,
  onViewAll,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-3.5 text-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-border mb-2.5">
          <h2 className="font-bold text-foreground text-xs">
            Document Links
          </h2>
        </div>

        <div className="space-y-2">
          {attachments.slice(0, 5).map((att) => (
            <div key={att.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-foreground text-[11px] block truncate" title={att.fileName}>
                    {att.fileName}
                  </span>
                  <span className="text-[9px] text-muted-foreground block truncate">
                    {att.documentType} • v{att.version}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] text-muted-foreground">{att.uploadedDate}</span>
                <button className="p-1 text-muted-foreground hover:text-primary transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onViewAll}
        className="mt-3 w-full py-1 text-[11px] font-bold text-primary hover:underline flex items-center justify-center gap-1 transition-colors border border-border rounded bg-muted/20"
      >
        View All Attachments <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
