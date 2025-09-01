import Link from 'next/link';
import { createServerClient } from '../../../lib/supabase/server';
import Card from '../../../components/Card';
import EmptyState from '../../../components/EmptyState';
import VirtualList from '../../../components/VirtualList';
import Disclaimer from '../../../components/Disclaimer';

const PAGE_SIZE = 10;

async function getDisputes(page: number) {
  const supabase = createServerClient();
  const { data, count } = await supabase
    .from('disputes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  return { disputes: data || [], count: count || 0 };
}

export default async function DisputesPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page || '1', 10);
  const { disputes, count } = await getDisputes(page);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  if (!disputes || disputes.length === 0) {
    return (
      <div>
        <h1>Disputes</h1>
        <EmptyState message="No disputes yet" />
      </div>
    );
  }

  return (
    <div>
      <h1>Disputes</h1>
      <VirtualList
        items={disputes}
        itemHeight={80}
        height={400}
        renderItem={(d) => (
          <div key={d.id} style={{ height: 80, marginBottom: 'var(--space-4)' }}>
            <Card>
              <Link href={`/disputes/${d.id}`}>{d.status}</Link>
            </Card>
          </div>
        )}
      />
      <div>
        {page > 1 && <Link href={`/disputes?page=${page - 1}`}>Previous</Link>}
        {page < totalPages && (
          <Link href={`/disputes?page=${page + 1}`} style={{ marginLeft: 8 }}>
            Next
          </Link>
        )}
      </div>
      <Disclaimer />
    </div>
  );
}
