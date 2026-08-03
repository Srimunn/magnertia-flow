import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paperclip, Upload, FileText, Download, Eye, CheckCircle, Plus } from "lucide-react";
import type { SmartFactoryAttachment, SmartFactoryDevelopmentRecord } from "@/services/types";

interface SmartFactoryAttachmentsCardProps {
  record: SmartFactoryDevelopmentRecord;
  onUploadAttachment: (file: { name: string; type: string; size: number; documentType: string }) => void;
}

const REQUIRED_ATTACHMENT_SLOTS = [
  "Smart Factory Architecture",
  "Digital Twin Model",
  "Network Diagram",
  "PLC & SCADA Configuration",
  "AI Models",
  "Cybersecurity Assessment",
  "FAT/SAT Reports",
  "SOP Documents",
  "Supporting Documents",
];

export const SmartFactoryAttachmentsCard: React.FC<SmartFactoryAttachmentsCardProps> = ({
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
              9. Attachments ({record.attachments.length} files)
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
            const uploaded = record.attachments.find((a) => a.documentType === slot);
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

        {/* Uploaded Documents List */}
        <div className="divide-y divide-border/60 rounded-lg border border-border">
          {record.attachments.map((att) => (
            <div key={att.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{att.fileName}</span>
                    <Badge variant="outline" className="text-[10px]">
                      v{att.version}
                    </Badge>
                    <span className="text-[10px] font-semibold text-muted-foreground">{att.documentType}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Uploaded by {att.uploadedBy} on {att.uploadedDate} • {att.fileSize}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]" onClick={() => alert(`Previewing ${att.fileName}`)}>
                  <Eye className="h-3 w-3" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px]" onClick={() => alert(`Downloading ${att.fileName}`)}>
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
