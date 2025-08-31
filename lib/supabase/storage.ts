import { createServerClient } from './server';

export async function getSignedUrl(
  bucket: string,
  userId: string,
  path: string,
  expires = 60
) {
  if (!path.startsWith(`users/${userId}/`)) {
    throw new Error('Invalid path');
  }
  const supabase = createServerClient();
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expires);
  return data?.signedUrl;
}
