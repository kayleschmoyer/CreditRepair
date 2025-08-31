import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";
import type { AppError } from "../../lib/utils/errors.ts";

const CRON_NAME = 'cron_due_reminders';
const JITTER_MS = 15 * 60 * 1000; // 15 minutes

async function sendMail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: 'no-reply@creditcraft.local', to, subject, html })
  });
}

const schema = z.object({});

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  try {
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {}
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const error: AppError = { code: 'INVALID_INPUT', message: parsed.error.message };
      return new Response(JSON.stringify({ ok: false, error }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const now = new Date();
    const { data: lastRuns } = await supabase
      .from('last_cron_run')
      .select('ran_at')
      .eq('name', CRON_NAME)
      .limit(1);
    const lastRun = lastRuns && lastRuns.length > 0 && lastRuns[0].ran_at
      ? new Date(lastRuns[0].ran_at)
      : new Date(0);
    const windowStart = new Date(lastRun.getTime() - JITTER_MS);
    const windowEnd = new Date(now.getTime() + 1000 * 60 * 60 * 48 + JITTER_MS);

    const { data, error: disputeError } = await supabase
      .from('disputes')
      .select('id,user_id')
      .eq('status', 'sent')
      .gte('due_at', windowStart.toISOString())
      .lte('due_at', windowEnd.toISOString());
    if (disputeError) throw disputeError;

    let count = 0;
    for (const d of data || []) {
      const notifyDate = now.toISOString().slice(0, 10);
      const { error: insertError } = await supabase
        .from('notifications')
        .insert({
          id: crypto.randomUUID(),
          user_id: d.user_id,
          dispute_id: d.id,
          type: 'dispute_due',
          message: `Dispute ${d.id} due soon`,
          notify_date: notifyDate,
        });
      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`Duplicate notification for dispute ${d.id}, skipping`);
          continue;
        }
        throw insertError;
      }
      await sendMail('user@example.com', 'Dispute Due', `Dispute ${d.id} due soon`);
      count++;
    }

    await supabase
      .from('last_cron_run')
      .upsert({ name: CRON_NAME, ran_at: now.toISOString() });

    console.log(`cron-due-reminders completed, processed ${count}`);
    return new Response(JSON.stringify({ ok: true, count }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const error: AppError = {
      code: 'REMINDERS_FAILED',
      message: e instanceof Error ? e.message : 'Failed to send reminders',
    };
    return new Response(JSON.stringify({ ok: false, error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
