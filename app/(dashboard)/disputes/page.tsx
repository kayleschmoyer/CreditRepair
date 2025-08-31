import Link from 'next/link';
import { createServerClient } from '../../../lib/supabase/server';

export default async function DisputesPage() {
  const supabase = createServerClient();
  const { data } = await supabase.from('disputes').select('*').order('created_at', { ascending: false });
  return (
    <div>
      <h1>Disputes</h1>
      <ul>
        {data?.map(d => (
          <li key={d.id}><Link href={`/disputes/${d.id}`}>{d.status}</Link></li>
        ))}
      </ul>
    </div>
  );
}
