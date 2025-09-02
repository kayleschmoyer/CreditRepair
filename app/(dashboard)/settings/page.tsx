import { createServerClient } from "../../../lib/supabase/server";
import { logAccess } from "../../../lib/supabase/access-log";
import FormWithToast from "../../../components/FormWithToast";
import { updateProfile, deleteMyData } from "./actions";
import styles from '../../../styles/shared.module.css';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = createServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .single();
  if (profile) {
    await logAccess(supabase, profile.id, "profiles");
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Settings</h1>
          <p className={styles.heroSubtitle}>Manage your profile and account preferences</p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile Information</h2>
          <FormWithToast action={updateProfile}>
            <div style={{ display: 'grid', gap: 'var(--space-md)', maxWidth: '500px' }}>
              <div>
                <label className={styles.label}>Full Name</label>
                <input
                  className={styles.input}
                  name="display_name"
                  defaultValue={profile?.display_name || ""}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className={styles.label}>Address</label>
                <input
                  className={styles.input}
                  name="address_line1"
                  defaultValue={profile?.address_line1 || ""}
                  placeholder="Street address"
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
                <div>
                  <label className={styles.label}>City</label>
                  <input
                    className={styles.input}
                    name="city"
                    defaultValue={profile?.city || ""}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className={styles.label}>State</label>
                  <input
                    className={styles.input}
                    name="state"
                    defaultValue={profile?.state || ""}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className={styles.label}>Postal Code</label>
                  <input
                    className={styles.input}
                    name="postal_code"
                    defaultValue={profile?.postal_code || ""}
                    placeholder="ZIP"
                  />
                </div>
              </div>
              
              <button type="submit" className={styles.button}>
                Save Changes
              </button>
            </div>
          </FormWithToast>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Management</h2>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <Link href="/api/export-my-data" className={styles.buttonSecondary}>
              📥 Export My Data
            </Link>
            <Link href="/settings/logs" className={styles.buttonSecondary}>
              📋 View Activity Logs
            </Link>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Danger Zone</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
            This action cannot be undone. All your data will be permanently deleted.
          </p>
          <FormWithToast action={deleteMyData}>
            <button 
              type="submit" 
              style={{
                background: 'var(--accent-orange)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-sm) var(--space-lg)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🗑️ Delete All My Data
            </button>
          </FormWithToast>
        </div>
      </div>
    </div>
  );
}
