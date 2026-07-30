import {
  DEFAULT_RECORD,
  getSimulationAnalysisFn,
  reviewSimulationAnalysisFn,
  saveSimulationAnalysisDraftFn,
  submitSimulationAnalysisFn,
} from "@/lib/simulationAnalysisFns.server";
import type {
  SimulationApprovalDecision,
  SimulationFormInput,
  SimulationRecord,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any): T {
  if (res && "success" in res && !res.success) throw new Error(res.error);
  return (res.data ?? res) as T;
}

export async function fetchRecord(): Promise<SimulationRecord> {
  try {
    const res = await getSimulationAnalysisFn();
    return unwrap<SimulationRecord>(res);
  } catch (err) {
    console.warn("simulationAnalysisService fetchRecord fallback:", err);
    return DEFAULT_RECORD;
  }
}

export async function saveDraft(
  input: Partial<SimulationFormInput>,
  id?: string
): Promise<SimulationRecord> {
  return unwrap<SimulationRecord>(
    await saveSimulationAnalysisDraftFn({ data: { id, input } })
  );
}

export async function submitForReview(id?: string): Promise<SimulationRecord> {
  return unwrap<SimulationRecord>(await submitSimulationAnalysisFn({ data: id }));
}

export async function reviewDecision(args: {
  id: string;
  decision: SimulationApprovalDecision;
  comments?: string;
}): Promise<SimulationRecord> {
  return unwrap<SimulationRecord>(await reviewSimulationAnalysisFn({ data: args }));
}

export const simulationAnalysisService = {
  fetchRecord,
  saveDraft,
  submitForReview,
  reviewDecision,
};
