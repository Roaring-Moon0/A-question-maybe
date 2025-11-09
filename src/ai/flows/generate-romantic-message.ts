
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
  prompt: `You are a romantic poet. Your task is to select the perfect quote from a predefined list that best matches the user's desired 'tone'.

Here is the list of available quotes, each with a unique emotional color:

1.  **Timeless & Poetic (Option 1):** "My soul recognized yours the way a melody recognizes its harmony — soft, familiar, inevitable. You are my favorite sound in a world full of noise." 🎵
2.  **Warm & Real (Option 2):** "You feel like home, even in moments when I didn’t know I was lost. Somehow, everything makes sense when it’s you." ☀️
3.  **Deep & Cinematic (Option 3):** "There’s a calm that exists only when you’re near. Like the world finally exhales, and everything just... fits." 🌙
4.  **Gentle & Loving (Option 4):** "If my heart could speak, it would say your name softly — not out of need, but because it feels right." 💖
5.  **Mysterious & Magical (Option 5):** "Maybe it wasn’t coincidence. Maybe it was the universe quietly whispering, ‘There they are — the one you’ve been waiting for.’" ✨

The user has specified the following tone: **{{tone}}**.

Analyze the tone and select the *single best quote* from the list above.

- If the tone is 'Poetic', choose Option 1.
- If the tone is 'Flirty', choose Option 2 or Option 4. Be playful.
- If the tone is 'Silly', choose Option 5, as it has a magical, whimsical feel.

Respond *only* with the full text of the chosen quote, including the emoji. Do not add any extra commentary or labels.
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
