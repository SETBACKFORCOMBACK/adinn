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
    totalLaborCost: number;
    finishingCost: number;
    transportCost: number;
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
 * @param options - Manual overrides for material length and task times.
 * @returns A detailed breakdown of costs and time for one frame.
 */
export async function calculateFabricationCosts(
  geminiOutput: EstimateFromImageOutput,
  options: CalculationOptions
): Promise<CalculatedOutput> {
  let totalTime = 0;
  const tasksBreakdown: CalculatedOutput['tasksBreakdown'] = [];

  const cuttingCost = 43.25;
  const weldingCost = 60.00;

  geminiOutput.tasks.forEach(task => {
    if (task.type === 'Cutting') {
        const time = options.cuttingTime;
        totalTime += time;
        tasksBreakdown.push({ type: task.type, count: task.count, time, cost: cuttingCost });
    } else if (task.type === 'Welding') {
        const time = options.weldingTime;
        totalTime += time;
        tasksBreakdown.push({ type: task.type, count: task.count, time, cost: weldingCost });
    }
  });

  const totalLaborCost = cuttingCost + weldingCost;
  const finishingCost = totalLaborCost * 0.50;
  const transportCost = 300;

  const materialCost = options.materialLength * 900;
  const totalCost = totalLaborCost + finishingCost + materialCost + transportCost;

  return { 
      materialLength: options.materialLength, 
      totalTime, 
      totalCost, 
      materialCost,
      totalLaborCost,
      finishingCost,
      transportCost,
      tasksBreakdown 
  };
}
