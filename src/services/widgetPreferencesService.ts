import {
  getWidgetPreferencesFn,
  updateWidgetPreferencesFn,
  WIDGETS_CURRENT_USER,
} from "@/lib/widgetPreferencesFns.server";
import type { WidgetPreferencesDoc, WidgetPreferencesPatch } from "@/widgets/types";

/* ===========================================================================
   Widget preferences — client service
   Unwraps the { success, data } | { success, error } envelope the server fns
   return, providing fallbacks when server functions are unavailable on cloud deployments.
   =========================================================================== */

/** Identity the preferences doc is keyed by. Re-exported for query keys. */
export const CURRENT_USER_ID = WIDGETS_CURRENT_USER;

const FALLBACK_PREFS: WidgetPreferencesDoc = {
  _id: `widget_preferences::${CURRENT_USER_ID}`,
  userId: CURRENT_USER_ID,
  role: "CEO",
  pages: {},
  favorites: [],
  recentlyUsed: [],
  templates: [],
  updatedAt: new Date().toISOString(),
};

export async function fetchPreferences(): Promise<WidgetPreferencesDoc> {
  try {
    const res = await getWidgetPreferencesFn();
    if (res && typeof res === "object" && "success" in res && res.success && "data" in res && res.data) {
      return res.data as WidgetPreferencesDoc;
    }
    return FALLBACK_PREFS;
  } catch (err) {
    console.warn("fetchPreferences failed, using fallback preferences:", err);
    return FALLBACK_PREFS;
  }
}

export async function savePreferences(
  patch: WidgetPreferencesPatch,
): Promise<WidgetPreferencesDoc> {
  try {
    const res = await updateWidgetPreferencesFn({ data: patch });
    if (res && typeof res === "object" && "success" in res && res.success && "data" in res && res.data) {
      return res.data as WidgetPreferencesDoc;
    }
    return FALLBACK_PREFS;
  } catch (err) {
    console.warn("savePreferences failed, returning current fallback:", err);
    return FALLBACK_PREFS;
  }
}
