import { useCallback, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  Download,
  ExternalLink,
  Pencil,
  Pin,
  PinOff,
  RefreshCw,
  Settings2,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ErpButton } from "@/components/erp/Button";
import { getWidgetDef } from "../registry";
import { usePageWidgets } from "../hooks/usePageWidgets";
import type { WidgetInstance, WidgetPageId } from "../types";

/* ===========================================================================
   Right-click menu — Open, Pin, Favorite, Duplicate, Rename, Export, Refresh,
   Properties, Remove (per spec).
   =========================================================================== */

export type WidgetContextMenuProps = {
  instance: WidgetInstance;
  pageId: WidgetPageId;
  children: ReactNode;
  onOpenSettings: (instance: WidgetInstance) => void;
  /** In edit mode, mutations go to the draft rather than straight to storage. */
  onDraftChange?: (instanceId: string, patch: Partial<WidgetInstance>) => void;
  onDraftRemove?: (instanceId: string) => void;
  onDraftDuplicate?: (instanceId: string) => void;
};

export function WidgetContextMenu({
  instance,
  pageId,
  children,
  onOpenSettings,
  onDraftChange,
  onDraftRemove,
  onDraftDuplicate,
}: WidgetContextMenuProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    favorites,
    togglePin,
    toggleFavorite,
    duplicateInstance,
    removeInstance,
    updateInstance,
  } = usePageWidgets(pageId);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const def = getWidgetDef(instance.widgetId);
  const isFavorite = def ? favorites.includes(def.id) : false;

  const handleRefresh = useCallback(() => {
    if (!def?.dataKey) {
      toast.info("This widget has no live data source.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: def.dataKey });
    toast.success(`${instance.customTitle ?? def.title} refreshed.`);
  }, [def, instance.customTitle, queryClient]);

  /** Export the widget's cached data as JSON — no refetch, no server round-trip. */
  const handleExport = useCallback(() => {
    if (!def) return;
    const data = def.dataKey ? queryClient.getQueryData(def.dataKey) : undefined;
    if (data === undefined) {
      toast.info("No data available to export yet.");
      return;
    }
    const payload = {
      widget: def.id,
      title: instance.customTitle ?? def.title,
      exportedAt: new Date().toISOString(),
      data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${def.id.replace(/\./g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Widget data exported.");
  }, [def, instance.customTitle, queryClient]);

  const handleRenameSave = useCallback(() => {
    const title = renameValue.trim();
    const patch = { customTitle: title || undefined };
    if (onDraftChange) onDraftChange(instance.id, patch);
    else updateInstance(instance.id, patch);
    setRenameOpen(false);
  }, [renameValue, instance.id, onDraftChange, updateInstance]);

  if (!def) return <>{children}</>;

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          {def.sourceRoute && (
            <ContextMenuItem onClick={() => navigate({ to: def.sourceRoute! })}>
              <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open
            </ContextMenuItem>
          )}
          <ContextMenuItem
            onClick={() =>
              onDraftChange
                ? onDraftChange(instance.id, { pinned: !instance.pinned })
                : togglePin(instance.id)
            }
          >
            {instance.pinned ? (
              <>
                <PinOff className="mr-2 h-3.5 w-3.5" /> Unpin
              </>
            ) : (
              <>
                <Pin className="mr-2 h-3.5 w-3.5" /> Pin
              </>
            )}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => toggleFavorite(def.id)}>
            {isFavorite ? (
              <>
                <StarOff className="mr-2 h-3.5 w-3.5" /> Remove Favorite
              </>
            ) : (
              <>
                <Star className="mr-2 h-3.5 w-3.5" /> Favorite
              </>
            )}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              onDraftDuplicate ? onDraftDuplicate(instance.id) : duplicateInstance(instance.id)
            }
          >
            <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              setRenameValue(instance.customTitle ?? def.title);
              setRenameOpen(true);
            }}
          >
            <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={handleExport}>
            <Download className="mr-2 h-3.5 w-3.5" /> Export
          </ContextMenuItem>
          <ContextMenuItem onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onOpenSettings(instance)}>
            <Settings2 className="mr-2 h-3.5 w-3.5" /> Properties
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onClick={() =>
              onDraftRemove ? onDraftRemove(instance.id) : removeInstance(instance.id)
            }
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Widget</DialogTitle>
            <DialogDescription>
              Give this widget a custom title. Leave blank to restore the default.
            </DialogDescription>
          </DialogHeader>
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRenameSave()}
            placeholder={def.title}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground focus:border-primary focus:outline-none"
          />
          <DialogFooter>
            <ErpButton variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </ErpButton>
            <ErpButton onClick={handleRenameSave}>Save</ErpButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
