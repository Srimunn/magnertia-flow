import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Pin } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";
import { getWidgetDef } from "../registry";
import { PAGE_META, PLACEABLE_PAGES } from "../defaults";
import { useWidgetPreferences } from "../hooks/useWidgetPreferences";
import { effectiveInstances, newInstanceId } from "../hooks/usePageWidgets";
import type { WidgetInstance, WidgetPageId } from "../types";

/* ===========================================================================
   Widget Settings dialog
   ---------------------------------------------------------------------------
   Clicking any KPI box — a placed widget OR a finance page's own KPI card —
   opens this. Its only job is to say "put this on the Dashboard and/or the
   Finance Overview", plus a small pin toggle. Size/theme/preview/favorites were
   removed intentionally to keep it a one-decision dialog.

   The save is ONE optimistic write covering every location change, which is
   what fixes the cross-page sync bug: two separate writes used to race on the
   server, and last-write-wins could drop the "add to Dashboard" change.
   =========================================================================== */

export type WidgetDialogTarget = {
  widgetId: string;
  /** The page the dialog was opened from. */
  originPageId: WidgetPageId;
  /** Set when opened from a placed widget (vs. a native KPI card). */
  instanceId?: string;
};

export type WidgetSettingsDialogProps = {
  target: WidgetDialogTarget | null;
  onClose: () => void;
  /** Edit mode: route the current page's changes to the draft, not storage. */
  onDraftChange?: (instanceId: string, patch: Partial<WidgetInstance>) => void;
  onDraftRemove?: (instanceId: string) => void;
};

type LocationRow = {
  pageId: WidgetPageId;
  label: string;
  present: boolean;
  instanceIds: string[];
};

export function WidgetSettingsDialog({
  target,
  onClose,
  onDraftChange,
  onDraftRemove,
}: WidgetSettingsDialogProps) {
  const { prefs, update } = useWidgetPreferences();
  const def = target ? getWidgetDef(target.widgetId) : undefined;

  /** Dashboard + Overview always; the origin band page too if the widget is
   *  placed there (so it stays removable from where you clicked it). */
  const rows = useMemo<LocationRow[]>(() => {
    if (!target) return [];
    const ids: WidgetPageId[] = [...PLACEABLE_PAGES];
    if (!ids.includes(target.originPageId)) {
      const onOrigin = effectiveInstances(prefs, target.originPageId).some(
        (i) => i.widgetId === target.widgetId,
      );
      if (onOrigin) ids.push(target.originPageId);
    }
    return ids.map((pageId) => {
      const insts = effectiveInstances(prefs, pageId).filter((i) => i.widgetId === target.widgetId);
      return {
        pageId,
        label: PAGE_META[pageId].label,
        present: insts.length > 0,
        instanceIds: insts.map((i) => i.id),
      };
    });
  }, [target, prefs]);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!target) return;
    setChecked(Object.fromEntries(rows.map((r) => [r.pageId, r.present])));
    // Pin reflects the clicked instance, else any existing placement.
    const all = rows.flatMap((r) =>
      effectiveInstances(prefs, r.pageId).filter((i) => i.widgetId === target.widgetId),
    );
    const clicked = target.instanceId ? all.find((i) => i.id === target.instanceId) : undefined;
    setPinned(clicked ? clicked.pinned : (all[0]?.pinned ?? false));
    // Re-seed only when the dialog opens for a different target.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.widgetId, target?.instanceId, target?.originPageId]);

  const handleSave = useCallback(() => {
    if (!target || !def) return;

    // In edit mode, changes to the CURRENT page belong in the draft so Discard
    // still works; everything else is one server write (no cross-page race).
    const editedPage = onDraftChange ? target.originPageId : null;

    update((current) => {
      let changed = false;
      const pages = { ...current.pages };
      const now = new Date().toISOString();

      for (const row of rows) {
        if (row.pageId === editedPage) continue; // handled via draft below
        const wanted = checked[row.pageId] ?? false;
        const eff = effectiveInstances(current, row.pageId);
        const present = eff.some((i) => i.widgetId === target.widgetId);

        if (wanted && !present) {
          const inst: WidgetInstance = {
            id: newInstanceId(),
            widgetId: target.widgetId,
            size: def.defaultSize,
            theme: "default",
            pinned,
          };
          pages[row.pageId] = {
            instances: pinned ? [inst, ...eff] : [...eff, inst],
            updatedAt: now,
          };
          changed = true;
        } else if (!wanted && present) {
          pages[row.pageId] = {
            instances: eff.filter((i) => i.widgetId !== target.widgetId),
            updatedAt: now,
          };
          changed = true;
        } else if (wanted && present) {
          // Keep placement; just sync the pinned flag.
          const next = eff.map((i) => (i.widgetId === target.widgetId ? { ...i, pinned } : i));
          if (JSON.stringify(next) !== JSON.stringify(eff)) {
            pages[row.pageId] = { instances: next, updatedAt: now };
            changed = true;
          }
        }
      }
      return changed ? { pages } : {};
    });

    // Current page in edit mode → draft callbacks.
    if (editedPage) {
      const row = rows.find((r) => r.pageId === editedPage);
      if (row) {
        const wanted = checked[editedPage] ?? false;
        if (!wanted && row.present) {
          row.instanceIds.forEach((id) => onDraftRemove?.(id));
        } else if (target.instanceId) {
          onDraftChange?.(target.instanceId, { pinned });
        }
      }
    }

    toast.success(`${def.title} updated.`);
    onClose();
  }, [target, def, rows, checked, pinned, onDraftChange, onDraftRemove, update, onClose]);

  if (!target || !def) return null;

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2">
                <def.icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{def.title}</span>
              </DialogTitle>
              <DialogDescription>{def.description}</DialogDescription>
            </div>
            {/* Pin — a single small symbol, per request. */}
            <button
              type="button"
              onClick={() => setPinned((p) => !p)}
              title={pinned ? "Unpin from top" : "Pin to top"}
              aria-pressed={pinned}
              className={cn(
                "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors",
                pinned
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Pin className={cn("h-4 w-4", pinned && "fill-current")} />
            </button>
          </div>
        </DialogHeader>

        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Show this on
          </h4>
          <div className="space-y-1.5">
            {rows.map((row) => (
              <label
                key={row.pageId}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted/30"
              >
                <span className="flex items-center gap-2.5 text-[13px] text-foreground">
                  <Checkbox
                    checked={checked[row.pageId] ?? false}
                    onCheckedChange={(c) =>
                      setChecked((prev) => ({ ...prev, [row.pageId]: Boolean(c) }))
                    }
                  />
                  {row.label}
                </span>
                {row.present ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                    <Check className="h-3 w-3" /> Added
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">Not added</span>
                )}
              </label>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Tick a location to place this widget there, or untick to remove it. Changes apply
            instantly across pages.
          </p>
        </section>

        <DialogFooter>
          <ErpButton variant="outline" onClick={onClose}>
            Cancel
          </ErpButton>
          <ErpButton onClick={handleSave}>Save</ErpButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
