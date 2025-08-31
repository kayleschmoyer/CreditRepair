'use client';
import { useState } from 'react';
import styles from './FileUploader.module.css';
import { createClient } from '../lib/supabase/client';

interface Props {
  onUploaded: (path: string) => void;
}

export default function FileUploader({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data, error } = await supabase.storage
      .from('reports')
      .upload(`mock/${Date.now()}-${file.name}`, file);
    setUploading(false);
    if (error) {
      alert(error.message);
    } else {
      onUploaded(data.path);
    }
  }

  return (
    <div className={styles.root}>
      <input type="file" accept="application/pdf" onChange={upload} disabled={uploading} />
    </div>
  );
}
