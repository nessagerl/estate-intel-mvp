import {requireUser,fail} from "@/lib/auth";
import {supabaseServer} from "@/lib/supabase-server";
export async function POST(request:Request){try{
 const user=await requireUser(request);const body=await request.json();const investigationId=Number(body.investigationId);const removeExploration=body.removeExploration===true;
 if(!Number.isSafeInteger(investigationId)||investigationId<=0)return Response.json({message:"Invalid exploration"},{status:400});
 const {data:inv}=await supabaseServer.from("investigations").select("id").eq("id",investigationId).eq("user_id",user.id).is("deleted_at",null).maybeSingle();if(!inv)return Response.json({message:"Exploration not found"},{status:404});
 const {data:links,error:linkError}=await supabaseServer.from("asset_investigations").select("asset_id").eq("investigation_id",investigationId);if(linkError)throw linkError;
 const ids=[...new Set((links||[]).map(l=>l.asset_id))];
 const {data:assets,error:assetError}=ids.length?await supabaseServer.from("assets").select("id").eq("user_id",user.id).is("deleted_at",null).in("id",ids):{data:[],error:null};if(assetError)throw assetError;
 const activeIds=(assets||[]).map(a=>a.id);
 if(activeIds.length>1)return Response.json({message:"This exploration is linked to multiple items. Manage the links individually before removal."},{status:409});
 if(activeIds.length){const {error}=await supabaseServer.from("assets").update({deleted_at:new Date().toISOString()}).eq("id",activeIds[0]).eq("user_id",user.id).is("deleted_at",null);if(error)throw error;}
 if(removeExploration){const {error}=await supabaseServer.from("investigations").update({deleted_at:new Date().toISOString()}).eq("id",investigationId).eq("user_id",user.id).is("deleted_at",null);if(error)throw error;}
 return Response.json({success:true,removedExploration:removeExploration});
 }catch(error){return fail(error)}}
