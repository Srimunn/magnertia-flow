import { useCallback, useRef, useState } from "react";
import { Check, Copy, Download, LayoutTemplate, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { useWidgetPreferences } from "../hooks/useWidgetPreferences";
import {
  BUILT_IN_TEMPLATES,
  exportTemplateFile,
  parseTemplateFile,
  snapshotTemplate,
  templateToPages,
} from "../templates";
import { ResetConfirmDialog } from "./ResetConfirmDialog";
import type { DashboardTemplate } from "../types";

/* ===========================================================================
   Templates menu — apply / save / duplicate / delete / import / export
   =========================================================================== */

export type TemplatesMenuProps = {
  className?: string;
};

export function TemplatesMenu({ className }: TemplatesMenuProps) {
  const { prefs, update } = useWidgetPreferences();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingApply, setPendingApply] = useState<DashboardTemplate | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DashboardTemplate | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  const all: DashboardTemplate[] = [...BUILT_IN_TEMPLATES, ...prefs.templates];

  const applyTemplate = useCallback(
    (template: DashboardTemplate) => {
      update((current) => ({
        pages: templateToPages(template, current.pages),
        activeTemplateId: template.id,
      }));
      toast.success(`${template.name} applied.`);
    },
    [update],
  );

  const handleSaveCurrent = useCallback(() => {
    const name = saveName.trim();
    if (!name) return;
    const template = snapshotTemplate(name, prefs.pages);
    update((current) => ({ templates: [...current.templates, template] }));
    setSaveOpen(false);
    setSaveName("");
    toast.success(`Template "${name}" saved.`);
  }, [saveName, prefs.pages, update]);

  const handleDuplicate = useCallback(
    (template: DashboardTemplate) => {
      const copy: DashboardTemplate = {
        ...template,
        id: `tpl.user.${Date.now()}`,
        name: `${template.name} (Copy)`,
        builtIn: false,
        createdAt: new Date().toISOString(),
      };
      update((current) => ({ templates: [...current.templates, copy] }));
      toast.success(`Duplicated as "${copy.name}".`);
    },
    [update],
  );

  const handleDelete = useCallback(
    (template: DashboardTemplate) => {
      update((current) => ({ templates: current.templates.filter((t) => t.id !== template.id) }));
      toast.success(`Template "${template.name}" deleted.`);
    },
    [update],
  );

  const handleImportFile = useCallback(
    async (file: File) => {
      try {
        const template = parseTemplateFile(JSON.parse(await file.text()));
        if (!template) {
          toast.error("That file isn't a valid Magnertia template.");
          return;
        }
        update((current) => ({ templates: [...current.templates, template] }));
        toast.success(`Imported "${template.name}".`);
      } catch {
        toast.error("Couldn't read that file.");
      }
    },
    [update],
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-muted/50",
              className,
            )}
          >
            <LayoutTemplate className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Templates</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Built-in
          </DropdownMenuLabel>
          {BUILT_IN_TEMPLATES.map((t) => (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setPendingApply(t)}
              className="flex items-start gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-medium">
                  {t.name}
                  {prefs.activeTemplateId === t.id && <Check className="h-3 w-3 text-success" />}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">{t.description}</div>
              </div>
            </DropdownMenuItem>
          ))}

          {prefs.templates.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
                My Templates
              </DropdownMenuLabel>
              {prefs.templates.map((t) => (
                <div key={t.id} className="flex items-center gap-0.5 px-1">
                  <button
                    onClick={() => setPendingApply(t)}
                    className="min-w-0 flex-1 rounded-sm px-1.5 py-1.5 text-left text-[13px] hover:bg-muted/60"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="truncate">{t.name}</span>
                      {prefs.activeTemplateId === t.id && (
                        <Check className="h-3 w-3 shrink-0 text-success" />
                      )}
                    </span>
                  </button>
                  <button
                    title="Duplicate"
                    onClick={() => handleDuplicate(t)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    title="Export"
                    onClick={() => exportTemplateFile(t)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => setPendingDelete(t)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSaveOpen(true)}>
            <Plus className="mr-2 h-3.5 w-3.5" /> Save current as template…
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-3.5 w-3.5" /> Import template…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file input backing "Import template…" */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
          e.target.value = "";
        }}
      />

      {/* Save-as dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Saves your current customized layouts so you can re-apply them later.
            </DialogDescription>
          </DialogHeader>
          <input
            autoFocus
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveCurrent()}
            placeholder="e.g. My Month-End View"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
          />
          {Object.keys(prefs.pages).length === 0 && (
            <p className="text-[11.5px] text-muted-foreground">
              You haven't customized any pages yet — this would save the default layouts.
            </p>
          )}
          <DialogFooter>
            <ErpButton variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </ErpButton>
            <ErpButton onClick={handleSaveCurrent} disabled={!saveName.trim()}>
              Save Template
            </ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ResetConfirmDialog
        open={pendingApply !== null}
        onOpenChange={(open) => !open && setPendingApply(null)}
        title={`Apply ${pendingApply?.name ?? "template"}?`}
        description={`This replaces your current layout for the pages this template covers (${
          Object.keys(pendingApply?.pages ?? {}).length
        } page(s)). Other pages are left alone.`}
        confirmLabel="Apply Template"
        destructive={false}
        onConfirm={() => {
          if (pendingApply) applyTemplate(pendingApply);
          setPendingApply(null);
        }}
      />

      <ResetConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="This template will be removed. Your current layout isn't affected."
        confirmLabel="Delete"
        onConfirm={() => {
          if (pendingDelete) handleDelete(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </>
  );
}
