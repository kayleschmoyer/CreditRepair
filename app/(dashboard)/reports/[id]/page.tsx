import { createServerClient } from '../../../../lib/supabase/server';
import { aiProvider } from '../../../../lib/ai';
import Table from '../../../../components/Table';
import { formatMoney } from '../../../../lib/utils';

export default async function ReportDetail({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: report } = await supabase.from('credit_reports').select('*').eq('id', params.id).single();
  const { data: tradelines } = await supabase.from('tradelines').select('*').eq('report_id', params.id);

  async function findCandidates() {
    'use server';
    const suggestions = await aiProvider.suggestDisputes(params.id);
    const rows = suggestions.map(s => ({ ...s, user_id: report!.user_id, report_id: params.id, id: crypto.randomUUID() }));
    await supabase.from('dispute_candidates').insert(rows);
  }

  return (
    <div>
      <h1>Report {params.id}</h1>
      <form action={findCandidates}><button type="submit">Find dispute candidates</button></form>
      <pre>{JSON.stringify(report?.summary, null, 2)}</pre>
      <Table>
        <thead>
          <tr><th>Creditor</th><th>Balance</th></tr>
        </thead>
        <tbody>
          {tradelines?.map(t => (
            <tr key={t.id}><td>{t.creditor}</td><td>{formatMoney(t.balance)}</td></tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
