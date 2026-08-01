import {
  DEFAULT_ASSEMBLY_LINE_RECORD,
  getAssemblyLineFn,
  reviewAssemblyLineFn,
  saveAssemblyLineDraftFn,
  submitAssemblyLineFn,
} from "@/lib/assemblyLineDevelopmentFns.server";
import type {
  AssemblyLineApprovalDecision,
  AssemblyLineFormInput,
  AssemblyLineRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<AssemblyLineRecord> {
  try {
    const res = await getAssemblyLineFn();
    return unwrap<AssemblyLineRecord>(res);
  } catch (err) {
    console.warn("assemblyLineDevelopmentService fetchRecord fallback:", err);
    return DEFAULT_ASSEMBLY_LINE_RECORD;
  }
}

export async function saveDraft(
  input: Partial<AssemblyLineFormInput>,
  id?: string
): Promise<AssemblyLineRecord> {
  return unwrap<AssemblyLineRecord>(
    await saveAssemblyLineDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<AssemblyLineRecord> {
  return unwrap<AssemblyLineRecord>(await submitAssemblyLineFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: AssemblyLineApprovalDecision;
  comments?: string;
}): Promise<AssemblyLineRecord> {
  return unwrap<AssemblyLineRecord>(await reviewAssemblyLineFn({ data: args }));
}

export const assemblyLineDevelopmentService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
};
