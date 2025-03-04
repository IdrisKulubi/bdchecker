import { OpenAI } from 'openai';

// Check if the OPENAI_API_KEY environment variable is defined
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not defined');
}

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a response from OpenAI
 * @param prompt The prompt to send to OpenAI
 * @param model The model to use (default: gpt-4-turbo)
 * @param temperature The temperature to use (default: 0.7)
 * @returns The response from OpenAI
 */
export async function generateResponse(
  prompt: string,
  model: string = 'gpt-4-turbo',
  temperature: number = 0.7
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating response from OpenAI:', error);
    throw error;
  }
}

/**
 * Parse JSON from a string
 * @param text The text to parse
 * @returns The parsed JSON object
 */
export function parseJsonFromText(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in the text');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error parsing JSON from text:', error);
    throw error;
  }
} 