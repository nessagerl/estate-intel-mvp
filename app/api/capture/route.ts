import {requireUser,fail} from "@/lib/auth";
import {supabaseServer} from "@/lib/supabase-server";
export async function POST(request:Request){try{
 const user=await requireUser(request);const {storagePath}=await request.json();
 if(typeof storagePath!=="string"||!storagePath.startsWith(`${user.id}/incoming/`))return Response.json({message:"Invalid photograph"},{status:400});
 const {data:file}=await supabaseServer.storage.from("investigation-photos").info(storagePath);
 if(!file)return Response.json({message:"Photo upload not found"},{status:400});
 const {data:inv,error}=await supabaseServer.from("investigations").insert({user_id:user.id,status:"active",current_analysis:""}).select("id").single();if(error)throw error;
 const {error:photoError}=await supabaseServer.from("investigation_photos").insert({investigation_id:inv.id,storage_path:storagePath});if(photoError)throw photoError;
 const {data:asset, error:assetError}=await supabaseServer.from("assets").insert({user_id:user.id,investigation_id:inv.id,name:"New Item"}).select("id").single();
 if(assetError)throw assetError;
 const {error:linkError}=await supabaseServer.from("asset_investigations").upsert({asset_id:asset.id,investigation_id:inv.id,relationship:"original"},{onConflict:"asset_id,investigation_id",ignoreDuplicates:true});if(linkError)throw linkError;
 return Response.json({investigationId:inv.id,assetId:asset.id});
 }catch(e){console.error("Capture failed",e);return fail(e)}}
