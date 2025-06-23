'use server';

/**
 * @fileOverview This file defines a Genkit flow for automated cost estimation of fabrication projects based on an uploaded image containing project details.
 *
 * - estimateFromImage - A function that calculates the estimated cost of a fabrication project from an image.
 * - EstimateFromImageInput - The input type for the estimateFromImage function.
 * - EstimateFromImageOutput - The return type for the estimateFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of the project specifications, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EstimateFromImageInput = z.infer<typeof EstimateFromImageInputSchema>;

const EstimateFromImageOutputSchema = z.object({
    givenMaterial: z.string().describe("The primary material mentioned in the image."),
    materialCostPerUnit: z.string().describe("The cost per unit for the material, in Indian Rupees (₹) and including the unit."),
    amountOfMaterialNeeded: z.string().describe("The quantity of material required, including units."),
    totalMaterialCost: z.string().describe("Calculated as (Amount of material needed * Material cost per unit), in Indian Rupees (₹)."),
    noOfCuttingsNeeded: z.string().describe("The number of cuts required."),
    timePerCutting: z.string().describe("The time for a single cut, including units."),
    totalTimeForCutting: z.string().describe("Calculated as (No of cuttings needed * Time per cutting)."),
    chargePerCutting: z.string().describe("The cost for a single cut, in Indian Rupees (₹)."),
    totalChargeForCutting: z.string().describe("Calculated as (No of cuttings needed * Charge per cutting), in Indian Rupees (₹)."),
    totalNoOfLabour: z.string().describe("The total number of workers involved."),
    finalFabricationTime: z.string().describe("The total estimated time for the project, including all processes."),
    productHandoverDate: z.string().describe("A predicted completion and handover date, assuming the project starts today, June 25, 2025."),
});
export type EstimateFromImageOutput = z.infer<typeof EstimateFromImageOutputSchema>;

export async function estimateFromImage(
  input: EstimateFromImageInput
): Promise<EstimateFromImageOutput> {
  return estimateFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateFromImagePrompt',
  input: {schema: EstimateFromImageInputSchema},
  output: {schema: EstimateFromImageOutputSchema},
  prompt: `You are an expert fabrication estimator. Analyze the provided image, which contains details about a fabrication project. Extract all relevant parameters, perform the necessary calculations, and provide a detailed cost and time breakdown. All cost-related fields must be in Indian Rupees (₹).

Image with project details: {{media url=imageDataUri}}

From the image, identify and calculate the following, then provide the output in a clean JSON format. If a value is not present in the image, estimate it based on common fabrication standards.

- givenMaterial: The primary material mentioned.
- materialCostPerUnit: The cost per unit for the material.
- amountOfMaterialNeeded: The quantity of material required.
- totalMaterialCost: Calculated as (Amount of material needed * Material cost per unit).
- noOfCuttingsNeeded: The number of cuts required.
- timePerCutting: The time for a single cut.
- totalTimeForCutting: Calculated as (No of cuttings needed * Time per cutting).
- chargePerCutting: The cost for a single cut.
- totalChargeForCutting: Calculated as (No of cuttings needed * Charge per cutting).
- totalNoOfLabour: The total number of workers involved.
- finalFabricationTime: The total estimated time for the project, including all processes.
- productHandoverDate: A predicted completion and handover date, assuming the project starts today. Today is June 25, 2025.
`,
});

const estimateFromImageFlow = ai.defineFlow(
  {
    name: 'estimateFromImageFlow',
    inputSchema: EstimateFromImageInputSchema,
    outputSchema: EstimateFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
