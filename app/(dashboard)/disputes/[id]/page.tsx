import { createServerClient } from '../../../../lib/supabase/server';

export default async function DisputeDetail({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: dispute } = await supabase.from('disputes').select('*').eq('id', params.id).single();

  async function genLetter() {
    'use server';
    await supabase.functions.invoke('gen-dispute-letter', { body: { disputeId: params.id } });
  }

  async function markMailed() {
    'use server';
    const due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('disputes').update({ status: 'sent', mailed_at: new Date().toISOString(), due_at: due }).eq('id', params.id);
  }

  return (
    <div>
      <h1>Dispute {params.id}</h1>
      <pre>{JSON.stringify(dispute, null, 2)}</pre>
      <form action={genLetter}><button type="submit">Generate Letter</button></form>
      <form action={markMailed}><button type="submit">Mark as mailed</button></form>
      {dispute?.letter_pdf_path && <a href={dispute.letter_pdf_path}>Download Letter</a>}
    </div>
  );
}
