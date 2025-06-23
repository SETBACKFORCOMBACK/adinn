'use server';

/**
 * @fileOverview This file defines a Genkit flow for automated cost estimation of fabrication projects based on manual user inputs.
 *
 * - automatedCostEstimation - A function that calculates the estimated cost of a fabrication project.
 * - AutomatedCostEstimationInput - The input type for the automatedCostEstimation function.
 * - AutomatedCostEstimationOutput - The return type for the automatedCostEstimation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedCostEstimationInputSchema = z.object({
  materialType: z.string().describe('Type of material chosen for the fabrication.'),
  materialCost: z.number().describe('Cost of the material per unit (e.g., per meter) in INR.'),
  frameLength: z.number().describe('Total length of the material to be used in meters.'),
  numCuts: z.number().describe('Total number of cuts to be made.'),
  cutCostPerUnit: z.number().describe('Cost per single cut in INR.'),
  cutTimePerUnit: z.number().describe('Time taken for a single cut in minutes.'),
  numWelds: z.number().describe('Total number of weld joints.'),
  weldCostPerUnit: z.number().describe('Cost per single weld in INR.'),
  weldTimePerUnit: z.number().describe('Time taken for a single weld in minutes.'),
  numLabours: z.number().describe('Number of labours involved.'),
  labourCostPerHour: z.number().describe('Cost per hour for a single labour in INR.'),
});
export type AutomatedCostEstimationInput = z.infer<typeof AutomatedCostEstimationInputSchema>;

const AutomatedCostEstimationOutputSchema = z.object({
  materialUsage: z.object({
    totalMaterialRequired: z.string().describe('Total material required, in meters.'),
    totalMaterialCost: z.number().describe('Total cost of the material in INR.'),
  }),
  cuttingDetails: z.object({
    totalCuts: z.number().describe('Total number of cuts.'),
    totalCuttingCost: z.number().describe('Total cost for all cutting operations in INR.'),
    totalCuttingTime: z.number().describe('Total time for all cutting operations in minutes.'),
  }),
  weldingDetails: z.object({
    totalWeldJoints: z.number().describe('Total number of weld joints.'),
    totalWeldingCost: z.number().describe('Total cost for all welding operations in INR.'),
    totalWeldingTime: z.number().describe('Total time for all welding operations in minutes.'),
  }),
  labourDetails: z.object({
    totalLabourHours: z.number().describe('Total labour hours for the project.'),
    totalLabourCost: z.number().describe('Total cost for all labour in INR.'),
  }),
  totalSummary: z.object({
    totalMaterialCost: z.number().describe('Total cost of the material in INR.'),
    totalOperationsCost: z.number().describe('Sum of total cutting and welding costs in INR.'),
    totalLabourCost: z.number().describe('Total cost for all labour in INR.'),
    grandTotalCost: z.number().describe('The grand total fabrication cost in INR.'),
    totalFabricationTime: z.number().describe('Total fabrication time in minutes.'),
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
  prompt: `You are an expert fabrication estimator. Based on user inputs, calculate the total cost and time for a fabrication project.

### INPUT DATA:
- Material Type: {{materialType}}
- Material Cost Per Unit (₹): {{materialCost}}
- Total Frame Length: {{frameLength}} meters

### FABRICATION DETAILS:
- Number of Cuts: {{numCuts}}
- Cost per Cut (₹): {{cutCostPerUnit}}
- Time per Cut (minutes): {{cutTimePerUnit}}
- Number of Weld Joints: {{numWelds}}
- Cost per Weld (₹): {{weldCostPerUnit}}
- Time per Weld (minutes): {{weldTimePerUnit}}

### LABOUR DETAILS:
- Number of Labours: {{numLabours}}
- Labour Cost Per Hour (₹): {{labourCostPerHour}}

### CALCULATION LOGIC:
1.  **Material Cost**: \`frameLength\` * \`materialCost\`.
2.  **Cutting Cost**: \`numCuts\` * \`cutCostPerUnit\`.
3.  **Cutting Time**: \`numCuts\` * \`cutTimePerUnit\`.
4.  **Welding Cost**: \`numWelds\` * \`weldCostPerUnit\`.
5.  **Welding Time**: \`numWelds\` * \`weldTimePerUnit\`.
6.  **Total Fabrication Time (minutes)**: \`Cutting Time\` + \`Welding Time\`.
7.  **Total Labour Hours**: (\`Total Fabrication Time (minutes)\` / 60).
8.  **Total Labour Cost**: \`Total Labour Hours\` * \`numLabours\` * \`labourCostPerHour\`.
9.  **Total Operations Cost**: \`Cutting Cost\` + \`Welding Cost\`.
10. **Grand Total Cost**: \`Material Cost\` + \`Operations Cost\` + \`Total Labour Cost\`.

### EXPECTED OUTPUT:
Provide a clean JSON output with the following structure. Do not include any unnecessary text, only the structured result.

1.  **Material Usage**:
    -   totalMaterialRequired (string, e.g., "{{frameLength}} meters")
    -   totalMaterialCost (number)
2.  **Cutting Details**:
    -   totalCuts (number)
    -   totalCuttingCost (number)
    -   totalCuttingTime (number, in minutes)
3.  **Welding Details**:
    -   totalWeldJoints (number)
    -   totalWeldingCost (number)
    -   totalWeldingTime (number, in minutes)
4.  **Labour Details**:
    -   totalLabourHours (number)
    -   totalLabourCost (number)
5.  **Total Summary**:
    -   totalMaterialCost (number)
    -   totalOperationsCost (number)
    -   totalLabourCost (number)
    -   grandTotalCost (number)
    -   totalFabricationTime (number, in minutes)
`,
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
