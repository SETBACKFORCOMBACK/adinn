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
  weldingTime: z.string().describe('The predicted welding time in hours for the 3D model.'),
  otherParameters: z.string().describe('Other relevant parameters predicted by the AI.'),
});
export type PredictModelParametersOutput = z.infer<typeof PredictModelParametersOutputSchema>;

export async function predictModelParameters(input: PredictModelParametersInput): Promise<PredictModelParametersOutput> {
  return predictModelParametersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictModelParametersPrompt',
  input: {schema: PredictModelParametersInputSchema},
  output: {schema: PredictModelParametersOutputSchema},
  prompt: `You are an AI expert in 3D modeling and manufacturing cost estimation.

  Based on the provided 3D model data, predict the following parameters:
  - Material Type: Infer the material type used in the 3D model.
  - Welding Time: Estimate the welding time required in hours.
  - Other Parameters: List any other relevant parameters that can be inferred from the model data.

  3D Model Data: {{{modelData}}}

  Provide your prediction in JSON format:
  {
    "materialType": "<predicted_material_type>",
    "weldingTime": "<predicted_welding_time_in_hours>",
    "otherParameters": "<other_relevant_parameters>"
  }`,
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
