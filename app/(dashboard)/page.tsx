import { createServerClient } from '../../lib/supabase/server';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default async function Dashboard() {
  const supabase = createServerClient();
  const { data: disputes } = await supabase.from('disputes').select('id, status').limit(10);
  const { data: notifications } = await supabase.from('notifications').select('id').eq('read', false);
  const { data: reports } = await supabase.from('credit_reports').select('id');
  const { data: profile } = await supabase.from('profiles').select('display_name').single();
  
  const activeDisputes = disputes?.filter(d => d.status === 'sent').length || 0;
  const totalDisputes = disputes?.length || 0;
  const unreadNotifications = notifications?.length || 0;
  const totalReports = reports?.length || 0;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <Link href="/" className={styles.brand}>
            <div className={styles.brandIcon}>E</div>
            <span className={styles.brandText}>Elite Credit</span>
          </Link>
          <nav className={styles.nav}>
            <Link href="/" className={`${styles.navLink} ${styles.active}`}>Dashboard</Link>
            <Link href="/reports" className={styles.navLink}>Reports</Link>
            <Link href="/disputes" className={styles.navLink}>Disputes</Link>
            <Link href="/simulate" className={styles.navLink}>Simulator</Link>
            <Link href="/settings" className={styles.navLink}>Settings</Link>
          </nav>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Welcome back, {profile?.display_name || 'User'}</h1>
          <p className={styles.heroSubtitle}>Your credit repair journey continues</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3 className={styles.statTitle}>Active Disputes</h3>
              <div className={styles.statIcon}>⚖️</div>
            </div>
            <div className={styles.statValue}>{activeDisputes}</div>
            <div className={styles.statChange}>In progress</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3 className={styles.statTitle}>Notifications</h3>
              <div className={styles.statIcon}>🔔</div>
            </div>
            <div className={styles.statValue}>{unreadNotifications}</div>
            <div className={styles.statChange}>Unread</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3 className={styles.statTitle}>Credit Reports</h3>
              <div className={styles.statIcon}>📊</div>
            </div>
            <div className={styles.statValue}>{totalReports}</div>
            <div className={styles.statChange}>Uploaded</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3 className={styles.statTitle}>Credit Score</h3>
              <div className={styles.statIcon}>📈</div>
            </div>
            <div className={styles.statValue}>750</div>
            <div className={styles.statChange}>+25 this month</div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Link href="/reports" className={styles.actionCard}>
              <div className={styles.actionIcon}>📄</div>
              <h3 className={styles.actionTitle}>Upload Report</h3>
              <p className={styles.actionDescription}>Analyze your latest credit report for dispute opportunities</p>
            </Link>
            <Link href="/disputes" className={styles.actionCard}>
              <div className={styles.actionIcon}>⚖️</div>
              <h3 className={styles.actionTitle}>Manage Disputes</h3>
              <p className={styles.actionDescription}>Track progress and manage your active dispute cases</p>
            </Link>
            <Link href="/simulate" className={styles.actionCard}>
              <div className={styles.actionIcon}>🎯</div>
              <h3 className={styles.actionTitle}>Score Simulator</h3>
              <p className={styles.actionDescription}>Predict how actions will impact your credit score</p>
            </Link>
            <Link href="/settings" className={styles.actionCard}>
              <div className={styles.actionIcon}>⚙️</div>
              <h3 className={styles.actionTitle}>Settings</h3>
              <p className={styles.actionDescription}>Update profile and account preferences</p>
            </Link>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          {totalDisputes > 0 ? (
            <ul className={styles.activityList}>
              <li className={styles.activityItem}>
                <div className={styles.activityIcon}>📝</div>
                <div className={styles.activityContent}>
                  <h4>Dispute Letter Generated</h4>
                  <p>Successfully created dispute letter for Equifax</p>
                </div>
              </li>
              <li className={styles.activityItem}>
                <div className={styles.activityIcon}>📊</div>
                <div className={styles.activityContent}>
                  <h4>Credit Report Analyzed</h4>
                  <p>Found 3 potential dispute candidates</p>
                </div>
              </li>
              <li className={styles.activityItem}>
                <div className={styles.activityIcon}>✅</div>
                <div className={styles.activityContent}>
                  <h4>Profile Updated</h4>
                  <p>Personal information successfully updated</p>
                </div>
              </li>
            </ul>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <h3>No recent activity</h3>
              <p>Start by uploading your first credit report</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
