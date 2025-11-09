'use server';

/**
 * @fileOverview Generates a personalized romantic message based on user inputs using Google Gemini.
 *
 * - generateRomanticMessage - A function that generates the romantic message.
 * - RomanticMessageInput - The input type for the generateRomanticMessage function.
 * - RomanticMessageOutput - The return type for the generateRomanticMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RomanticMessageInputSchema = z.object({
  favoriteMemory: z.string().describe('User\'s favorite memory together'),
  personality: z.string().describe('One word to describe the user'),
  tone: z.enum(['Poetic', 'Flirty', 'Silly']).describe('Desired tone of the message'),
  favoriteThing: z.string().describe('User\'s favorite thing about the other person'),
});
export type RomanticMessageInput = z.infer<typeof RomanticMessageInputSchema>;

const RomanticMessageOutputSchema = z.object({
  message: z.string().describe('The generated romantic message'),
});
export type RomanticMessageOutput = z.infer<typeof RomanticMessageOutputSchema>;

export async function generateRomanticMessage(input: RomanticMessageInput): Promise<RomanticMessageOutput> {
  return generateRomanticMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'romanticMessagePrompt',
  input: {schema: RomanticMessageInputSchema},
  output: {schema: RomanticMessageOutputSchema},
  prompt: 'You are a love expert. Generate a unique, short, and touching love quote. The quote should be original and heartfelt, suitable for a romantic confession.',
});

const generateRomanticMessageFlow = ai.defineFlow(
  {
    name: 'generateRomanticMessageFlow',
    inputSchema: RomanticMessageInputSchema,
    outputSchema: RomanticMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
