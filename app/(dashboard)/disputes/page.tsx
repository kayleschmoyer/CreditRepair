import Link from 'next/link';
import { createServerClient } from '../../../lib/supabase/server';
import Card from '../../../components/Card';
import EmptyState from '../../../components/EmptyState';
import styles from './page.module.css';

export default async function DisputesPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('disputes')
    .select('*')
    .order('created_at', { ascending: false });

  if (!data || data.length === 0) {
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
      <ul className={styles.list}>
        {data.map((d) => (
          <li key={d.id}>
            <Card>
              <Link href={`/disputes/${d.id}`}>{d.status}</Link>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
