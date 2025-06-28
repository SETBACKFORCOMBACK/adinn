'use server';

import type {EstimateFromImageOutput} from '@/ai/flows/automated-cost-estimation';

// This is a mock lookup table for costs and times based on material and task.
// It is now internal to this module and not exported.
const fabricationSheet: CalculationSheetEntry[] = [
  // Mild Steel
  { type: "Material", material: "Mild Steel", cost_per_unit_length: 150 },
  { type: "Cutting", material: "Mild Steel", time_per_unit_min: 2, cost_per_unit: 25 },
  { type: "Welding", material: "Mild Steel", time_per_unit_min: 5, cost_per_unit: 100 },
  
  // Aluminum
  { type: "Material", material: "Aluminum", cost_per_unit_length: 250 },
  { type: "Cutting", material: "Aluminum", time_per_unit_min: 1.5, cost_per_unit: 30 },
  { type: "Welding", material: "Aluminum", time_per_unit_min: 7, cost_per_unit: 150 },

  // Default/Fallback values if material is not found
  { type: "Material", material: "Default", cost_per_unit_length: 100 },
  { type: "Cutting", material: "Default", time_per_unit_min: 3, cost_per_unit: 20 },
  { type: "Welding", material: "Default", time_per_unit_min: 6, cost_per_unit: 90 },
];

export interface CalculationSheetEntry {
    type: string;
    material: string;
    cost_per_unit_length?: number;
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
 * This calculates the cost for a SINGLE item/frame.
 * @param geminiOutput - The structured data extracted by the AI for a single frame.
 * @returns A detailed breakdown of costs and time for one frame.
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
        let time;
        if (task.type === 'Cutting') {
            time = 10;
        } else if (task.type === 'Welding') {
            time = 15;
        } else {
            // Fallback to original calculation for other potential tasks
            time = task.count * entry.time_per_unit_min;
        }

        const cost = task.count * entry.cost_per_unit;

        totalTime += time;
        totalFabricationCost += cost;
        tasksBreakdown.push({ type: task.type, count: task.count, time, cost });
    }
  });

  let materialEntry = fabricationSheet.find(
    i => i.material === geminiOutput.material && i.type === "Material"
  );
   if (!materialEntry) {
        materialEntry = fabricationSheet.find(i => i.material === "Default" && i.type === "Material");
   }
  
  let materialCost = 0;
  if (materialEntry && materialEntry.cost_per_unit_length !== undefined) {
      materialCost = geminiOutput.material_length * materialEntry.cost_per_unit_length;
  }

  const totalCost = totalFabricationCost + materialCost;

  return { totalTime, totalCost, materialCost, tasksBreakdown };
}
