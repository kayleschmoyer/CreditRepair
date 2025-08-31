import { createServerClient } from '../../../../lib/supabase/server';
import { aiProvider } from '../../../../lib/ai';
import Table from '../../../../components/Table';
import { formatMoney } from '../../../../lib/utils';
import { logAccess } from '../../../../lib/supabase/access-log';
import FormWithToast from '../../../../components/FormWithToast';
import type { AppError } from '../../../../lib/utils/errors';

export default async function ReportDetail({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: report } = await supabase.from('credit_reports').select('*').eq('id', params.id).single();
  if (report) {
    await logAccess(supabase, report.user_id, 'credit_reports', { id: params.id });
  }
  const { data: tradelines } = await supabase.from('tradelines').select('*').eq('report_id', params.id);

  async function findCandidates(): Promise<{ error?: AppError }> {
    'use server';
    try {
      const suggestions = await aiProvider.suggestDisputes(params.id);
      const rows = suggestions.map((s) => ({
        ...s,
        user_id: report!.user_id,
        report_id: params.id,
        id: crypto.randomUUID(),
      }));
      await supabase.from('dispute_candidates').insert(rows);
      return {};
    } catch (e) {
      return {
        error: {
          code: 'SUGGEST_FAILED',
          message: e instanceof Error ? e.message : 'Failed to suggest disputes',
        },
      };
    }
  }

  return (
    <div>
      <h1>Report {params.id}</h1>
      <FormWithToast action={findCandidates}><button type="submit">Find dispute candidates</button></FormWithToast>
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
