import Link from 'next/link';
import Upload from './Upload';
import { createServerClient } from '../../../lib/supabase/server';
import VirtualList from '../../../components/VirtualList';

const PAGE_SIZE = 10;

async function getReports(page: number) {
  const supabase = createServerClient();
  const { data, count } = await supabase
    .from('credit_reports')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  return { reports: data || [], count: count || 0 };
}

export default async function ReportsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page || '1', 10);
  const { reports, count } = await getReports(page);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  return (
    <div>
      <h1>Reports</h1>
      <Upload />
      <VirtualList
        items={reports}
        itemHeight={40}
        height={400}
        renderItem={(r) => (
          <div key={r.id} style={{ height: 40 }}>
            <Link href={`/reports/${r.id}`}>{r.bureau || 'Unknown'} - {r.status}</Link>
          </div>
        )}
      />
      <div>
        {page > 1 && <Link href={`/reports?page=${page - 1}`}>Previous</Link>}
        {page < totalPages && (
          <Link href={`/reports?page=${page + 1}`} style={{ marginLeft: 8 }}>
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
