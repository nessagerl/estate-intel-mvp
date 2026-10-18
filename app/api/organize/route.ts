import { supabaseServer } from "@/lib/supabase-server";
import { requireUser, fail } from "@/lib/auth";
export async function POST(request:Request) {
 try { const user=await requireUser(request);const {investigationId,homeId,roomId}=await request.json();const {data:home}=await supabaseServer.from("homes").select("id").eq("id",homeId).eq("user_id",user.id).maybeSingle();if(!home)return Response.json({success:false,message:"Home not found"},{status:404});if(roomId){const {data:room}=await supabaseServer.from("rooms").select("id").eq("id",roomId).eq("home_id",homeId).maybeSingle();if(!room)return Response.json({success:false,message:"Room not found"},{status:404})}const {data,error}=await supabaseServer.from("investigations").update({home_id:homeId,room_id:roomId||null}).eq("id",investigationId).eq("user_id",user.id).select("id").single();if(error)throw error;return Response.json({success:true,investigation:data}); } catch(e){return fail(e)}
}
