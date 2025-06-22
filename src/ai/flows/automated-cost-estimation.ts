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
  modelDimensions: z
    .string()
    .describe('The dimensions of the 3D model (e.g., length, width, height).'),
  materialSelection: z.string().describe('The material selected for the 3D model.'),
  aiPredictedParameters: z
    .string()
    .describe('AI-predicted parameters such as material type and welding time.'),
});
export type AutomatedCostEstimationInput = z.infer<typeof AutomatedCostEstimationInputSchema>;

const AutomatedCostEstimationOutputSchema = z.object({
  estimatedCost: z.number().describe('The estimated cost for the 3D model project.'),
  costBreakdown: z
    .string()
    .describe('A breakdown of the cost, including material, labor, and other factors.'),
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
  prompt: `You are an expert cost estimator for 3D model projects.

  Based on the model dimensions, material selection, and AI-predicted parameters, calculate the estimated cost for the project.

  Model Dimensions: {{{modelDimensions}}}
  Material Selection: {{{materialSelection}}}
  AI-Predicted Parameters: {{{aiPredictedParameters}}}

  Provide a cost breakdown, including material costs, labor costs, and any other relevant factors.

  Return the estimated cost as a number and the cost breakdown as a string.`,
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
