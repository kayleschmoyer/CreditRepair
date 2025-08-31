import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";

const schema = z.object({ reportId: z.string(), userId: z.string(), storagePath: z.string() });

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error }), { status: 400 });
  }
  // mock parser
  const { reportId, userId } = parsed.data;
  const tradelines = [
    { id: crypto.randomUUID(), report_id: reportId, creditor: 'Mock Bank', acct_mask: '1234', type: 'credit_card', balance: 50000, credit_limit: 100000, status: 'open', opened_date: '2020-01-01', last_reported: '2024-01-01', late_30: 0, late_60: 0, late_90: 0 },
    { id: crypto.randomUUID(), report_id: reportId, creditor: 'Mock Auto', acct_mask: '9876', type: 'auto', balance: 2000000, credit_limit: null, status: 'open', opened_date: '2019-06-01', last_reported: '2024-01-01', late_30: 1, late_60: 0, late_90: 0 }
  ];
  await supabase.from('credit_reports').update({ status: 'parsed', parsed_at: new Date().toISOString(), summary: { tradelines: tradelines.length } }).eq('id', reportId).eq('user_id', userId);
  for (const t of tradelines) {
    await supabase.from('tradelines').insert(t);
  }
  return new Response(JSON.stringify({ ok: true, tradelines }), { headers: { 'Content-Type': 'application/json' } });
});
