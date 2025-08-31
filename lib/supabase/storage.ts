import { createServerClient } from './server';

export async function getSignedUrl(bucket: string, path: string, expires = 60) {
  const supabase = createServerClient();
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, expires);
  return data?.signedUrl;
}
