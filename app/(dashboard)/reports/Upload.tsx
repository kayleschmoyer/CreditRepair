'use client';
import FileUploader from '../../../components/FileUploader';
import { createClient } from '../../../lib/supabase/client';

export default function Upload() {
  const supabase = createClient();

  async function handleUploaded(path: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('credit_reports')
      .insert({ id: crypto.randomUUID(), user_id: user?.id, src_path: path })
      .select()
      .single();
    if (!error) {
      await supabase.functions.invoke('parse-report', {
        body: { reportId: data.id, userId: data.user_id, storagePath: path },
      });
    }
  }

  return <FileUploader onUploaded={handleUploaded} />;
}
