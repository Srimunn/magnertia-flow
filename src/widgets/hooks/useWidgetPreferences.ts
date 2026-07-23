import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CURRENT_USER_ID,
  fetchPreferences,
  savePreferences,
} from "@/services/widgetPreferencesService";
import type { WidgetPreferencesDoc, WidgetPreferencesPatch } from "../types";

/* ===========================================================================
   Preferences store
   ---------------------------------------------------------------------------
   TanStack Query IS the store. Every widget surface in the app subscribes to
   this one key, so an optimistic write from (say) the Accounts Payable page
   re-renders the Dashboard and Finance Overview immediately — that's the
   "live synchronization, no refresh" requirement, with no extra provider.
   =========================================================================== */

export const PREFS_KEY = ["widget-preferences", CURRENT_USER_ID] as const;
const SAVE_MUTATION_KEY = ["widget-preferences", "save"] as const;

/** Local fallback used before the first fetch resolves. */
export const EMPTY_PREFS: WidgetPreferencesDoc = {
  _id: `widget_preferences::${CURRENT_USER_ID}`,
  userId: CURRENT_USER_ID,
  role: "CEO",
  pages: {},
  favorites: [],
  recentlyUsed: [],
  templates: [],
  updatedAt: "",
};

export function useWidgetPreferencesQuery() {
  return useQuery({
    queryKey: PREFS_KEY,
    queryFn: fetchPreferences,
    // After the initial load the cache is authoritative: optimistic writes must
    // not be clobbered by a background refetch on window focus.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Optimistic save. Patches carry whole top-level fields (never dot-paths) —
 * see widgetPreferencesFns.server.ts for why.
 */
export function useSavePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: SAVE_MUTATION_KEY,
    mutationFn: (patch: WidgetPreferencesPatch) => savePreferences(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: PREFS_KEY });
      const previous = queryClient.getQueryData<WidgetPreferencesDoc>(PREFS_KEY);
      queryClient.setQueryData<WidgetPreferencesDoc>(PREFS_KEY, (old) => ({
        ...(old ?? EMPTY_PREFS),
        ...patch,
        updatedAt: new Date().toISOString(),
      }));
      return { previous };
    },
    onError: (err, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(PREFS_KEY, context.previous);
      toast.error((err as Error)?.message || "Couldn't save your layout.");
    },
    onSettled: () => {
      // Only refetch once the last in-flight save settles, otherwise a burst of
      // rapid edits would each trigger a refetch that reverts newer local state.
      if (queryClient.isMutating({ mutationKey: SAVE_MUTATION_KEY }) === 1) {
        queryClient.invalidateQueries({ queryKey: PREFS_KEY });
      }
    },
  });
}

/**
 * Read + write access to preferences.
 *
 * `update` takes a reducer over the *current cached* doc, so callers never have
 * to hold a stale snapshot; it returns only the fields that changed.
 */
export function useWidgetPreferences() {
  const queryClient = useQueryClient();
  const query = useWidgetPreferencesQuery();
  const saveMutation = useSavePreferences();

  const prefs = query.data ?? EMPTY_PREFS;

  const update = useCallback(
    (reducer: (current: WidgetPreferencesDoc) => WidgetPreferencesPatch) => {
      const current = queryClient.getQueryData<WidgetPreferencesDoc>(PREFS_KEY) ?? EMPTY_PREFS;
      const patch = reducer(current);
      if (Object.keys(patch).length === 0) return;
      saveMutation.mutate(patch);
    },
    [queryClient, saveMutation],
  );

  return {
    prefs,
    /** True only on the very first load — used to gate first paint. */
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isSaving: saveMutation.isPending,
    update,
  };
}
