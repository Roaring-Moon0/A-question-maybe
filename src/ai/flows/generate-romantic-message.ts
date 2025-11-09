
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
  favoriteMemory: z.string().describe("User's favorite memory together"),
  personality: z.string().describe("One word to describe the user's partner"),
  tone: z.enum(['Poetic', 'Flirty', 'Silly']).describe('Desired tone of the message'),
  favoriteThing: z.string().describe("User's favorite thing about the other person"),
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
  prompt: `You are a romantic poet and a master of heartfelt messages. Your task is to write a short, beautiful, and personalized romantic quote based on the user's feelings and memories.

The message should be a single, impactful sentence or two. It should feel timeless and deeply personal. End with a fitting emoji.

Use the following information to craft the perfect message:
- Their favorite memory: {{{favoriteMemory}}}
- A word that describes their partner: {{{personality}}}
- Their favorite thing about their partner: {{{favoriteThing}}}
- The desired tone: {{{tone}}}

Analyze the inputs and generate a unique message that captures the essence of their relationship.

Examples for inspiration, but do not copy them:
- Poetic: "My soul recognized yours the way a melody recognizes its harmony—soft, familiar, inevitable. You are my favorite sound in a world full of noise."
- Flirty: "You feel like home, even in moments when I didn’t know I was lost. Somehow, everything makes sense when it’s you."
- Silly: "Maybe it wasn’t coincidence. Maybe it was the universe quietly whispering, ‘There they are—the one you’ve been waiting for.’"

Generate a new, original message that is perfectly suited to the user's provided details and desired tone.
  `,
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
