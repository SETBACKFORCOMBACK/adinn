'use server';

/**
 * @fileOverview This file defines a Genkit flow for automated cost estimation of 3D models.
 *
 * - automatedCostEstimation - A function that calculates the estimated cost of a 3D model project.
 * - AutomatedCostEstimationInput - The input type for the automatedCostEstimation function.
 * - AutomatedCostEstimationOutput - The return type for the automatedCostEstimation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedCostEstimationInputSchema = z.object({
  materialType: z.string().describe("Type of material chosen for the fabrication."),
  materialCost: z.number().describe("Cost of the material per unit (e.g., per meter or per square meter) in INR."),
  stockSizes: z.string().optional().describe("Available stock sizes of the material."),
  frameLength: z.number().describe("Total length of the frame to be fabricated in meters."),
  frameArea: z.number().optional().describe("Total area of the frame to be fabricated in square meters."),
  numCuts: z.number().describe("Total number of cuts to be made."),
  cutCostPerUnit: z.number().describe("Cost per single cut in INR."),
  cutTimePerUnit: z.number().describe("Time taken for a single cut in minutes."),
  numWelds: z.number().describe("Total number of weld joints."),
  weldCostPerUnit: z.number().describe("Cost per single weld in INR."),
  weldTimePerUnit: z.number().describe("Time taken for a single weld in minutes."),
});
export type AutomatedCostEstimationInput = z.infer<typeof AutomatedCostEstimationInputSchema>;

const AutomatedCostEstimationOutputSchema = z.object({
    materialUsage: z.object({
        totalMaterialRequired: z.string().describe("Total material required, including waste, in meters or m²."),
        totalMaterialCost: z.number().describe("Total cost of the material in INR."),
    }),
    cuttingDetails: z.object({
        totalCuts: z.number().describe("Total number of cuts."),
        totalCuttingCost: z.number().describe("Total cost for all cutting operations in INR."),
        totalCuttingTime: z.number().describe("Total time for all cutting operations in minutes."),
    }),
    weldingDetails: z.object({
        totalWeldJoints: z.number().describe("Total number of weld joints."),
        totalWeldingCost: z.number().describe("Total cost for all welding operations in INR."),
        totalWeldingTime: z.number().describe("Total time for all welding operations in minutes."),
    }),
    totalSummary: z.object({
        totalMaterialCost: z.number().describe("Total cost of the material in INR."),
        totalOperationsCost: z.number().describe("Sum of total cutting and welding costs in INR."),
        grandTotalCost: z.number().describe("The grand total fabrication cost in INR."),
        totalFabricationTime: z.number().describe("Total fabrication time in minutes."),
    }),
});
export type AutomatedCostEstimationOutput = z.infer<typeof AutomatedCostEstimationOutputSchema>;

export async function automatedCostEstimation(
  input: AutomatedCostEstimationInput
): Promise<AutomatedCostEstimationOutput> {
  return automatedCostEstimationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedCostEstimationPrompt',
  input: {schema: AutomatedCostEstimationInputSchema},
  output: {schema: AutomatedCostEstimationOutputSchema},
  prompt: `You are an expert fabrication estimator. Based on 3D geometry details and user inputs, calculate material usage, cutting/welding operations, cost, and fabrication time.

### INPUT DATA:
- Material Type: {{materialType}}
- Material Cost Per Unit (₹): {{materialCost}}
- Available Stock Sizes (optional): {{stockSizes}}
- Total Frame Length/Area: {{frameLength}} meters
- Number of Cuts: {{numCuts}}
- Cost per Cut (₹): {{cutCostPerUnit}}
- Time per Cut (minutes): {{cutTimePerUnit}}
- Number of Weld Joints: {{numWelds}}
- Cost per Weld (₹): {{weldCostPerUnit}}
- Time per Weld (minutes): {{weldTimePerUnit}}

### EXPECTED OUTPUT:

1. 🧱 **Material Usage**
   - Total material required (with waste if applicable)
   - Total material cost (₹)

2. ✂️ **Cutting Details**
   - Total number of cuts
   - Total cost for cutting (₹)
   - Total time for cutting (minutes)

3. 🔩 **Welding Details**
   - Total number of weld joints
   - Total welding cost (₹)
   - Total welding time (minutes)

4. 📊 **Total Summary**
   - ✅ Total Material Cost (₹)
   - ✅ Total Cutting + Welding Cost (₹)
   - ✅ Grand Total Fabrication Cost (₹)
   - ✅ Total Fabrication Time (minutes)

5. 📤 Export Format (Optional):
   - Return the output in JSON or key-value format for displaying on UI and PDF/Excel export.

### GOAL:
Give a clean breakdown and total summary that can be shown to the user in the app. Do not include unnecessary text — only structured result.`,
});

const automatedCostEstimationFlow = ai.defineFlow(
  {
    name: 'automatedCostEstimationFlow',
    inputSchema: AutomatedCostEstimationInputSchema,
    outputSchema: AutomatedCostEstimationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
