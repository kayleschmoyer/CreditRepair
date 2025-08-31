import JSZip from 'jszip';
import { createServerClient } from '../../../lib/supabase/server';

export async function GET() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const tables = [
    'profiles',
    'credit_reports',
    'tradelines',
    'dispute_candidates',
    'disputes',
    'notifications',
    'audit_access',
    'consents'
  ];
  const exported: Record<string, unknown> = {};
  for (const table of tables) {
    const { data } = await supabase.from(table).select('*');
    exported[table] = data ?? [];
  }
  const zip = new JSZip();
  zip.file('data.json', JSON.stringify(exported, null, 2));
  const { data: files } = await supabase.storage
    .from('letters')
    .list(`users/${user.id}`);
  if (files) {
    for (const f of files) {
      const { data: fileData } = await supabase.storage
        .from('letters')
        .download(`users/${user.id}/${f.name}`);
      if (fileData) {
        const buf = await fileData.arrayBuffer();
        zip.file(`letters/${f.name}`, buf);
      }
    }
  }
  const content = await zip.generateAsync({ type: 'arraybuffer' });
  return new Response(Buffer.from(content), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="export.zip"',
    },
  });
}
