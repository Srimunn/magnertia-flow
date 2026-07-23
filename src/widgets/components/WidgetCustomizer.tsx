/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from "react";
import { useRouterState } from "@tanstack/react-router";

// ===========================================================================
// WithinWidgetContext
// ===========================================================================
export const WithinWidgetContext = React.createContext<boolean>(false);
import { toast } from "sonner";
import { LayoutDashboard, Layers3, Pin, Check, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWidgetPreferences } from "../hooks/useWidgetPreferences";
import { getWidgetDef, WIDGET_LIST } from "../registry";
import { getDefaultLayout } from "../defaults";
import { newInstanceId } from "../hooks/usePageWidgets";
import type {
  WidgetInstance,
  WidgetPageId,
  WidgetPreferencesDoc,
  WidgetPreferencesPatch,
} from "../types";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { FINANCE_PAGE_KPIS } from "../content/finance/financeKpiMap";

// ===========================================================================
// 1. WidgetPreferenceService
// ===========================================================================
export const WidgetPreferenceService = {
  isAdded(prefs: WidgetPreferencesDoc, pageId: WidgetPageId, widgetId: string): boolean {
    const instances = prefs.pages[pageId]?.instances ?? getDefaultLayout(pageId);
    return instances.some((i) => i.widgetId === widgetId);
  },

  isPinned(prefs: WidgetPreferencesDoc, pageId: WidgetPageId, widgetId: string): boolean {
    const instances = prefs.pages[pageId]?.instances ?? getDefaultLayout(pageId);
    const inst = instances.find((i) => i.widgetId === widgetId);
    return inst ? !!inst.pinned : false;
  },

  toggleWidget(
    prefs: WidgetPreferencesDoc,
    pageId: WidgetPageId,
    widgetId: string,
    update: (reducer: (curr: WidgetPreferencesDoc) => WidgetPreferencesPatch) => void,
  ): "added" | "removed" {
    const instances = prefs.pages[pageId]?.instances ?? getDefaultLayout(pageId);
    const exists = instances.some((i) => i.widgetId === widgetId);

    if (exists) {
      update((current) => {
        const next = (current.pages[pageId]?.instances ?? getDefaultLayout(pageId)).filter(
          (i) => i.widgetId !== widgetId,
        );
        return {
          pages: {
            ...current.pages,
            [pageId]: { instances: next, updatedAt: new Date().toISOString() },
          },
        };
      });
      return "removed";
    } else {
      update((current) => {
        const def = getWidgetDef(widgetId);
        const next = [...(current.pages[pageId]?.instances ?? getDefaultLayout(pageId))];
        const instance: WidgetInstance = {
          id: newInstanceId(),
          widgetId,
          size: def?.defaultSize ?? "sm",
          theme: "default",
          pinned: false,
        };
        next.push(instance);
        return {
          pages: {
            ...current.pages,
            [pageId]: { instances: next, updatedAt: new Date().toISOString() },
          },
        };
      });
      return "added";
    }
  },

  togglePin(
    prefs: WidgetPreferencesDoc,
    pageId: WidgetPageId,
    widgetId: string,
    update: (reducer: (curr: WidgetPreferencesDoc) => WidgetPreferencesPatch) => void,
  ): boolean {
    const instances = prefs.pages[pageId]?.instances ?? getDefaultLayout(pageId);
    const inst = instances.find((i) => i.widgetId === widgetId);

    if (inst) {
      update((current) => {
        const list = current.pages[pageId]?.instances ?? getDefaultLayout(pageId);
        const target = list.find((i) => i.widgetId === widgetId);
        if (!target) return {};
        const pinned = !target.pinned;
        const updated = { ...target, pinned };
        const rest = list.filter((i) => i.widgetId !== widgetId);
        const next = pinned
          ? [updated, ...rest]
          : list.map((i) => (i.widgetId === widgetId ? updated : i));
        return {
          pages: {
            ...current.pages,
            [pageId]: { instances: next, updatedAt: new Date().toISOString() },
          },
        };
      });
      return !inst.pinned;
    } else {
      update((current) => {
        const def = getWidgetDef(widgetId);
        const list = current.pages[pageId]?.instances ?? getDefaultLayout(pageId);
        const instance: WidgetInstance = {
          id: newInstanceId(),
          widgetId,
          size: def?.defaultSize ?? "sm",
          theme: "default",
          pinned: true,
        };
        const next = [instance, ...list];
        return {
          pages: {
            ...current.pages,
            [pageId]: { instances: next, updatedAt: new Date().toISOString() },
          },
        };
      });
      return true;
    }
  },
};

// ===========================================================================
// 2. Custom Hooks
// ===========================================================================
export function getPageIdFromPathname(pathname: string): WidgetPageId | null {
  if (pathname === "/") return "dashboard";
  if (pathname.startsWith("/management/finance/overview")) return "finance-overview";
  if (pathname.startsWith("/management/finance/payables")) return "finance-payables";
  if (pathname.startsWith("/management/finance/receivables")) return "finance-receivables";
  if (pathname.startsWith("/management/finance/cash-bank")) return "finance-cash-bank";
  if (pathname.startsWith("/management/finance/budgeting")) return "finance-budgeting";
  if (pathname.startsWith("/management/finance/cost-centers")) return "finance-cost-centers";
  if (pathname.startsWith("/management/finance/consolidation")) return "finance-consolidation";
  if (pathname.startsWith("/management/finance/profitability")) return "finance-profitability";
  if (pathname.startsWith("/management/finance/tax")) return "finance-tax";
  if (pathname.startsWith("/management/finance/reports")) return "finance-reports";
  if (pathname.startsWith("/management/finance/assets")) return "finance-assets";
  if (pathname.startsWith("/management/finance/audit")) return "finance-audit";
  return null;
}

export function useLongPress(callback: (e: any) => void, threshold = 600) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  const start = useCallback(
    (e: any) => {
      isLongPressActive.current = false;
      timerRef.current = setTimeout(() => {
        isLongPressActive.current = true;
        callback(e);
      }, threshold);
    },
    [callback, threshold],
  );

  const cancel = useCallback((e: any) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
  };
}

// ===========================================================================
// 3. ToolbarButton (Circular Buttons)
// ===========================================================================
type ToolbarButtonProps = {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  tooltipText: string;
  icon: React.ComponentType<{ className?: string; fill?: string }>;
  success: boolean;
  position?: "left" | "right";
  size: "small" | "normal";
};

function ToolbarButton({
  active,
  onClick,
  tooltipText,
  icon: Icon,
  success,
  position,
  size,
}: ToolbarButtonProps) {
  const btnSizeClass = size === "small" ? "h-[22px] w-[22px]" : "h-[28px] w-[28px]";
  const iconSizeClass = size === "small" ? "h-[12px] w-[12px]" : "h-[14px] w-[14px]";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40",
            btnSizeClass,
            success
              ? "bg-emerald-500 text-white scale-105"
              : active
                ? "bg-[#0A3C75] text-white hover:bg-[#0A3C75]/90"
                : "bg-transparent text-gray-500 hover:bg-[#0A3C75] hover:text-white hover:scale-105",
          )}
        >
          {success ? (
            <Check
              className={cn("stroke-[3px] animate-in zoom-in-50 duration-200", iconSizeClass)}
            />
          ) : (
            <Icon
              className={cn("transition-transform duration-200", iconSizeClass)}
              fill={active && Icon !== Pin ? "currentColor" : "none"}
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md z-[70] font-sans font-medium"
      >
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}

// ===========================================================================
// 4. WidgetActions
// ===========================================================================
type WidgetActionsProps = {
  widgetId: string;
  widgetTitle: string;
  widgetType?: string;
  isPinned: boolean;
  showInDashboard: boolean;
  showInOverview: boolean;
  onToggleDashboard: () => void;
  onToggleOverview: () => void;
  onTogglePin: () => void;
  position?: "left" | "right";
  size?: "small" | "normal";
};

export function WidgetActions({
  widgetId,
  widgetTitle,
  widgetType,
  isPinned,
  showInDashboard,
  showInOverview,
  onToggleDashboard,
  onToggleOverview,
  onTogglePin,
  position = "left",
  size = "normal",
}: WidgetActionsProps) {
  const [successType, setSuccessType] = useState<"dashboard" | "overview" | "pin" | null>(null);

  const handleAction = (type: "dashboard" | "overview" | "pin", handler: () => void) => {
    handler();
    setSuccessType(type);
    setTimeout(() => setSuccessType(null), 800);
  };

  // Toolbar layout: a VERTICAL column anchored to the left (or right) edge and
  // centered vertically. The KPI icon fades out on hover (see StatCard), leaving
  // room for the column to sit where the icon was. Small = KPI boxes (22px
  // buttons); normal = larger chart/table widgets (28px buttons).
  const edgeClass =
    size === "small"
      ? position === "right"
        ? "right-1.5"
        : "left-1.5"
      : position === "right"
        ? "right-2"
        : "left-2";
  const slideDir = position === "right" ? "slide-in-from-right-1" : "slide-in-from-left-1";
  const layoutClass = cn(
    "absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-center rounded-full bg-white/70 backdrop-blur-md border border-white/20 shadow-sm animate-in fade-in duration-150 pointer-events-auto",
    size === "small" ? "gap-0.5 p-[2px]" : "gap-1 p-[3px]",
    edgeClass,
    slideDir,
  );

  return (
    <div
      className={layoutClass}
      style={{ animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      {/* Overview Button */}
      <ToolbarButton
        active={showInOverview}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAction("overview", onToggleOverview);
        }}
        tooltipText="Show on Overview"
        icon={Layers3}
        success={successType === "overview"}
        position={position}
        size={size}
      />

      {/* Dashboard Button */}
      <ToolbarButton
        active={showInDashboard}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAction("dashboard", onToggleDashboard);
        }}
        tooltipText="Show on Dashboard"
        icon={LayoutDashboard}
        success={successType === "dashboard"}
        position={position}
        size={size}
      />

      {/* Pin Button */}
      <ToolbarButton
        active={isPinned}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAction("pin", onTogglePin);
        }}
        tooltipText="Pin Widget"
        icon={Pin}
        success={successType === "pin"}
        position={position}
        size={size}
      />
    </div>
  );
}

// ===========================================================================
// 5. KPIWidgetCard
// ===========================================================================
type KPIWidgetCardProps = {
  label: string;
  value: string;
  children: React.ReactNode;
  className?: string;
  actionsPosition?: "left" | "right";
};

export function KPIWidgetCard({
  label,
  value,
  children,
  className,
  actionsPosition = "left",
}: KPIWidgetCardProps) {
  const withinWidget = useContext(WithinWidgetContext);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [hovered, setHovered] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);

  const { prefs, update } = useWidgetPreferences();

  // Resolve widgetId using mapping
  const widgetId = useMemo(() => {
    if (!label) return null;
    const pageId = getPageIdFromPathname(pathname);
    let id = pageId ? FINANCE_PAGE_KPIS[pageId]?.[label] : undefined;

    if (!id) {
      const match = WIDGET_LIST.find(
        (w) =>
          w.title.toLowerCase() === label.toLowerCase() ||
          w.title.toLowerCase().replace(/\s*\(ytd\)/g, "") ===
            label.toLowerCase().replace(/\s*\(ytd\)/g, ""),
      );
      if (match) id = match.id;
    }

    if (!id) {
      for (const pid of Object.keys(FINANCE_PAGE_KPIS)) {
        const kpiMap = FINANCE_PAGE_KPIS[pid as WidgetPageId];
        if (kpiMap && kpiMap[label]) {
          id = kpiMap[label];
          break;
        }
      }
    }

    return id;
  }, [label, pathname]);

  const pageId = useMemo(() => getPageIdFromPathname(pathname), [pathname]);

  // Long press handler for mobile iOS bottom sheet
  const longPressProps = useLongPress(() => {
    if (widgetId) {
      setLongPressActive(true);
    }
  });

  const isAddedToDashboard = useMemo(() => {
    if (!widgetId) return false;
    return WidgetPreferenceService.isAdded(prefs, "dashboard", widgetId);
  }, [prefs, widgetId]);

  const isAddedToOverview = useMemo(() => {
    if (!widgetId) return false;
    return WidgetPreferenceService.isAdded(prefs, "finance-overview", widgetId);
  }, [prefs, widgetId]);

  const isPinned = useMemo(() => {
    if (!widgetId || !pageId) return false;
    return WidgetPreferenceService.isPinned(prefs, pageId, widgetId);
  }, [prefs, pageId, widgetId]);

  const showBlurToast = (message: string) => {
    toast.success(message, {
      duration: 2000,
      position: "bottom-right",
      className:
        "bg-[#06101e]/85 backdrop-blur-md text-white border border-white/10 shadow-xl rounded-xl p-3 font-sans font-medium",
    });
  };

  const handleToggleDashboard = () => {
    if (!widgetId) return;
    const action = WidgetPreferenceService.toggleWidget(prefs, "dashboard", widgetId, update);
    showBlurToast(action === "added" ? "✓ Added to Dashboard" : "✓ Removed from Dashboard");
  };

  const handleToggleOverview = () => {
    if (!widgetId) return;
    const action = WidgetPreferenceService.toggleWidget(
      prefs,
      "finance-overview",
      widgetId,
      update,
    );
    showBlurToast(
      action === "added" ? "✓ Added to Finance Overview" : "✓ Removed from Finance Overview",
    );
  };

  const handleTogglePin = () => {
    if (!widgetId || !pageId) return;
    const pinVal = WidgetPreferenceService.togglePin(prefs, pageId, widgetId, update);
    showBlurToast(pinVal ? "✓ Widget Pinned" : "✓ Widget Unpinned");
  };

  const handleMobileOption = (action: "dashboard" | "overview" | "pin") => {
    if (!widgetId) return;
    setLongPressActive(false);

    if (action === "dashboard") {
      handleToggleDashboard();
    } else if (action === "overview") {
      handleToggleOverview();
    } else if (action === "pin") {
      handleTogglePin();
    }
  };

  // Inside the widget system the WidgetShell already supplies the hover chrome,
  // but the KPI still needs its own white card container (card-soft + padding)
  // so each box reads as a distinct card with margin. Returning bare children
  // here is what made the dashboard KPIs render flat on the page background.
  if (withinWidget) {
    return <div className={cn(className)}>{children}</div>;
  }

  // Border coloring when hovered
  const borderHoverClass =
    hovered && widgetId
      ? "border-[#0A3C75] shadow-md -translate-y-0.5 scale-[1.005]"
      : "border-transparent";

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={(e) => {
          setHovered(false);
          longPressProps.onMouseLeave(e);
        }}
        onTouchStart={longPressProps.onTouchStart}
        onTouchEnd={longPressProps.onTouchEnd}
        onMouseDown={longPressProps.onMouseDown}
        onMouseUp={longPressProps.onMouseUp}
        className={cn(
          "relative border transition-all duration-150 ease-in-out cursor-pointer group",
          borderHoverClass,
          className,
        )}
      >
        {hovered && widgetId && (
          <WidgetActions
            widgetId={widgetId}
            widgetTitle={label}
            isPinned={isPinned}
            showInDashboard={isAddedToDashboard}
            showInOverview={isAddedToOverview}
            onToggleDashboard={handleToggleDashboard}
            onToggleOverview={handleToggleOverview}
            onTogglePin={handleTogglePin}
            position={actionsPosition}
            size="small"
          />
        )}
        {children}
      </div>

      {/* iOS style bottom sheet for mobile long press */}
      {widgetId && (
        <Drawer open={longPressActive} onOpenChange={setLongPressActive}>
          <DrawerContent className="bg-[#FAF9F5] border-t border-gray-200 px-4 pb-6 font-sans">
            <DrawerHeader className="text-center pb-4">
              <DrawerTitle className="text-base font-bold text-gray-800">{label}</DrawerTitle>
              <DrawerDescription className="text-xs text-gray-500">
                Long press actions for {label} ({value})
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex flex-col gap-2">
              {/* Dashboard Option */}
              <button
                onClick={() => handleMobileOption("dashboard")}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 text-[14px] font-semibold py-3 px-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100 cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <LayoutDashboard className="h-4 w-4 text-[#0A3C75]" />
                  {isAddedToDashboard ? "Remove from Dashboard" : "Add to Dashboard"}
                </span>
                {isAddedToDashboard ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <PlusCircle className="h-4 w-4 text-gray-300" />
                )}
              </button>

              {/* Finance Overview Option */}
              <button
                onClick={() => handleMobileOption("overview")}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 text-[14px] font-semibold py-3 px-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100 cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Layers3 className="h-4 w-4 text-[#0A3C75]" />
                  {isAddedToOverview ? "Remove from Overview" : "Add to Finance Overview"}
                </span>
                {isAddedToOverview ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <PlusCircle className="h-4 w-4 text-gray-300" />
                )}
              </button>

              {/* Pin Option */}
              {pageId && (
                <button
                  onClick={() => handleMobileOption("pin")}
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 text-[14px] font-semibold py-3 px-4 rounded-xl flex items-center justify-between shadow-sm border border-gray-100 cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <Pin className="h-4 w-4 text-[#0A3C75]" />
                    {isPinned ? "Unpin Widget" : "Pin Widget"}
                  </span>
                  {isPinned ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <PlusCircle className="h-4 w-4 text-gray-300" />
                  )}
                </button>
              )}
            </div>

            {/* Cancel Button */}
            <DrawerFooter className="pt-4 px-0">
              <DrawerClose asChild>
                <button className="w-full bg-slate-200 hover:bg-slate-300 text-gray-700 text-[14px] font-bold py-3 rounded-xl cursor-pointer">
                  Cancel
                </button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

// ===========================================================================
// 6. WidgetManager
// ===========================================================================
export function WidgetManager({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delayDuration={100}>{children}</TooltipProvider>;
}

// ===========================================================================
// 7. DashboardCustomizer
// ===========================================================================
export function DashboardCustomizer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "text-xs font-semibold text-muted-foreground flex items-center gap-2",
        className,
      )}
    >
      <span>✓ Pinterest Quick Actions Enabled</span>
    </div>
  );
}

// ===========================================================================
// 8. OverviewCustomizer
// ===========================================================================
export function OverviewCustomizer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "text-xs font-semibold text-muted-foreground flex items-center gap-2",
        className,
      )}
    >
      <span>✓ Pinterest Quick Actions Enabled</span>
    </div>
  );
}
