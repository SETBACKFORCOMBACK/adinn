'use server';

import type {EstimateFromImageOutput} from '@/ai/flows/automated-cost-estimation';

// This is a mock lookup table for costs and times based on material and task.
// It is now internal to this module and not exported.
const fabricationSheet: CalculationSheetEntry[] = [
  // Mild Steel
  { type: "Material", material: "Mild Steel", cost_per_foot: 150 },
  { type: "Cutting", material: "Mild Steel", time_per_unit_min: 2, cost_per_unit: 25 },
  { type: "Welding", material: "Mild Steel", time_per_unit_min: 5, cost_per_unit: 100 },
  { type: "Frame Assembly", material: "Mild Steel", time_per_unit_min: 10, cost_per_unit: 120 },
  
  // Aluminum
  { type: "Material", material: "Aluminum", cost_per_foot: 250 },
  { type: "Cutting", material: "Aluminum", time_per_unit_min: 1.5, cost_per_unit: 30 },
  { type: "Welding", material: "Aluminum", time_per_unit_min: 7, cost_per_unit: 150 },
  { type: "Frame Assembly", material: "Aluminum", time_per_unit_min: 12, cost_per_unit: 180 },

  // Default/Fallback values if material is not found
  { type: "Material", material: "Default", cost_per_foot: 100 },
  { type: "Cutting", material: "Default", time_per_unit_min: 3, cost_per_unit: 20 },
  { type: "Welding", material: "Default", time_per_unit_min: 6, cost_per_unit: 90 },
  { type: "Frame Assembly", material: "Default", time_per_unit_min: 15, cost_per_unit: 100 },
];

export interface CalculationSheetEntry {
    type: string;
    material: string;
    cost_per_foot?: number;
    time_per_unit_min?: number;
    cost_per_unit?: number;
}

export interface CalculatedOutput {
    totalTime: number;
    totalCost: number;
    materialCost: number;
    tasksBreakdown: Array<{
        type: string;
        count: number;
        time: number;
        cost: number;
    }>;
}

/**
 * Calculates fabrication costs based on Gemini output and the internal cost/time sheet.
 * @param geminiOutput - The structured data extracted by the AI.
 * @returns A detailed breakdown of costs and time.
 */
export async function calculateFabricationCosts(geminiOutput: EstimateFromImageOutput): Promise<CalculatedOutput> {
  let totalTime = 0;
  let totalFabricationCost = 0;
  const tasksBreakdown: CalculatedOutput['tasksBreakdown'] = [];

  geminiOutput.tasks.forEach(task => {
    let entry = fabricationSheet.find(
      item => item.type === task.type && item.material === geminiOutput.material
    );
    // If a specific material entry is not found, use a default one.
    if (!entry) {
        entry = fabricationSheet.find(item => item.type === task.type && item.material === "Default");
    }

    if (entry && entry.time_per_unit_min !== undefined && entry.cost_per_unit !== undefined) {
        const time = task.count * entry.time_per_unit_min;
        const cost = task.count * entry.cost_per_unit;

        totalTime += time;
        totalFabricationCost += cost;
        tasksBreakdown.push({ type: task.type, count: task.count, time, cost });
    }
  });

  // Add frame calculation
  const numberOfFrames = 90;
  let frameAssemblyEntry = fabricationSheet.find(
    item => item.type === "Frame Assembly" && item.material === geminiOutput.material
  );
  if (!frameAssemblyEntry) {
    frameAssemblyEntry = fabricationSheet.find(item => item.type === "Frame Assembly" && item.material === "Default");
  }

  if (frameAssemblyEntry && frameAssemblyEntry.time_per_unit_min !== undefined && frameAssemblyEntry.cost_per_unit !== undefined) {
    const frameTime = numberOfFrames * frameAssemblyEntry.time_per_unit_min;
    const frameCost = numberOfFrames * frameAssemblyEntry.cost_per_unit;
    totalTime += frameTime;
    totalFabricationCost += frameCost;
    tasksBreakdown.push({ type: "Frame Assembly", count: numberOfFrames, time: frameTime, cost: frameCost });
  }


  let materialEntry = fabricationSheet.find(
    i => i.material === geminiOutput.material && i.type === "Material"
  );
   if (!materialEntry) {
        materialEntry = fabricationSheet.find(i => i.material === "Default" && i.type === "Material");
   }
  
  let materialCost = 0;
  if (materialEntry && materialEntry.cost_per_foot !== undefined) {
      materialCost = geminiOutput.material_length_ft * materialEntry.cost_per_foot;
  }

  const totalCost = totalFabricationCost + materialCost;

  return { totalTime, totalCost, materialCost, tasksBreakdown };
}
