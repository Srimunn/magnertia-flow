import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, FileText, Download, Eye, Trash2, History } from "lucide-react";
import type { SopAttachment } from "@/services/types";
import { sopDevelopmentService } from "@/services/sopDevelopmentService";
import { toast } from "sonner";

export function SopAttachmentManager({
  attachments,
  onAttachmentsChange,
}: {
  attachments: SopAttachment[];
  onAttachmentsChange?: (newAtts: SopAttachment[]) => void;
}) {
  const [items, setItems] = useState<SopAttachment[]>(attachments);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedVersionDoc, setSelectedVersionDoc] = useState<SopAttachment | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      const newAtt = await sopDevelopmentService.uploadAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        documentType: "SOP Document",
      });
      const updated = [newAtt, ...items];
      setItems(updated);
      onAttachmentsChange?.(updated);
      toast.success(`Uploaded ${file.name} successfully!`);
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const handleDelete = (id: string) => {
    const updated = items.filter((x) => x.id !== id);
    setItems(updated);
    onAttachmentsChange?.(updated);
    toast.info("SOP Attachment removed");
  };

  return (
    <Card className="border-border/80 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              9
            </span>
            <CardTitle className="text-base font-bold">SOP Documents & Reference Attachments</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Standard operating procedures (SOP), process flow diagrams, work instructions, forms & training decks.
          </CardDescription>
        </div>

        <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1">
          {items.length} Files Attached
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFileUpload(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isDragOver
              ? "border-primary bg-primary/5 dark:bg-primary/20 scale-[0.99]"
              : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/60"
          }`}
        >
          <input
            type="file"
            id="sopFileInput"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <label htmlFor="sopFileInput" className="cursor-pointer flex flex-col items-center justify-center gap-2">
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">
                Drag and drop reference files here, or <span className="text-primary hover:underline">browse</span>
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Supported formats: .pdf, .png, .zip, .xlsx, .docx (Max 150MB)
              </span>
            </div>
          </label>
        </div>

        <div className="rounded-lg border border-border overflow-hidden text-xs">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
            <div className="col-span-4">File Name</div>
            <div className="col-span-3">Document Type</div>
            <div className="col-span-2">Uploaded By</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          <div className="divide-y divide-border/60">
            {items.map((att) => (
              <div
                key={att.id}
                className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="col-span-4 flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-mono text-xs font-semibold text-primary block truncate">
                      {att.fileName}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {att.fileSize} • {att.version}
                    </span>
                  </div>
                </div>

                <div className="col-span-3">
                  <Badge variant="outline" className="text-[10px] bg-slate-100 dark:bg-slate-800">
                    {att.documentType}
                  </Badge>
                </div>

                <div className="col-span-2 text-[11px] text-muted-foreground truncate">
                  {att.uploadedBy}
                </div>

                <div className="col-span-3 flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Version History"
                    onClick={() => setSelectedVersionDoc(att)}
                  >
                    <History className="h-3.5 w-3.5 text-slate-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Preview"
                    onClick={() => toast.info(`Previewing ${att.fileName}`)}
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-blue-600"
                    title="Download"
                    onClick={() => toast.success(`Downloading ${att.fileName}`)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-red-50"
                    title="Delete"
                    onClick={() => handleDelete(att.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Dialog open={Boolean(selectedVersionDoc)} onOpenChange={() => setSelectedVersionDoc(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                SOP File Version History — {selectedVersionDoc?.fileName}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg border border-border bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground block">Version v2.0 (Current Active)</span>
                  <span className="text-[11px] text-muted-foreground">Uploaded by Rahul Sharma on 18 Jun 2024</span>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px]">Active</Badge>
              </div>

              <div className="p-3 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between opacity-75">
                <div>
                  <span className="font-semibold text-foreground block">Version v1.0 (Superseded)</span>
                  <span className="text-[11px] text-muted-foreground">Uploaded by Rahul Sharma on 05 Jun 2024</span>
                </div>
                <Badge variant="outline" className="text-[10px]">Archived</Badge>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedVersionDoc(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
