import type { CapacityAiAssessmentResult, CapacityPlanningRecord } from "./types";

export async function analyzeCapacity(
  record: Partial<CapacityPlanningRecord>
): Promise<CapacityAiAssessmentResult> {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const demand = record.demandForecastUnits ?? 120000;
  const utilization = record.capacityUtilization ?? 78;

  const score = Math.min(98, Math.max(75, Math.round((utilization + 90) / 2)));

  return {
    demandForecastInsight: `Q3 demand will increase by 18% based on EV market volume projections (Target: ${(demand * 1.18).toLocaleString()} units).`,
    capacityOptimization: "Increase Line 3 shift allocation by +1 shift to add 12% capacity headroom.",
    bottleneckPrediction: "WS-40 Coil Winding Machine is predicted to reach 94% utilization limit in Aug 2024.",
    expansionRecommendation: "Add 1 automated Testing Station at WS-70 to relieve testing buffer congestion.",
    workforceOptimization: "Reallocate 15 operators to Line 3 shift 2 during Q3 peak demand.",
    aiCapacityScore: score,
  };
}

export async function forecastDemand(period: string) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { period, forecastedGrowth: 18, projectedUnits: 141600 };
}

export async function predictBottlenecks(record: Partial<CapacityPlanningRecord>) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [
    { workstation: "WS-40", equipment: "Coil Winding Machine", risk: "Critical", predictedMonth: "Aug 2024" },
    { workstation: "WS-70", equipment: "Testing Station", risk: "High", predictedMonth: "Sep 2024" },
  ];
}

export async function optimizeCapacity(record: Partial<CapacityPlanningRecord>) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { additionalThroughputPct: 12, recommendedShifts: 3 };
}

export async function recommendExpansion(record: Partial<CapacityPlanningRecord>) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { recommendedEquipment: "Testing Rig TR-04", estCapGainPct: 15 };
}

export async function optimizeWorkforce(record: Partial<CapacityPlanningRecord>) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { reallocatedOperators: 15, targetLine: "Line 3" };
}

export const capacityAiService = {
  analyzeCapacity,
  forecastDemand,
  predictBottlenecks,
  optimizeCapacity,
  recommendExpansion,
  optimizeWorkforce,
};
