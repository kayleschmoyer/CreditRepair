import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";
import type { AppError } from "../../lib/utils/errors.ts";

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
    const { data } = await supabase
      .from('disputes')
      .select('id,user_id')
      .eq('status', 'sent')
      .lte('due_at', new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString());
    for (const d of data || []) {
      await supabase
        .from('notifications')
        .insert({ id: crypto.randomUUID(), user_id: d.user_id, type: 'dispute_due', message: `Dispute ${d.id} due soon` });
      await sendMail('user@example.com', 'Dispute Due', `Dispute ${d.id} due soon`);
    }
    return new Response(JSON.stringify({ ok: true, count: data?.length || 0 }), {
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
