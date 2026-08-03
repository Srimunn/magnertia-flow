import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Upload, FileText, Download, Eye, CheckCircle } from "lucide-react";
import type { ExcellenceAttachment, ManufacturingExcellenceRecord } from "@/services/types";

interface ExcellenceAttachmentsCardProps {
  record: ManufacturingExcellenceRecord;
  onUploadAttachment: (file: { name: string; type: string; size: number; documentType: string }) => void;
}

const REQUIRED_ATTACHMENT_SLOTS = [
  "Improvement Roadmap",
  "Lean Assessment",
  "Six Sigma Report",
  "OEE Dashboard",
  "AI Analytics Report",
  "ESG Report",
  "Audit Reports",
  "SOP Documents",
  "Supporting Documents",
];

export const ExcellenceAttachmentsCard: React.FC<ExcellenceAttachmentsCardProps> = ({
  record,
  onUploadAttachment,
}) => {
  const [selectedSlot, setSelectedSlot] = useState(REQUIRED_ATTACHMENT_SLOTS[0]);

  const handleSimulatedUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        onUploadAttachment({
          name: file.name,
          type: file.type || "Document",
          size: file.size,
          documentType: selectedSlot,
        });
      }
    };
    input.click();
  };

  const MaicwBadge = ({ type, tooltip }: { type: "M" | "A" | "I" | "C" | "W"; tooltip: string }) => (
    <span
      title={tooltip}
      className="ml-1.5 inline-flex items-center justify-center rounded border border-red-200 bg-red-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
    >
      {type}
    </span>
  );

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-bold text-foreground">
              9. Attachments ({(record?.attachments || []).length} files)
            </CardTitle>
          </div>
          <Button size="sm" onClick={handleSimulatedUpload} className="gap-1.5 text-xs font-semibold">
            <Upload className="h-3.5 w-3.5" />
            Upload File
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Required Document Slots Status Bar */}
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {REQUIRED_ATTACHMENT_SLOTS.map((slot) => {
            const uploaded = (record?.attachments || []).find((a) => a.documentType === slot);
            return (
              <div
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-2 text-xs transition-all ${
                  uploaded
                    ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    : "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${uploaded ? "text-emerald-600" : "text-amber-500"}`} />
                  <span className="font-semibold text-foreground">{slot}</span>
                  <MaicwBadge type="M" tooltip="Mandatory Document" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {uploaded ? uploaded.version : "Pending"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Uploaded Documents Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {(record?.attachments || []).map((att) => (
            <div
              key={att.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-3 shadow-2xs transition-shadow hover:shadow-xs"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 truncate">
                  <span className="block truncate font-bold text-foreground text-xs">{att.fileName}</span>
                  <span className="block text-[10px] text-muted-foreground">{att.documentType} • {att.fileSize}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[10px]">
                <span className="font-medium text-muted-foreground">{att.uploadedDate}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => alert(`Previewing ${att.fileName}`)}>
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => alert(`Downloading ${att.fileName}`)}>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
