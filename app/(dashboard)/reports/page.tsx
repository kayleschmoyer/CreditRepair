import Link from 'next/link';
import Upload from './Upload';
import { createServerClient } from '../../../lib/supabase/server';
import styles from '../../../styles/shared.module.css';

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
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Credit Reports</h1>
          <p className={styles.heroSubtitle}>Upload and analyze your credit reports</p>
        </div>

        <div className={styles.section}>
          <Upload />
        </div>

        {reports.length > 0 ? (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Reports</h2>
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {reports.map((report) => (
                <Link key={report.id} href={`/reports/${report.id}`} className={styles.card} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 'var(--font-weight-semibold)' }}>
                        {report.bureau || 'Unknown Bureau'}
                      </h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Status: {report.status} • {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ fontSize: '1.5rem' }}>📊</div>
                  </div>
                </Link>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)', justifyContent: 'center' }}>
                {page > 1 && (
                  <Link href={`/reports?page=${page - 1}`} className={styles.buttonSecondary}>
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`/reports?page=${page + 1}`} className={styles.button}>
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <h3>No reports uploaded yet</h3>
            <p>Upload your first credit report to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
