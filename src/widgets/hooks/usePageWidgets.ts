import { useCallback, useMemo } from "react";
import { getDefaultLayout } from "../defaults";
import { getWidgetDef, roleAllows } from "../registry";
import type {
  WidgetInstance,
  WidgetPageId,
  WidgetPreferencesDoc,
  WidgetPreferencesPatch,
  WidgetRole,
  WidgetSize,
  WidgetTheme,
} from "../types";
import { useWidgetPreferences } from "./useWidgetPreferences";

/* ===========================================================================
   Page widget state + actions
   ---------------------------------------------------------------------------
   A page's effective layout is `prefs.pages[pageId] ?? DEFAULT_LAYOUTS[pageId]`.
   Every action builds a WHOLE `pages` object from the current cache snapshot —
   never a dot-path patch (see widgetPreferencesFns.server.ts).
   =========================================================================== */

const MAX_RECENT = 8;

export function newInstanceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `w-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Effective instances for a page, honoring saved layout then defaults. */
export function effectiveInstances(
  prefs: WidgetPreferencesDoc,
  pageId: WidgetPageId,
): WidgetInstance[] {
  return prefs.pages[pageId]?.instances ?? getDefaultLayout(pageId);
}

/** Build a `pages` patch that replaces one page's instances. */
function pagesWith(
  prefs: WidgetPreferencesDoc,
  pageId: WidgetPageId,
  instances: WidgetInstance[],
): WidgetPreferencesPatch {
  return {
    pages: {
      ...prefs.pages,
      [pageId]: { instances, updatedAt: new Date().toISOString() },
    },
  };
}

function withRecentlyUsed(prefs: WidgetPreferencesDoc, widgetId: string): string[] {
  return [widgetId, ...prefs.recentlyUsed.filter((id) => id !== widgetId)].slice(0, MAX_RECENT);
}

export type AddWidgetOptions = {
  size?: WidgetSize;
  theme?: WidgetTheme;
  pinned?: boolean;
};

export function usePageWidgets(pageId: WidgetPageId) {
  const { prefs, isLoading, update } = useWidgetPreferences();

  const instances = useMemo(() => effectiveInstances(prefs, pageId), [prefs, pageId]);

  /** Instances the active role may actually see. Non-destructive: hidden-by-role
   *  widgets stay saved so switching roles back restores them. */
  const visibleInstances = useMemo(() => {
    const filtered = instances.filter((instance) => {
      if (instance.hidden) return false;
      const def = getWidgetDef(instance.widgetId);
      if (!def) return false; // unknown widget id (e.g. imported template) — skip
      return roleAllows(def, prefs.role);
    });

    const pinned = filtered.filter((i) => i.pinned);
    const unpinned = filtered.filter((i) => !i.pinned);
    return [...pinned, ...unpinned];
  }, [instances, prefs.role]);

  const hiddenByRoleCount = instances.length - visibleInstances.length;

  /** True once the user has customized this page (drives "Restore Default"). */
  const isCustomized = Boolean(prefs.pages[pageId]);

  /** Replace the whole page layout (used by edit mode's Save Layout). */
  const setInstances = useCallback(
    (next: WidgetInstance[]) => update((current) => pagesWith(current, pageId, next)),
    [update, pageId],
  );

  const addWidget = useCallback(
    (widgetId: string, targetPages: WidgetPageId[], opts: AddWidgetOptions = {}) => {
      update((current) => {
        const def = getWidgetDef(widgetId);
        const pages = { ...current.pages };
        for (const target of targetPages) {
          const existing = effectiveInstances(current, target);
          const instance: WidgetInstance = {
            id: newInstanceId(),
            widgetId,
            size: opts.size ?? def?.defaultSize ?? "md",
            theme: opts.theme ?? "default",
            pinned: opts.pinned ?? false,
          };
          // Pinned widgets sort to the front once, at insert time — the array
          // order stays the single source of truth for ordering.
          const next = instance.pinned ? [instance, ...existing] : [...existing, instance];
          pages[target] = { instances: next, updatedAt: new Date().toISOString() };
        }
        return { pages, recentlyUsed: withRecentlyUsed(current, widgetId) };
      });
    },
    [update],
  );

  const removeInstance = useCallback(
    (instanceId: string, fromPage: WidgetPageId = pageId) => {
      update((current) => {
        const next = effectiveInstances(current, fromPage).filter((i) => i.id !== instanceId);
        return pagesWith(current, fromPage, next);
      });
    },
    [update, pageId],
  );

  /** Remove every placement of a widget type from a page (settings dialog). */
  const removeWidgetFromPage = useCallback(
    (widgetId: string, fromPage: WidgetPageId) => {
      update((current) => {
        const next = effectiveInstances(current, fromPage).filter((i) => i.widgetId !== widgetId);
        return pagesWith(current, fromPage, next);
      });
    },
    [update],
  );

  const updateInstance = useCallback(
    (instanceId: string, patch: Partial<WidgetInstance>, onPage: WidgetPageId = pageId) => {
      update((current) => {
        const next = effectiveInstances(current, onPage).map((i) =>
          // Only the changed instance gets a new reference, so memoized shells
          // for every other widget skip re-rendering.
          i.id === instanceId ? { ...i, ...patch } : i,
        );
        return pagesWith(current, onPage, next);
      });
    },
    [update, pageId],
  );

  const duplicateInstance = useCallback(
    (instanceId: string, onPage: WidgetPageId = pageId) => {
      update((current) => {
        const list = effectiveInstances(current, onPage);
        const index = list.findIndex((i) => i.id === instanceId);
        if (index === -1) return {};
        const copy: WidgetInstance = { ...list[index], id: newInstanceId(), pinned: false };
        const next = [...list.slice(0, index + 1), copy, ...list.slice(index + 1)];
        return pagesWith(current, onPage, next);
      });
    },
    [update, pageId],
  );

  const togglePin = useCallback(
    (instanceId: string, onPage: WidgetPageId = pageId) => {
      update((current) => {
        const list = effectiveInstances(current, onPage);
        const target = list.find((i) => i.id === instanceId);
        if (!target) return {};
        const pinned = !target.pinned;
        const updated = { ...target, pinned };
        const rest = list.filter((i) => i.id !== instanceId);
        // Pinning lifts the widget to the top; unpinning leaves it in place.
        const next = pinned
          ? [updated, ...rest]
          : list.map((i) => (i.id === instanceId ? updated : i));
        return pagesWith(current, onPage, next);
      });
    },
    [update, pageId],
  );

  const toggleFavorite = useCallback(
    (widgetId: string) => {
      update((current) => ({
        favorites: current.favorites.includes(widgetId)
          ? current.favorites.filter((id) => id !== widgetId)
          : [...current.favorites, widgetId],
      }));
    },
    [update],
  );

  /** Simulated access control until real auth exists. */
  const setRole = useCallback((role: WidgetRole) => update(() => ({ role })), [update]);

  /** Delete the saved layout so the page falls back to its default. */
  const resetPage = useCallback(
    (target: WidgetPageId = pageId) => {
      update((current) => {
        const pages = { ...current.pages };
        delete pages[target];
        return { pages };
      });
    },
    [update, pageId],
  );

  return {
    prefs,
    role: prefs.role,
    favorites: prefs.favorites,
    recentlyUsed: prefs.recentlyUsed,
    isLoading,
    instances,
    visibleInstances,
    hiddenByRoleCount,
    isCustomized,
    setInstances,
    addWidget,
    removeInstance,
    removeWidgetFromPage,
    updateInstance,
    duplicateInstance,
    togglePin,
    toggleFavorite,
    setRole,
    resetPage,
  };
}
