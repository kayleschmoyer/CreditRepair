import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";

const schema = z.object({ reportId: z.string() });

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error }), { status: 400 });
  const { reportId } = parsed.data;
  const report = await supabase.from('credit_reports').select('user_id').eq('id', reportId).single();
  const suggestions = [
    { id: crypto.randomUUID(), user_id: report.data!.user_id, report_id: reportId, tradeline_id: null, kind: 'late_payment_error', rationale: 'Reported 30 days late but paid on time', confidence: 0.8 },
    { id: crypto.randomUUID(), user_id: report.data!.user_id, report_id: reportId, tradeline_id: null, kind: 'not_mine', rationale: 'Account not recognized', confidence: 0.6 }
  ];
  for (const s of suggestions) {
    await supabase.from('dispute_candidates').insert(s);
  }
  return new Response(JSON.stringify({ ok: true, suggestions }), { headers: { 'Content-Type': 'application/json' } });
});
