import { supabaseServer } from "@/lib/supabase-server";
export async function requireUser(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) throw new Error("Please sign in first.");
  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error || !data.user) throw new Error("Your session has expired. Sign in again.");
  return data.user;
}
export function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return Response.json({ success: false, message }, { status: /sign in|session/i.test(message) ? 401 : 500 });
}
