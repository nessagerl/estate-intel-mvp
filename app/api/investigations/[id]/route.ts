import {supabaseServer} from '@/lib/supabase-server';
import {requireUser,fail} from '@/lib/auth';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const user=await requireUser(request);const {id:raw}=await params;const id=Number(raw);
 if(!Number.isSafeInteger(id)||id<=0)return Response.json({message:'Invalid investigation'},{status:400});
 const {data:inv,error}=await supabaseServer.from('investigations').select('id,created_at,current_analysis,home_id,room_id,title').eq('id',id).eq('user_id',user.id).is('deleted_at',null).maybeSingle();if(error)throw error;if(!inv)return Response.json({message:'Investigation not found'},{status:404});
 const {data:photos,error:photoError}=await supabaseServer.from('investigation_photos').select('id,storage_path,created_at').eq('investigation_id',id).order('created_at',{ascending:true});if(photoError)throw photoError;
 const images=await Promise.all((photos||[]).map(async photo=>{const {data}=await supabaseServer.storage.from('investigation-photos').createSignedUrl(photo.storage_path,3600);return {id:photo.id,url:data?.signedUrl||null}}));
 const {data:links,error:linkError}=await supabaseServer.from('asset_investigations').select('asset_id').eq('investigation_id',id);if(linkError)throw linkError;const ids=(links||[]).map(x=>x.asset_id);const {data:assets,error:assetError}=ids.length?await supabaseServer.from('assets').select('id').eq('user_id',user.id).in('id',ids):{data:[],error:null};if(assetError)throw assetError;
 return Response.json({investigation:inv,images,assets:assets||[]});
 }catch(e){console.error('Investigation detail error',e);return fail(e)}}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const user=await requireUser(request);const {id:raw}=await params;const id=Number(raw);const body=await request.json();const title=String(body.title||'').trim();if(!Number.isSafeInteger(id)||id<=0||!title||title.length>160)return Response.json({message:'Enter a title up to 160 characters'},{status:400});
 const {data,error}=await supabaseServer.from('investigations').update({title}).eq('id',id).eq('user_id',user.id).select('id').maybeSingle();if(error)throw error;if(!data)return Response.json({message:'Not found'},{status:404});return Response.json({success:true});
 }catch(e){console.error('Investigation rename error',e);return fail(e)}}
