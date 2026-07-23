import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { getWidgetDef } from "../registry";
import type { WidgetInstance, WidgetPageId } from "../types";
import { SortableWidget } from "./SortableWidget";

/* ===========================================================================
   EditLayer — the ONLY module that imports dnd-kit
   ---------------------------------------------------------------------------
   Loaded lazily, and only once the user enters Edit Mode. That keeps dnd-kit
   out of the server render and out of every normal page load: the static
   WidgetGrid has no drag code at all, so there is no SSR/hydration surface for
   dnd-kit to get wrong and no bundle cost for users who never customize.
   =========================================================================== */

export type EditLayerProps = {
  instances: WidgetInstance[];
  pageId: WidgetPageId;
  onChange: (next: WidgetInstance[]) => void;
  onOpenSettings: (instance: WidgetInstance) => void;
};

export default function EditLayer({ instances, pageId, onChange, onOpenSettings }: EditLayerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    // A small distance threshold means a click on the grip/handles isn't
    // misread as a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = useMemo(() => instances.map((i) => i.id), [instances]);

  const handleDragStart = useCallback((e: DragStartEvent) => setActiveId(String(e.active.id)), []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const from = ids.indexOf(String(active.id));
      const to = ids.indexOf(String(over.id));
      if (from === -1 || to === -1) return;
      // In a flow grid, move / swap / reorder are all one operation: reindex.
      onChange(arrayMove(instances, from, to));
    },
    [ids, instances, onChange],
  );

  const draftPatch = useCallback(
    (instanceId: string, patch: Partial<WidgetInstance>) => {
      onChange(instances.map((i) => (i.id === instanceId ? { ...i, ...patch } : i)));
    },
    [instances, onChange],
  );

  const draftRemove = useCallback(
    (instanceId: string) => onChange(instances.filter((i) => i.id !== instanceId)),
    [instances, onChange],
  );

  const draftDuplicate = useCallback(
    (instanceId: string) => {
      const index = instances.findIndex((i) => i.id === instanceId);
      if (index === -1) return;
      const copy: WidgetInstance = {
        ...instances[index],
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `w-${Date.now()}`,
        pinned: false,
      };
      onChange([...instances.slice(0, index + 1), copy, ...instances.slice(index + 1)]);
    },
    [instances, onChange],
  );

  const activeInstance = activeId ? instances.find((i) => i.id === activeId) : null;
  const activeDef = activeInstance ? getWidgetDef(activeInstance.widgetId) : null;

  return (
    <DndContext
      // Stable id: dnd-kit otherwise generates one that can differ between
      // server and client renders.
      id={`widget-dnd-${pageId}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="widget-grid">
          {instances.map((instance) => (
            <SortableWidget
              key={instance.id}
              instance={instance}
              pageId={pageId}
              onOpenSettings={onOpenSettings}
              onDraftChange={draftPatch}
              onDraftRemove={draftRemove}
              onDraftDuplicate={draftDuplicate}
            />
          ))}
        </div>
      </SortableContext>

      {/* A static placeholder, never a live chart: mounting Recharts inside a
          transformed overlay makes ResponsiveContainer thrash on every frame. */}
      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeDef ? (
          <div className="card-soft flex items-center gap-2.5 px-4 py-3 shadow-[var(--shadow-elevated)]">
            <activeDef.icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate text-[13px] font-semibold text-foreground">
              {activeInstance?.customTitle ?? activeDef.title}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
