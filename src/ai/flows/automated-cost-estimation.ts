'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting fabrication project details from an image.
 *
 * - estimateFromImage - A function that extracts structured data about a fabrication project from an image.
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
  material: z.string().describe("The primary material identified (e.g., Aluminum, Mild Steel)."),
  material_length: z.number().describe("The total length of material required."),
  tasks: z.array(z.object({
      type: z.string().describe("The type of fabrication task (e.g., Cutting, Welding)."),
      count: z.number().describe("The quantity of this task (e.g., 70 cuts, 58 welds).")
  })).describe("A list of all fabrication tasks and their quantities."),
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
  prompt: `You are a fabrication estimator.

Given a 3D model or sketch image of a frame or part, extract:
- Material type (e.g., Aluminum, Mild Steel)
- Total material length required
- Fabrication tasks involved (cutting, welding, etc.)
- Quantity of each task (e.g., 70 cuts, 58 welds)

Respond only in this JSON format:

{
  "material": "Mild Steel",
  "material_length": 4,
  "tasks": [
    { "type": "Cutting", "count": 70 },
    { "type": "Welding", "count": 58 }
  ]
}

Image with project details: {{media url=imageDataUri}}`,
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
