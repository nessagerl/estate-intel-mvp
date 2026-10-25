import { supabaseServer } from "@/lib/supabase-server";
import { requireUser, fail } from "@/lib/auth";
export async function GET(request: Request) {
 try {
  const user = await requireUser(request);
  const { data: investigations, error } = await supabaseServer.from("investigations").select("id,created_at,current_analysis,home_id,room_id,title").eq("user_id",user.id).is("deleted_at",null).order("created_at",{ascending:false});
  if (error) throw error;
  const { data: assets, error: assetError } = await supabaseServer.from("assets").select("id,investigation_id,name").eq("user_id",user.id).is("deleted_at",null);
  if (assetError) throw assetError;
  const {data:links,error:linksError}=await supabaseServer.from('asset_investigations').select('investigation_id,asset_id');
  if(linksError)throw linksError;
  const ownedIds=new Set((assets||[]).map(a=>a.id));
  const savedIds=new Set([...(assets||[]).map(a=>a.investigation_id),...(links||[]).filter(l=>ownedIds.has(l.asset_id)).map(l=>l.investigation_id)]);
  const items = await Promise.all((investigations || []).map(async inv => {
    const { data: photos } = await supabaseServer.from("investigation_photos").select("storage_path").eq("investigation_id",inv.id).order("created_at",{ascending:true}).limit(1);
    const path = photos?.[0]?.storage_path;
    const { data: signed } = path ? await supabaseServer.storage.from("investigation-photos").createSignedUrl(path,3600) : {data:null};
    return { ...inv, imageUrl: signed?.signedUrl || null, saved: savedIds.has(inv.id) };
  }));
  return Response.json({success:true, items});
 } catch(error) { return fail(error); }
}
