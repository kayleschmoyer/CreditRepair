import Link from 'next/link';
import { createServerClient } from '../../../lib/supabase/server';
import styles from '../../../styles/shared.module.css';
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

function getStatusColor(status: string) {
  switch (status) {
    case 'sent': return 'var(--accent-blue)';
    case 'draft': return 'var(--accent-orange)';
    case 'resolved': return 'var(--accent-mint)';
    default: return 'var(--text-secondary)';
  }
}

export default async function DisputesPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page || '1', 10);
  const { disputes, count } = await getDisputes(page);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Disputes</h1>
          <p className={styles.heroSubtitle}>Track and manage your credit disputes</p>
        </div>

        {disputes && disputes.length > 0 ? (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Active Disputes</h2>
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {disputes.map((dispute) => (
                <Link key={dispute.id} href={`/disputes/${dispute.id}`} className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 'var(--font-weight-semibold)' }}>
                        {dispute.bureau} Dispute
                      </h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {dispute.items?.length || 0} items • {new Date(dispute.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                      <span style={{ 
                        color: getStatusColor(dispute.status),
                        fontSize: '0.85rem',
                        fontWeight: 'var(--font-weight-medium)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {dispute.status}
                      </span>
                      <div style={{ fontSize: '1.5rem' }}>⚖️</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)', justifyContent: 'center' }}>
                {page > 1 && (
                  <Link href={`/disputes?page=${page - 1}`} className={styles.buttonSecondary}>
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`/disputes?page=${page + 1}`} className={styles.button}>
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⚖️</div>
            <h3>No disputes yet</h3>
            <p>Upload a credit report to start finding dispute opportunities</p>
            <Link href="/reports" className={styles.button} style={{ marginTop: 'var(--space-md)' }}>
              Upload Report
            </Link>
          </div>
        )}
        
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
