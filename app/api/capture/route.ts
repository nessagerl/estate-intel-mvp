import {requireUser,fail} from "@/lib/auth";
import {supabaseServer} from "@/lib/supabase-server";
export async function POST(request:Request){try{
 const user=await requireUser(request);const {storagePath}=await request.json();
 if(typeof storagePath!=="string"||!storagePath.startsWith(`${user.id}/incoming/`))return Response.json({message:"Invalid photograph"},{status:400});
 const {data:file}=await supabaseServer.storage.from("investigation-photos").info(storagePath);
 if(!file)return Response.json({message:"Photo upload not found"},{status:400});
 const {data:inv,error}=await supabaseServer.from("investigations").insert({user_id:user.id,status:"active",current_analysis:""}).select("id").single();if(error)throw error;
 const {error:photoError}=await supabaseServer.from("investigation_photos").insert({investigation_id:inv.id,storage_path:storagePath});if(photoError)throw photoError;
 return Response.json({investigationId:inv.id});
 }catch(e){console.error("Capture failed",e);return fail(e)}}
