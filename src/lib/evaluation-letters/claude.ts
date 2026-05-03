import Anthropic from '@anthropic-ai/sdk';

/**
 * Default model for the evaluation letter pipeline. Override with
 * EVALUATION_LETTER_MODEL env var to swap in a different Claude model.
 */
export const DEFAULT_MODEL = process.env.EVALUATION_LETTER_MODEL || 'claude-sonnet-4-5';

/**
 * Cheap model for high-volume reference apps where the cost of Sonnet
 * is not justified (e.g. Academic Calendar Chatbot, PowerPoint
 * Reformatter). Override with CHEAP_MODEL env var. Defaults to the
 * cheapest current Anthropic model.
 */
export const CHEAP_MODEL = process.env.CHEAP_MODEL || 'claude-haiku-4-5-20251001';

let client: Anthropic | null = null;

export function isApiKeyConfigured(): boolean {
  const key = process.env.ANTHROPIC_API_KEY;
  return Boolean(key && key !== 'placeholder' && key.startsWith('sk-'));
}

export function getClient(): Anthropic {
  if (!client) {
    if (!isApiKeyConfigured()) {
      throw new Error(
        'ANTHROPIC_API_KEY is not configured. Set a real key in .env.local to enable AI generation.',
      );
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/**
 * Build a content array that puts long static reference material into a
 * cacheable system block. Anthropic prompt caching needs a 5-minute window
 * for cache hits to materialize across requests.
 */
export function buildCachedSystem(staticContent: string, instruction: string) {
  return [
    {
      type: 'text' as const,
      text: staticContent,
      cache_control: { type: 'ephemeral' as const },
    },
    {
      type: 'text' as const,
      text: instruction,
    },
  ];
}
