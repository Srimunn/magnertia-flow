import {
  getWidgetPreferencesFn,
  updateWidgetPreferencesFn,
  WIDGETS_CURRENT_USER,
} from "@/lib/widgetPreferencesFns.server";
import type { WidgetPreferencesDoc, WidgetPreferencesPatch } from "@/widgets/types";

/* ===========================================================================
   Widget preferences — client service
   Unwraps the { success, data } | { success, error } envelope the server fns
   return, so callers get plain data or a thrown Error (which TanStack Query
   surfaces as `error`). Mirrors journalEntryService.ts.
   =========================================================================== */

/** Identity the preferences doc is keyed by. Re-exported for query keys. */
export const CURRENT_USER_ID = WIDGETS_CURRENT_USER;

export async function fetchPreferences(): Promise<WidgetPreferencesDoc> {
  const res = await getWidgetPreferencesFn();
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res as { data: WidgetPreferencesDoc }).data;
}

export async function savePreferences(
  patch: WidgetPreferencesPatch,
): Promise<WidgetPreferencesDoc> {
  const res = await updateWidgetPreferencesFn({ data: patch });
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res as { data: WidgetPreferencesDoc }).data;
}
