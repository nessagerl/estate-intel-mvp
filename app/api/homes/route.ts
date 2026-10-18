import { supabaseServer } from "@/lib/supabase-server";
import { requireUser, fail } from "@/lib/auth";
export async function GET(request:Request) {
 try { const user = await requireUser(request); const {data,error}=await supabaseServer.from("homes").select("id,name,rooms(id,name)").eq("user_id",user.id).order("created_at",{ascending:false}); if(error)throw error; return Response.json({success:true,homes:data}); } catch(e){return fail(e)}
}
export async function POST(request:Request) {
 try { const user=await requireUser(request);const {name}=await request.json();if(typeof name!=="string"||!name.trim()||name.length>100)return Response.json({success:false,message:"Enter a home name"},{status:400});const {data,error}=await supabaseServer.from("homes").insert({name:name.trim(),user_id:user.id}).select().single();if(error)throw error;return Response.json({success:true,home:data}); } catch(e){return fail(e)}
}

export async function PATCH(request:Request){try{const user=await requireUser(request);const b=await request.json();const id=Number(b.id),name=String(b.name||'').trim();if(!Number.isSafeInteger(id)||id<=0||!name||name.length>100)return Response.json({message:'Enter a valid home name'},{status:400});const {data,error}=await supabaseServer.from('homes').update({name}).eq('id',id).eq('user_id',user.id).select('id').maybeSingle();if(error)throw error;return data?Response.json({success:true}):Response.json({message:'Home not found'},{status:404})}catch(e){console.error('Rename home error',e);return fail(e)}}
