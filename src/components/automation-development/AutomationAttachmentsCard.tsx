import React, { useState, useRef } from "react";
import { FileText, Download, Link2, Upload, X } from "lucide-react";
import type { AttachmentItem } from "@/lib/automation-development/types";
import { toast } from "sonner";

interface AutomationAttachmentsCardProps {
  attachments: AttachmentItem[];
  onUploadAttachment?: (file: File) => void;
}

export const AutomationAttachmentsCard: React.FC<AutomationAttachmentsCardProps> = ({
  attachments,
  onUploadAttachment,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <>
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
            const isInline = item.source.startsWith("inline");
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded bg-muted/40 hover:bg-muted/70 transition-colors border border-border/50"
              >
                <div className="flex items-center gap-2 truncate">
                  {isInline ? (
                    <Link2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-semibold text-foreground truncate block">{item.filename}</span>
                    <span className="text-[10px] text-muted-foreground block">
                      {item.uploadedAt} • {item.fileSize || "3.5 MB"}
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
          <span className="text-[10px] text-muted-foreground">PLC, HMI, Robot, PDF up to 50MB</span>
        </div>

        <div className="border-t border-border pt-2 text-right">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All Attachments →
          </button>
        </div>
      </div>

      {/* Attachments Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                All Enterprise Automation Attachments ({attachments.length})
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1 text-xs">
              {attachments.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-foreground block">{item.filename}</span>
                      <span className="text-[10px] text-muted-foreground">
                        Source: {item.source} • Uploaded: {item.uploadedAt} • Rev {item.revision || 1}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toast.success(`Downloading ${item.filename}...`)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded text-xs flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-input bg-background text-foreground font-semibold text-xs rounded-md hover:bg-accent"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
