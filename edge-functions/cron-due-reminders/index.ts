import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data } = await supabase
    .from('disputes')
    .select('id,user_id')
    .eq('status', 'sent')
    .lte('due_at', new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString());
  for (const d of data || []) {
    await supabase.from('notifications').insert({ id: crypto.randomUUID(), user_id: d.user_id, type: 'dispute_due', message: `Dispute ${d.id} due soon` });
    await sendMail('user@example.com', 'Dispute Due', `Dispute ${d.id} due soon`);
  }
  return new Response(JSON.stringify({ ok: true, count: data?.length || 0 }), { headers: { 'Content-Type': 'application/json' } });
});
