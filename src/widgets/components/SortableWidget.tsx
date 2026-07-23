import { useCallback, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWidgetDef } from "../registry";
import { XL_COLUMNS, snapToSize } from "../grid";
import type { WidgetInstance, WidgetPageId } from "../types";
import { WidgetShell } from "./WidgetShell";
import { WidgetContextMenu } from "./WidgetContextMenu";

/* ===========================================================================
   SortableWidget — a draggable + resizable cell (edit mode only)
   =========================================================================== */

export type SortableWidgetProps = {
  instance: WidgetInstance;
  pageId: WidgetPageId;
  onOpenSettings: (instance: WidgetInstance) => void;
  onDraftChange: (instanceId: string, patch: Partial<WidgetInstance>) => void;
  onDraftRemove: (instanceId: string) => void;
  onDraftDuplicate: (instanceId: string) => void;
};

export function SortableWidget({
  instance,
  pageId,
  onOpenSettings,
  onDraftChange,
  onDraftRemove,
  onDraftDuplicate,
}: SortableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: instance.id,
  });
  const cellRef = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState(false);

  const def = getWidgetDef(instance.widgetId);

  /**
   * Resize handle. dnd-kit does not resize, so this is a small pointer-capture
   * gesture: measure the drag against the row width, then snap to the nearest
   * allowed size preset. Dragging clears any authored spanOverride, since the
   * user's explicit choice should win over the default-layout escape hatch.
   */
  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!def) return;
      e.preventDefault();
      e.stopPropagation();
      const cell = cellRef.current;
      const grid = cell?.parentElement;
      if (!cell || !grid) return;

      const gridWidth = grid.getBoundingClientRect().width;
      const startLeft = cell.getBoundingClientRect().left;
      setResizing(true);
      // Best-effort: throws if the browser doesn't recognize the pointer id.
      // Capture is a nicety here (the move/up listeners are on window), so a
      // failure must not abort the gesture.
      try {
        (e.target as Element).setPointerCapture(e.pointerId);
      } catch {
        /* no-op */
      }

      let latest: WidgetInstance["size"] = instance.size;

      const onMove = (ev: PointerEvent) => {
        const ratio = Math.min(1, Math.max(0.05, (ev.clientX - startLeft) / gridWidth));
        latest = snapToSize(ratio, def.allowedSizes, def);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        setResizing(false);
        if (latest !== instance.size || instance.spanOverride) {
          onDraftChange(instance.id, { size: latest, spanOverride: undefined });
        }
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [def, instance.id, instance.size, instance.spanOverride, onDraftChange],
  );

  if (!def) return null;
  const Content = def.component;

  return (
    <WidgetContextMenu
      instance={instance}
      pageId={pageId}
      onOpenSettings={onOpenSettings}
      onDraftChange={onDraftChange}
      onDraftRemove={onDraftRemove}
      onDraftDuplicate={onDraftDuplicate}
    >
      <WidgetShell
        instance={instance}
        editing
        pageId={pageId}
        ref={(node: HTMLDivElement | null) => {
          setNodeRef(node);
          cellRef.current = node;
        }}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          zIndex: isDragging ? 40 : undefined,
        }}
        className={cn(
          isDragging && "opacity-40",
          resizing && "ring-2 ring-primary",
          "animate-in fade-in duration-200",
        )}
        overlay={
          <>
            {/* Drag grip. Listeners live here — not on the whole cell — so the
                widget's own buttons and tabs stay usable while editing. */}
            <button
              type="button"
              aria-label={`Move ${def.title}`}
              className="absolute -left-1.5 -top-1.5 z-20 grid h-7 w-7 cursor-grab place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>

            {/* Remove */}
            <button
              type="button"
              aria-label={`Remove ${def.title}`}
              onClick={(e) => {
                e.stopPropagation();
                onDraftRemove(instance.id);
              }}
              className="absolute -right-1.5 -top-1.5 z-20 grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Resize: drag to scrub sizes, click to cycle to the next preset. */}
            <button
              type="button"
              aria-label={`Resize ${def.title}`}
              onPointerDown={handleResizePointerDown}
              className="absolute -bottom-1.5 -right-1.5 z-20 grid h-6 w-6 cursor-nwse-resize place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-primary"
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M9 1v8H1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </>
        }
      >
        {/* Content is inert while editing so a drag never triggers a chart tooltip. */}
        <div className="pointer-events-none">
          <Content instance={instance} size={instance.size} theme={instance.theme} />
        </div>
      </WidgetShell>
    </WidgetContextMenu>
  );
}

export { XL_COLUMNS };
