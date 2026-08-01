import type { CapacitySimulationResult } from "./types";

export async function runCapacitySimulation(
  planningId: string,
  scenarioName: string = "Peak Demand (Q3)"
): Promise<CapacitySimulationResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    id: `csim-${Date.now()}`,
    scenarioName,
    simulationScore: 86,
    expansionRequirement: "Recommended (+1 Testing Station)",
    passed: true,
    runDate: new Date().toLocaleDateString(),
  };
}

export async function runMaterialFlowSimulation(planningId: string) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { passed: true, materialFlowEfficiency: 92 };
}

export async function runEmergencyCapacitySimulation(planningId: string) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { passed: true, maxEmergencyCapacity: 145000 };
}

export const capacitySimulationService = {
  runCapacitySimulation,
  runMaterialFlowSimulation,
  runEmergencyCapacitySimulation,
};
