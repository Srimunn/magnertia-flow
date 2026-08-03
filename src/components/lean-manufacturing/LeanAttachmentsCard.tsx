import React, { useRef } from "react";
import { FileText, Download, Link2, Upload } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import type { AttachmentItem } from "@/lib/lean-manufacturing/types";
import { toast } from "sonner";

interface LeanAttachmentsCardProps {
  attachments: AttachmentItem[];
  onJumpToAttachmentsTab?: () => void;
  onUploadAttachment?: (file: File) => void;
}

export const LeanAttachmentsCard: React.FC<LeanAttachmentsCardProps> = ({
  attachments,
  onJumpToAttachmentsTab,
  onUploadAttachment,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (onUploadAttachment) {
        onUploadAttachment(file);
      } else {
        toast.success(`Uploaded ${file.name}`);
      }
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-card text-card-foreground border border-border rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Attachments Strip
          </h3>
          <span className="text-[10px] text-muted-foreground font-semibold">
            {attachments.length} Files
          </span>
        </div>

        {/* List of Attachments */}
        <div className="space-y-2 text-xs">
          {attachments.slice(0, 6).map((item) => {
            const isAuto = item.source.startsWith("auto:");
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded bg-muted/40 hover:bg-muted/70 transition-colors border border-border/50"
              >
                <div className="flex items-center gap-2 truncate">
                  {isAuto ? (
                    <Link2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-semibold text-foreground truncate block">{item.filename}</span>
                    <span className="text-[10px] text-muted-foreground block">
                      {item.uploadedAt} • {item.fileSize || "2.4 MB"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toast.success(`Downloading ${item.filename}...`)}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                  aria-label={`Download ${item.filename}`}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Upload Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/80 hover:border-primary/60 p-3 rounded-lg text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <span className="text-xs font-semibold text-foreground block">Upload Attachment</span>
          <span className="text-[10px] text-muted-foreground">PDF, ZIP, DOCX up to 25MB</span>
        </div>

        <div className="border-t border-border pt-2 text-right">
          <button
            onClick={onJumpToAttachmentsTab}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All Attachments →
          </button>
        </div>
      </div>
    </TooltipProvider>
  );
};
