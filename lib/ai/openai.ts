import type { IAiProvider, DisputeSuggestion, ScoreSimulation } from './index';
import { redactPII, requireApiKey, maskAccountNumbers } from './guards';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIProvider implements IAiProvider {
  private apiKey: string;
  constructor(apiKey = requireApiKey()) {
    this.apiKey = apiKey;
  }

  private async chat(messages: ChatMessage[]): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, temperature: 0 }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  async suggestDisputes(reportId: string): Promise<DisputeSuggestion[]> {
    const safe = redactPII({ reportId });
    const prompt = maskAccountNumbers(
      `Given credit report identifier ${safe.reportId}, provide a JSON array of dispute suggestions with fields tradelineId, kind, rationale, and confidence.`,
    );
    const content = await this.chat([{ role: 'user', content: prompt }]);
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async simulate(score: number, utilizationDelta: number): Promise<ScoreSimulation> {
    const safe = redactPII({ score, utilizationDelta });
    const prompt = maskAccountNumbers(
      `Current score: ${safe.score}. Utilization delta: ${safe.utilizationDelta}. Respond with JSON {"newScore":number,"notes":string}.`,
    );
    const content = await this.chat([{ role: 'user', content: prompt }]);
    try {
      const parsed = JSON.parse(content);
      return {
        newScore: typeof parsed.newScore === 'number' ? parsed.newScore : score,
        notes: typeof parsed.notes === 'string' ? parsed.notes : '',
      };
    } catch {
      return { newScore: score, notes: '' };
    }
  }
}
