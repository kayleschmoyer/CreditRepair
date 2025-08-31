import { aiProvider } from '../../../lib/ai';
import { z } from 'zod';
import FormWithToast from '../../../components/FormWithToast';
import type { AppError } from '../../../lib/utils/errors';
import { createServerClient } from '../../../lib/supabase/server';

export default function SimulatePage() {
  async function simulate(formData: FormData): Promise<{ error?: AppError }> {
    'use server';
    const schema = z.object({
      score: z.preprocess((v) => Number(v), z.number().int().min(300).max(850)),
      delta: z.preprocess((v) => Number(v), z.number().min(-100).max(100)),
    });
    const values = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      return { error: { code: 'INVALID_INPUT', message: parsed.error.message } };
    }
    try {
      await aiProvider.simulate(parsed.data.score, parsed.data.delta);
      return {};
    } catch (e) {
      return {
        error: {
          code: 'SERVER_ERROR',
          message: e instanceof Error ? e.message : 'Simulation failed',
        },
      };
    }
  }

  async function runCron(): Promise<{ error?: AppError }> {
    'use server';
    const supabase = createServerClient();
    const { data, error } = await supabase.functions.invoke('cron-due-reminders');
    if (error || !data?.ok) {
      return { error: { code: 'SERVER_ERROR', message: error?.message || data?.error?.message || 'Cron failed' } };
    }
    return {};
  }
  return (
    <div>
      <h1>Simulator</h1>
      <FormWithToast action={simulate}>
        <label>Current Score <input name="score" defaultValue="650" /></label><br />
        <label>Utilization Change (%) <input name="delta" defaultValue="-10" /></label><br />
        <button type="submit">Simulate</button>
      </FormWithToast>
      <hr />
      <FormWithToast action={runCron}>
        <button type="submit">Run cron now</button>
      </FormWithToast>
    </div>
  );
}
