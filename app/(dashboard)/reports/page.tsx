import Link from 'next/link';
import Upload from './Upload';
import { createServerClient } from '../../../lib/supabase/server';

async function getReports() {
  const supabase = createServerClient();
  const { data } = await supabase.from('credit_reports').select('*').order('created_at', { ascending: false });
  return data || [];
}

export default async function ReportsPage() {
  const reports = await getReports();
  return (
    <div>
      <h1>Reports</h1>
      <Upload />
      <ul>
        {reports.map(r => (
          <li key={r.id}><Link href={`/reports/${r.id}`}>{r.bureau || 'Unknown'} - {r.status}</Link></li>
        ))}
      </ul>
    </div>
  );
}
