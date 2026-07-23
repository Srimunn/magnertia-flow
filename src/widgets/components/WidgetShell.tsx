import {
  memo,
  useCallback,
  useState,
  useMemo,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type Ref,
} from "react";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { getWidgetDef } from "../registry";
import { spanStyle } from "../grid";
import type { WidgetInstance, WidgetTheme, WidgetPageId } from "../types";
import { useWidgetPreferences } from "../hooks/useWidgetPreferences";
import { WidgetPreferenceService, WidgetActions, WithinWidgetContext } from "./WidgetCustomizer";
import { toast } from "sonner";

/* ===========================================================================
   WidgetShell — one grid cell
   ---------------------------------------------------------------------------
   Deliberately a TRANSPARENT wrapper: widget content keeps its own `card-soft`
   container (StatCard and every panel already have one), so extracted content
   renders byte-identically to the pre-widget page. The shell only adds the grid
   span, the theme accent, the pin marker, and interaction affordances.

   It spreads extra props and forwards `ref` because Radix's ContextMenuTrigger
   and dnd-kit's useSortable both attach handlers/refs to this element.
   =========================================================================== */

const THEME_RING: Record<WidgetTheme, string> = {
  default: "",
  blue: "ring-2 ring-[var(--widget-accent-blue)]/60",
  green: "ring-2 ring-[var(--widget-accent-green)]/60",
  purple: "ring-2 ring-[var(--widget-accent-purple)]/60",
};

export type WidgetShellProps = ComponentPropsWithoutRef<"div"> & {
  instance: WidgetInstance;
  children: ReactNode;
  /** Opens the Widget Settings dialog. Omit to make the widget non-clickable. */
  onOpenSettings?: (instance: WidgetInstance) => void;
  /** Edit mode suppresses surface clicks — dragging takes over. */
  editing?: boolean;
  /** Extra chrome (drag grip, resize handle) injected by the edit layer. */
  overlay?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  pageId?: WidgetPageId;
};

export const WidgetShell = memo(function WidgetShell({
  instance,
  children,
  onOpenSettings,
  editing = false,
  className,
  style,
  overlay,
  onClick,
  ref,
  pageId,
  ...rest
}: WidgetShellProps) {
  const def = getWidgetDef(instance.widgetId);
  const [hovered, setHovered] = useState(false);

  const { prefs, update } = useWidgetPreferences();

  const isAddedToDashboard = useMemo(() => {
    return WidgetPreferenceService.isAdded(prefs, "dashboard", instance.widgetId);
  }, [prefs, instance.widgetId]);

  const isAddedToOverview = useMemo(() => {
    return WidgetPreferenceService.isAdded(prefs, "finance-overview", instance.widgetId);
  }, [prefs, instance.widgetId]);

  const activePage = useMemo(() => pageId ?? "dashboard", [pageId]);

  const isPinned = useMemo(() => {
    return WidgetPreferenceService.isPinned(prefs, activePage, instance.widgetId);
  }, [prefs, activePage, instance.widgetId]);

  const showBlurToast = (message: string) => {
    toast.success(message, {
      duration: 2000,
      position: "bottom-right",
      className:
        "bg-[#06101e]/85 backdrop-blur-md text-white border border-white/10 shadow-xl rounded-xl p-3 font-sans font-medium",
    });
  };

  const handleToggleDashboard = useCallback(() => {
    const action = WidgetPreferenceService.toggleWidget(
      prefs,
      "dashboard",
      instance.widgetId,
      update,
    );
    showBlurToast(action === "added" ? "✓ Added to Dashboard" : "✓ Removed from Dashboard");
  }, [prefs, instance.widgetId, update]);

  const handleToggleOverview = useCallback(() => {
    const action = WidgetPreferenceService.toggleWidget(
      prefs,
      "finance-overview",
      instance.widgetId,
      update,
    );
    showBlurToast(
      action === "added" ? "✓ Added to Finance Overview" : "✓ Removed from Finance Overview",
    );
  }, [prefs, instance.widgetId, update]);

  const handleTogglePin = useCallback(() => {
    const pinVal = WidgetPreferenceService.togglePin(prefs, activePage, instance.widgetId, update);
    showBlurToast(pinVal ? "✓ Widget Pinned" : "✓ Widget Unpinned");
  }, [prefs, activePage, instance.widgetId, update]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      // Click modal popup trigger removed globally
    },
    [onClick],
  );

  if (!def) return null;

  const borderHoverClass =
    hovered && !editing
      ? "border-[#0A3C75] shadow-md -translate-y-0.5 scale-[1.005]"
      : "border-transparent";

  return (
    <div
      ref={ref}
      data-widget-id={instance.widgetId}
      data-instance-id={instance.id}
      style={{ ...spanStyle(instance, def), ...style }}
      className={cn(
        "relative rounded-xl transition-all duration-150 border group",
        THEME_RING[instance.theme],
        borderHoverClass,
        editing && "widget-grid-editing",
        className,
      )}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...rest}
    >
      {instance.pinned && (
        <span
          title="Pinned"
          className={cn(
            "pointer-events-none absolute -right-1.5 -top-1.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-opacity duration-150",
            hovered && "opacity-0",
          )}
        >
          <Pin className="h-3 w-3" />
        </span>
      )}

      {hovered && !editing && (
        <WidgetActions
          widgetId={instance.widgetId}
          widgetTitle={def.title}
          isPinned={isPinned}
          showInDashboard={isAddedToDashboard}
          showInOverview={isAddedToOverview}
          onToggleDashboard={handleToggleDashboard}
          onToggleOverview={handleToggleOverview}
          onTogglePin={handleTogglePin}
          position="left"
          size={instance.size === "sm" ? "small" : "normal"}
        />
      )}

      {/* Passes the stretched cell height through to the content's own card, so
          cards sharing a row stay equal height exactly as they did before. */}
      <WithinWidgetContext.Provider value={true}>
        <div className="h-full [&>*]:h-full">{children}</div>
      </WithinWidgetContext.Provider>
      {overlay}
    </div>
  );
});
