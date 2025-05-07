import OpenAI from 'openai';
import { config } from 'dotenv';
import chalk from 'chalk';

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callLLM(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error(chalk.red('Error calling OpenAI API:'), error);
    throw error;
  }
}

export async function callLLMWithRetry(prompt: string, maxRetries: number = 3): Promise<string> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callLLM(prompt);
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
} 