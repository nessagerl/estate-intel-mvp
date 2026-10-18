import { createClient } from "@supabase/supabase-js";
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export async function authorizedFetch(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabaseBrowser.auth.getSession();
  if (!session) throw new Error("Please sign in first.");
  return fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${session.access_token}` } });
}
