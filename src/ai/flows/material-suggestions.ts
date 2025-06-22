'use server';

/**
 * @fileOverview This file contains the Genkit flow for providing material suggestions based on model and cost requirements.
 *
 * - suggestMaterials - A function that suggests alternative materials for a 3D model project.
 * - SuggestMaterialsInput - The input type for the suggestMaterials function.
 * - SuggestMaterialsOutput - The return type for the suggestMaterials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMaterialsInputSchema = z.object({
  modelDescription: z
    .string()
    .describe('A detailed description of the 3D model, including its purpose, size, and any specific requirements.'),
  costRequirements: z
    .string()
    .describe('The desired cost range or budget for the 3D model project.'),
  currentMaterial: z
    .string()
    .describe('The currently selected material for the 3D model.'),
});
export type SuggestMaterialsInput = z.infer<typeof SuggestMaterialsInputSchema>;

const SuggestMaterialsOutputSchema = z.object({
  suggestedMaterials: z
    .array(z.string())
    .describe('An array of alternative material suggestions based on the model description and cost requirements.'),
  reasoning: z
    .string()
    .describe('Explanation of why these materials are suggested'),
});
export type SuggestMaterialsOutput = z.infer<typeof SuggestMaterialsOutputSchema>;

export async function suggestMaterials(input: SuggestMaterialsInput): Promise<SuggestMaterialsOutput> {
  return suggestMaterialsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMaterialsPrompt',
  input: {schema: SuggestMaterialsInputSchema},
  output: {schema: SuggestMaterialsOutputSchema},
  prompt: `You are an expert in material science and cost estimation for 3D model projects.

  Based on the description of the 3D model, the cost requirements, and the current material being used, suggest alternative materials that could be used to accomplish the project in a more cost-effective way.

  Model Description: {{{modelDescription}}}
  Cost Requirements: {{{costRequirements}}}
  Current Material: {{{currentMaterial}}}

  Consider factors such as material properties, availability, and manufacturing processes when making your suggestions.
  Provide the suggestedMaterials as an array of strings. Explain your reasoning in the reasoning field.
  `,
});

const suggestMaterialsFlow = ai.defineFlow(
  {
    name: 'suggestMaterialsFlow',
    inputSchema: SuggestMaterialsInputSchema,
    outputSchema: SuggestMaterialsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
