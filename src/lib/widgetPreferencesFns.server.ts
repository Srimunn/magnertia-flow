/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import type { WidgetPreferencesDoc, WidgetPreferencesPatch } from "@/widgets/types";

/* ===========================================================================
   Widget preferences — server functions
   ---------------------------------------------------------------------------
   Follows the same contract as the General Ledger server fns:
     - createServerFn({ method }) + identity .validator to pin the input type
     - every handler returns { success: true, data } | { success: false, error }
       and never throws across the RPC boundary
     - mongodb is imported DYNAMICALLY inside each handler. A top-level import
       leaks the driver into the client bundle and crashes it ("Class extends
       value undefined"). This is a hard rule, not a preference.
   =========================================================================== */

/**
 * Stand-in identity until real auth exists. Deliberately declared here rather
 * than imported from generalLedgerFns.server.ts so this module has no coupling
 * to the GL module's lifecycle.
 */
export const WIDGETS_CURRENT_USER = "Priya Sharma";

const docId = (userId: string) => `widget_preferences::${userId}`;

function defaultDoc(userId: string): WidgetPreferencesDoc {
  return {
    _id: docId(userId),
    userId,
    role: "CEO",
    pages: {},
    favorites: [],
    recentlyUsed: [],
    templates: [],
    updatedAt: new Date().toISOString(),
  };
}

/** Normalize a raw Mongo document, tolerating docs written by older versions. */
function shapeDoc(raw: any, userId: string): WidgetPreferencesDoc {
  const fallback = defaultDoc(userId);
  if (!raw) return fallback;
  return {
    _id: String(raw._id ?? fallback._id),
    userId: raw.userId ?? userId,
    role: raw.role ?? fallback.role,
    pages: raw.pages ?? {},
    favorites: Array.isArray(raw.favorites) ? raw.favorites : [],
    recentlyUsed: Array.isArray(raw.recentlyUsed) ? raw.recentlyUsed : [],
    templates: Array.isArray(raw.templates) ? raw.templates : [],
    activeTemplateId: raw.activeTemplateId,
    updatedAt: raw.updatedAt ?? fallback.updatedAt,
  };
}

async function getCollection() {
  const mod = await import("./mongodb.server");
  return mod.getWidgetPreferencesCollection();
}

/** Read the current user's preferences, seeding a default doc on first use. */
export const getWidgetPreferencesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const coll = await getCollection();
    const userId = WIDGETS_CURRENT_USER;
    const existing = await coll.findOne({ _id: docId(userId) as any });

    if (!existing) {
      const seeded = defaultDoc(userId);
      await coll.updateOne({ _id: seeded._id as any }, { $set: seeded }, { upsert: true });
      return { success: true as const, data: seeded };
    }

    return { success: true as const, data: shapeDoc(existing, userId) };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
});

/**
 * Persist a patch of whole top-level fields.
 *
 * Writes must never use dot-paths ($set: { "pages.dashboard": ... }): the mock
 * fallback collection implements $set as Object.assign, which would create a
 * literal "pages.dashboard" key instead of nesting. Callers therefore send the
 * complete replacement value for each field they touch.
 */
export const updateWidgetPreferencesFn = createServerFn({ method: "POST" })
  .validator((d: WidgetPreferencesPatch) => d)
  .handler(async ({ data }) => {
    try {
      const coll = await getCollection();
      const userId = WIDGETS_CURRENT_USER;
      const id = docId(userId);

      const patch: Record<string, unknown> = { updatedAt: new Date().toISOString(), userId };
      if (data.pages !== undefined) patch.pages = data.pages;
      if (data.favorites !== undefined) patch.favorites = data.favorites;
      if (data.recentlyUsed !== undefined) patch.recentlyUsed = data.recentlyUsed;
      if (data.role !== undefined) patch.role = data.role;
      if (data.templates !== undefined) patch.templates = data.templates;
      if (data.activeTemplateId !== undefined) patch.activeTemplateId = data.activeTemplateId;

      await coll.updateOne({ _id: id as any }, { $set: patch }, { upsert: true });

      const updated = await coll.findOne({ _id: id as any });
      return { success: true as const, data: shapeDoc(updated, userId) };
    } catch (err) {
      return { success: false as const, error: (err as Error).message };
    }
  });
