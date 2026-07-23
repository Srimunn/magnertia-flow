import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getWidgetDef } from "../registry";
import type { WidgetInstance, WidgetPageId } from "../types";
import { WidgetShell } from "./WidgetShell";
import { WidgetContextMenu } from "./WidgetContextMenu";

/* ===========================================================================
   WidgetGrid — static renderer
   ---------------------------------------------------------------------------
   Intentionally imports NO drag-and-drop code: this is what every user sees on
   a normal (non-editing) page load, so it must stay free of dnd-kit weight.
   The edit layer replaces this only once Edit Mode is entered.
   =========================================================================== */

export type WidgetGridProps = {
  instances: WidgetInstance[];
  pageId: WidgetPageId;
  onOpenSettings?: (instance: WidgetInstance) => void;
  className?: string;
  /** Rendered after the widgets (e.g. the library's "add" placeholder). */
  trailing?: ReactNode;
};

export const WidgetGrid = memo(function WidgetGrid({
  instances,
  pageId,
  onOpenSettings,
  className,
  trailing,
}: WidgetGridProps) {
  return (
    <div className={cn("widget-grid", className)}>
      {instances.map((instance) => {
        const def = getWidgetDef(instance.widgetId);
        if (!def) return null;
        const Content = def.component;
        return (
          <WidgetContextMenu
            key={instance.id}
            instance={instance}
            pageId={pageId}
            onOpenSettings={onOpenSettings ?? (() => {})}
          >
            <WidgetShell instance={instance} onOpenSettings={onOpenSettings} pageId={pageId}>
              <Content instance={instance} size={instance.size} theme={instance.theme} />
            </WidgetShell>
          </WidgetContextMenu>
        );
      })}
      {trailing}
    </div>
  );
});
