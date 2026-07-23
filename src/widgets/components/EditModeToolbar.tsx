import { Eye, LayoutGrid, Pencil, RotateCcw, Save, Undo2, X } from "lucide-react";
import { ErpButton } from "@/components/erp/Button";
import { cn } from "@/lib/utils";

/* ===========================================================================
   Edit Mode toolbar
   ---------------------------------------------------------------------------
   Rendered in the page body rather than AppShell's `topbarActions`, because
   that slot is `hidden md:flex` — putting the only entry point there would
   make customization unreachable on mobile.
   =========================================================================== */

export type EditModeToolbarProps = {
  editing: boolean;
  previewing: boolean;
  dirty: boolean;
  isCustomized: boolean;
  hiddenByRoleCount: number;
  onEnterEdit: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onTogglePreview: () => void;
  onExit: () => void;
  onOpenLibrary: () => void;
  onReset: () => void;
  /** Slot for the Templates menu / Role switcher. */
  extras?: React.ReactNode;
  className?: string;
};

export function EditModeToolbar({
  editing,
  previewing,
  dirty,
  isCustomized,
  hiddenByRoleCount,
  onEnterEdit,
  onSave,
  onDiscard,
  onTogglePreview,
  onExit,
  onOpenLibrary,
  onReset,
  extras,
  className,
}: EditModeToolbarProps) {
  /* --- Not editing: a single unobtrusive entry point. --- */
  if (!editing) {
    return (
      <div className={cn("mb-3 flex items-center justify-end gap-2", className)}>
        {extras}
        {isCustomized && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Restore Default</span>
          </button>
        )}
        <ErpButton size="sm" variant="outline" onClick={onEnterEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Edit Dashboard
        </ErpButton>
      </div>
    );
  }

  /* --- Preview: collapse to a single exit affordance. --- */
  if (previewing) {
    return (
      <div
        className={cn(
          "mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2",
          className,
        )}
      >
        <span className="text-[12.5px] font-medium text-primary">
          Previewing your layout — changes aren't saved yet.
        </span>
        <ErpButton size="sm" variant="outline" onClick={onTogglePreview}>
          <Undo2 className="h-3.5 w-3.5" />
          Exit Preview
        </ErpButton>
      </div>
    );
  }

  /* --- Editing. --- */
  return (
    <div
      className={cn(
        "mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[12.5px] font-semibold text-primary">Edit Mode</span>
        <span className="hidden text-[11.5px] text-muted-foreground sm:inline">
          Drag the grip to move · drag the corner to resize · right-click for more
        </span>
        {hiddenByRoleCount > 0 && (
          <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-[oklch(0.45_0.15_75)]">
            {hiddenByRoleCount} hidden for this role
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {extras}
        <ErpButton size="sm" variant="outline" onClick={onOpenLibrary}>
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Widget Library</span>
        </ErpButton>
        <ErpButton size="sm" variant="ghost" onClick={onTogglePreview}>
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </ErpButton>
        <ErpButton size="sm" variant="ghost" onClick={onDiscard} disabled={!dirty}>
          <Undo2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Discard</span>
        </ErpButton>
        <ErpButton size="sm" onClick={onSave} disabled={!dirty}>
          <Save className="h-3.5 w-3.5" />
          Save Layout
        </ErpButton>
        <ErpButton size="sm" variant="ghost" onClick={onExit} aria-label="Exit edit mode">
          <X className="h-3.5 w-3.5" />
        </ErpButton>
      </div>
    </div>
  );
}
