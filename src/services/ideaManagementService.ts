import {
  getIdeaLookupsFn,
  getIdeasFn,
  getIdeaFn,
  saveIdeaDraftFn,
  submitIdeaFn,
  reviewIdeaFn,
  getIdeaDashboardFn,
  getIdeaNotificationsFn,
  markIdeaNotificationReadFn,
} from "@/lib/ideaManagementFns.server";
import type {
  IdeaDashboard,
  IdeaDecision,
  IdeaFormInput,
  IdeaListRow,
  IdeaLookups,
  IdeaNotification,
  IdeaPriority,
  IdeaRecord,
  IdeaStatus,
} from "./types";

// Live, MongoDB-backed Idea Management service (Development → Research &
// Innovation Development). Same envelope-unwrapping pattern as the General
// Ledger module — no mock fallback at this layer; the server fns handle the
// in-memory fallback when MongoDB is unavailable.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchLookups(): Promise<IdeaLookups> {
  return unwrap<IdeaLookups>(await getIdeaLookupsFn());
}

export async function fetchIdeas(): Promise<IdeaListRow[]> {
  return unwrap<IdeaListRow[]>(await getIdeasFn());
}

export async function fetchIdea(id: string): Promise<IdeaRecord> {
  return unwrap<IdeaRecord>(await getIdeaFn({ data: id }));
}

export async function saveIdeaDraft(input: IdeaFormInput, id?: string): Promise<IdeaRecord> {
  return unwrap<IdeaRecord>(await saveIdeaDraftFn({ data: { id, input } }));
}

export async function submitIdea(id: string): Promise<IdeaRecord> {
  return unwrap<IdeaRecord>(await submitIdeaFn({ data: id }));
}

export async function reviewIdea(args: {
  id: string;
  stage: IdeaStatus;
  decision: IdeaDecision;
  comment?: string;
  priority?: IdeaPriority;
  patentFields?: { patentSearchStatus?: string; ipRisk?: string; patentRecommendation?: string };
}): Promise<IdeaRecord> {
  return unwrap<IdeaRecord>(await reviewIdeaFn({ data: args }));
}

export async function fetchDashboard(): Promise<IdeaDashboard> {
  return unwrap<IdeaDashboard>(await getIdeaDashboardFn());
}

export async function fetchNotifications(): Promise<IdeaNotification[]> {
  return unwrap<IdeaNotification[]>(await getIdeaNotificationsFn());
}

export async function markNotificationRead(id: string): Promise<void> {
  await markIdeaNotificationReadFn({ data: { id } });
}
