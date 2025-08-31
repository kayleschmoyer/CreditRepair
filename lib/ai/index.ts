import { OpenAIProvider } from './openai';

export interface DisputeSuggestion {
  tradelineId: string;
  kind: string;
  rationale: string;
  confidence: number;
}

export interface ScoreSimulation {
  newScore: number;
  notes: string;
}

export interface AIProvider {
  suggestDisputes(reportId: string): Promise<DisputeSuggestion[]>;
  simulate(score: number, utilizationDelta: number): Promise<ScoreSimulation>;
}

class MockAI implements AIProvider {
  async suggestDisputes(reportId: string): Promise<DisputeSuggestion[]> {
    return [
      {
        tradelineId: '1',
        kind: 'not_mine',
        rationale: 'Account not recognized',
        confidence: 0.9,
      },
      {
        tradelineId: '2',
        kind: 'incorrect_balance',
        rationale: 'Balance appears too high',
        confidence: 0.75,
      },
    ];
  }
  async simulate(score: number, utilizationDelta: number): Promise<ScoreSimulation> {
    const newScore = Math.min(850, score + Math.round(utilizationDelta * 5));
    return { newScore, notes: 'Mock simulation' };
  }
}

export { OpenAIProvider } from './openai';

export const aiProvider: AIProvider =
  process.env.OPENAI_API_KEY ? new OpenAIProvider() : new MockAI();
