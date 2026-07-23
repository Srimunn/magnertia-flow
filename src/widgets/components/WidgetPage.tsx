import { Suspense, lazy, useCallback, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { getWidgetDef, roleAllows } from "../registry";
import { newInstanceId, usePageWidgets } from "../hooks/usePageWidgets";
import { PAGE_META } from "../defaults";
import type { WidgetInstance, WidgetPageId } from "../types";
import { WidgetGrid } from "./WidgetGrid";
import { WidgetSettingsDialog, type WidgetDialogTarget } from "./WidgetSettingsDialog";
import { EditModeToolbar } from "./EditModeToolbar";
import { WidgetLibrarySheet } from "./WidgetLibrarySheet";
import { ResetConfirmDialog } from "./ResetConfirmDialog";
import { TemplatesMenu } from "./TemplatesMenu";
import { RoleSwitcher } from "./RoleSwitcher";

/* ===========================================================================
   WidgetPage — a full widget surface (Dashboard, Finance Overview, bands)
   ---------------------------------------------------------------------------
   Owns the Edit Mode lifecycle:
     enter    -> clone the effective layout into a local draft
     edit     -> drag / resize / add / remove mutate ONLY the draft (instant,
                 no network, fully undoable)
     save     -> one optimistic write
     discard  -> drop the draft
     preview  -> render the draft through the normal, non-editing grid
   =========================================================================== */

// dnd-kit is loaded only when the user actually enters Edit Mode.
const EditLayer = lazy(() => import("./EditLayer"));

export type WidgetPageProps = {
  pageId: WidgetPageId;
  /** The page's existing loading skeleton — reused so loading looks unchanged. */
  skeleton?: ReactNode;
  /** Band mode: render a compact affordance instead of a full toolbar. */
  compact?: boolean;
  /** Rendered when the page has no widgets and isn't being edited. */
  emptyState?: ReactNode;
  className?: string;
};

export function WidgetPage({ pageId, skeleton, emptyState, className }: WidgetPageProps) {
  const {
    prefs,
    role,
    favorites,
    recentlyUsed,
    isLoading,
    instances,
    visibleInstances,
    hiddenByRoleCount,
    isCustomized,
    setInstances,
    toggleFavorite,
    setRole,
    resetPage,
  } = usePageWidgets(pageId);

  const [draft, setDraft] = useState<WidgetInstance[] | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [settingsFor, setSettingsFor] = useState<WidgetDialogTarget | null>(null);
  const [confirm, setConfirm] = useState<null | "discard" | "reset">(null);

  const editing = draft !== null;

  const openSettings = useCallback(
    (instance: WidgetInstance) =>
      setSettingsFor({
        widgetId: instance.widgetId,
        originPageId: pageId,
        instanceId: instance.id,
      }),
    [pageId],
  );

  /** What the grid should render: the draft while editing, else saved state. */
  const shown = useMemo(() => {
    if (!draft) return visibleInstances;
    return draft.filter((i) => {
      if (i.hidden) return false;
      const def = getWidgetDef(i.widgetId);
      return def ? roleAllows(def, role) : false;
    });
  }, [draft, visibleInstances, role]);

  const dirty = useMemo(
    () => (draft ? JSON.stringify(draft) !== JSON.stringify(instances) : false),
    [draft, instances],
  );

  /**
   * The edit grid only ever shows role-visible widgets, so edits come back as a
   * SUBSET of the draft. Writing that subset straight back would silently drop
   * every widget hidden by the current role. Instead, splice the edited
   * instances into the slots the visible ones occupied, leaving hidden widgets
   * untouched at their original positions.
   */
  const handleEditChange = useCallback(
    (next: WidgetInstance[]) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const visibleIds = new Set(shown.map((i) => i.id));
        const incoming = [...next];
        const merged: WidgetInstance[] = [];
        for (const instance of prev) {
          if (visibleIds.has(instance.id)) {
            // Slot previously held a visible widget — fill from the edited list.
            const replacement = incoming.shift();
            if (replacement) merged.push(replacement);
          } else {
            merged.push(instance);
          }
        }
        // Anything added during this edit (library adds, duplicates) is left over.
        return [...merged, ...incoming];
      });
    },
    [shown],
  );

  const enterEdit = useCallback(() => {
    setDraft(instances.map((i) => ({ ...i })));
    setPreviewing(false);
  }, [instances]);

  const handleSave = useCallback(() => {
    if (!draft) return;
    setInstances(draft);
    setDraft(null);
    setPreviewing(false);
    toast.success(`${PAGE_META[pageId].label} layout saved.`);
  }, [draft, setInstances, pageId]);

  const handleDiscard = useCallback(() => {
    if (dirty) {
      setConfirm("discard");
      return;
    }
    setDraft(null);
    setPreviewing(false);
  }, [dirty]);

  const handleExit = useCallback(() => {
    if (dirty) {
      setConfirm("discard");
      return;
    }
    setDraft(null);
    setPreviewing(false);
  }, [dirty]);

  /** Library add — into the draft while editing, else straight to storage. */
  const handleAddFromLibrary = useCallback((widgetId: string) => {
    const def = getWidgetDef(widgetId);
    if (!def) return;
    const instance: WidgetInstance = {
      id: newInstanceId(),
      widgetId,
      size: def.defaultSize,
      theme: "default",
      pinned: false,
    };
    setDraft((prev) => (prev ? [...prev, instance] : prev));
    toast.success(`${def.title} added.`);
  }, []);

  const handleDraftChange = useCallback((instanceId: string, patch: Partial<WidgetInstance>) => {
    setDraft((prev) => prev && prev.map((i) => (i.id === instanceId ? { ...i, ...patch } : i)));
  }, []);

  const handleDraftRemove = useCallback((instanceId: string) => {
    setDraft((prev) => prev && prev.filter((i) => i.id !== instanceId));
  }, []);

  if (isLoading) return <>{skeleton ?? null}</>;

  const showEmpty = !editing && shown.length === 0 && emptyState;

  return (
    <div className={className}>
      <EditModeToolbar
        editing={editing}
        previewing={previewing}
        dirty={dirty}
        isCustomized={isCustomized}
        hiddenByRoleCount={hiddenByRoleCount}
        onEnterEdit={enterEdit}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onTogglePreview={() => setPreviewing((p) => !p)}
        onExit={handleExit}
        onOpenLibrary={() => setLibraryOpen(true)}
        onReset={() => setConfirm("reset")}
        extras={
          <>
            {editing && <RoleSwitcher role={role} onChange={setRole} />}
            <TemplatesMenu />
          </>
        }
      />

      {showEmpty ? (
        emptyState
      ) : editing && !previewing ? (
        <Suspense fallback={<WidgetGrid instances={shown} pageId={pageId} />}>
          <EditLayer
            instances={shown}
            pageId={pageId}
            onChange={handleEditChange}
            onOpenSettings={openSettings}
          />
        </Suspense>
      ) : (
        <WidgetGrid instances={shown} pageId={pageId} onOpenSettings={openSettings} />
      )}

      <WidgetSettingsDialog
        target={settingsFor}
        onClose={() => setSettingsFor(null)}
        onDraftChange={editing ? handleDraftChange : undefined}
        onDraftRemove={editing ? handleDraftRemove : undefined}
      />

      <WidgetLibrarySheet
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        role={role}
        instances={draft ?? instances}
        favorites={favorites}
        recentlyUsed={recentlyUsed}
        onAdd={handleAddFromLibrary}
        onToggleFavorite={toggleFavorite}
        onRoleChange={setRole}
      />

      <ResetConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm === "reset" ? "Restore default layout?" : "Discard changes?"}
        description={
          confirm === "reset"
            ? `This removes your customizations and restores the original ${PAGE_META[pageId].label} layout. This can't be undone.`
            : "Your unsaved layout changes will be lost."
        }
        confirmLabel={confirm === "reset" ? "Restore Default" : "Discard"}
        onConfirm={() => {
          if (confirm === "reset") {
            resetPage();
            setDraft(null);
            toast.success(`${PAGE_META[pageId].label} restored to default.`);
          } else {
            setDraft(null);
            setPreviewing(false);
          }
          setConfirm(null);
        }}
      />
    </div>
  );
}
