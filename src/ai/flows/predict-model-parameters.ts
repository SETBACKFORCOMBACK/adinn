'use server';

/**
 * @fileOverview An AI agent that predicts relevant parameters for a 3D model to estimate its cost.
 *
 * - predictModelParameters - A function that handles the parameter prediction process.
 * - PredictModelParametersInput - The input type for the predictModelParameters function.
 * - PredictModelParametersOutput - The return type for the predictModelParameters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictModelParametersInputSchema = z.object({
  modelData: z
    .string()
    .describe("The 3D model data in text format (e.g., extracted from .obj or .stl file)."),
});
export type PredictModelParametersInput = z.infer<typeof PredictModelParametersInputSchema>;

const PredictModelParametersOutputSchema = z.object({
  materialType: z.string().describe('The predicted material type of the 3D model.'),
  frameLength: z.number().describe('The total length of the frame in meters, inferred from model dimensions.'),
  numCuts: z.number().describe('The estimated number of cuts required.'),
  numWelds: z.number().describe('The estimated number of weld joints required.'),
});
export type PredictModelParametersOutput = z.infer<typeof PredictModelParametersOutputSchema>;

export async function predictModelParameters(input: PredictModelParametersInput): Promise<PredictModelParametersOutput> {
  return predictModelParametersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictModelParametersPrompt',
  input: {schema: PredictModelParametersInputSchema},
  output: {schema: PredictModelParametersOutputSchema},
  prompt: `You are an AI expert in 3D modeling and manufacturing. Based on the provided 3D model data, analyze its geometry and predict key fabrication parameters.

3D Model Data: {{{modelData}}}

From the geometry, estimate the following:
- Material Type: Suggest a likely material for this kind of model.
- Frame Length: Calculate the total length of all structural members in meters.
- Number of Cuts: Estimate the number of individual cuts required to create the pieces.
- Number of Welds: Estimate the number of joints that will require welding.

Provide your prediction in a structured JSON format.`,
});

const predictModelParametersFlow = ai.defineFlow(
  {
    name: 'predictModelParametersFlow',
    inputSchema: PredictModelParametersInputSchema,
    outputSchema: PredictModelParametersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
