'use server';

import type {EstimateFromImageOutput} from '@/ai/flows/automated-cost-estimation';

const fabricationSheet: CalculationSheetEntry[] = [
  { type: "Material", material: "Mild Steel", cost_per_unit_length: 900 },
  { type: "Cutting", material: "Mild Steel", time_per_unit_min: 2, cost_per_unit: 25 },
  { type: "Welding", material: "Mild Steel", time_per_unit_min: 5, cost_per_unit: 100 },
  { type: "Material", material: "Aluminum", cost_per_unit_length: 900 },
  { type: "Cutting", material: "Aluminum", time_per_unit_min: 1.5, cost_per_unit: 30 },
  { type: "Welding", material: "Aluminum", time_per_unit_min: 7, cost_per_unit: 150 },
  { type: "Material", material: "Default", cost_per_unit_length: 900 },
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

export interface CalculationOptions {
    materialLength: number;
    cuttingTime: number;
    weldingTime: number;
}

export interface CalculatedOutput {
    materialLength: number;
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

const CUTTING_COST_PER_MINUTE = 1.73;
const WELDING_COST_PER_MINUTE = 2.08;

/**
 * Calculates fabrication costs based on Gemini output and the internal cost/time sheet.
 * This calculates the cost for a SINGLE item/frame.
 * @param geminiOutput - The structured data extracted by the AI for a single frame.
 * @param options - Manual overrides for material length and task times.
 * @returns A detailed breakdown of costs and time for one frame.
 */
export async function calculateFabricationCosts(
  geminiOutput: EstimateFromImageOutput,
  options: CalculationOptions
): Promise<CalculatedOutput> {
  let totalTime = 0;
  let totalFabricationCost = 0;
  const tasksBreakdown: CalculatedOutput['tasksBreakdown'] = [];

  geminiOutput.tasks.forEach(task => {
    if (task.type === 'Cutting') {
        const time = options.cuttingTime;
        const cost = time * CUTTING_COST_PER_MINUTE;
        totalTime += time;
        totalFabricationCost += cost;
        tasksBreakdown.push({ type: task.type, count: task.count, time, cost });
    } else if (task.type === 'Welding') {
        const time = options.weldingTime;
        const cost = time * WELDING_COST_PER_MINUTE;
        totalTime += time;
        totalFabricationCost += cost;
        tasksBreakdown.push({ type: task.type, count: task.count, time, cost });
    } else {
        let entry = fabricationSheet.find(
          item => item.type === task.type && item.material === geminiOutput.material
        );
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
    }
  });

  const materialCost = options.materialLength * 900;
  const totalCost = totalFabricationCost + materialCost;

  return { materialLength: options.materialLength, totalTime, totalCost, materialCost, tasksBreakdown };
}
