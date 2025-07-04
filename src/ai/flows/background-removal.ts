// src/ai/flows/background-removal.ts
'use server';
/**
 * @fileOverview A flow to remove the background from an image using AI.
 *
 * - removeBackground - A function that handles the background removal process.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The return type for the removeBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemoveBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to remove the background from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

const RemoveBackgroundOutputSchema = z.object({
  processedPhotoDataUri: z
    .string()
    .describe("The photo with the background removed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;

export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundPrompt = ai.definePrompt({
  name: 'removeBackgroundPrompt',
  input: {schema: RemoveBackgroundInputSchema},
  output: {schema: RemoveBackgroundOutputSchema},
  prompt: `Remove the background from the image and return the image as a data URI.

Image: {{media url=photoDataUri}}`,
});

const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
          {media: {url: input.photoDataUri}},
          {text: 'Remove the background from this image'},
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

    return { processedPhotoDataUri: media!.url };
  }
);
