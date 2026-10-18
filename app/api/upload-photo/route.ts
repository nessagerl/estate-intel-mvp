import { supabaseServer } from "@/lib/supabase-server";
import { requireUser, fail } from "@/lib/auth";
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const path = `${user.id}/incoming/${crypto.randomUUID()}`;
    const { data, error } = await supabaseServer.storage.from("investigation-photos").createSignedUploadUrl(path);
    if (error) throw error;
    return Response.json({ success: true, storagePath: path, token: data.token });
  } catch (error) { return fail(error); }
}
