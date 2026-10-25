import {supabaseServer} from '@/lib/supabase-server';
import {requireUser,fail} from '@/lib/auth';
import {classifyAsset} from '@/lib/asset-classification';
async function owned(assetId:number,userId:string){const {data}=await supabaseServer.from('assets').select('id,category,category_source,asset_investigations(investigation_id)').eq('id',assetId).eq('user_id',userId).is('deleted_at',null).maybeSingle();return data}
export async function GET(request:Request){try{const user=await requireUser(request);const assetId=Number(new URL(request.url).searchParams.get('assetId'));if(!Number.isSafeInteger(assetId)||assetId<1)return Response.json({message:'Invalid item'},{status:400});const asset=await owned(assetId,user.id);if(!asset)return Response.json({message:'Item not found'},{status:404});const {data:tags,error}=await supabaseServer.from('asset_tags').select('name,source').eq('asset_id',assetId).eq('user_id',user.id).order('created_at');if(error)throw error;return Response.json({category:asset.category||'',tags:tags||[]});}catch(e){return fail(e)}}
export async function POST(request:Request){try{const user=await requireUser(request);const b=await request.json();const assetId=Number(b.assetId);if(!Number.isSafeInteger(assetId)||assetId<1)return Response.json({message:'Invalid item'},{status:400});const asset=await owned(assetId,user.id);if(!asset)return Response.json({message:'Item not found'},{status:404});if(b.action==='category'){
 const category=String(b.category||'').trim().slice(0,80);
 const {error}=await supabaseServer.from('assets').update({category:category||null,category_source:'user'}).eq('id',assetId).eq('user_id',user.id);if(error)throw error;return Response.json({success:true});}
 if(b.action==='add'||b.action==='remove'){
 const name=String(b.name||'').trim().slice(0,60);if(!name)return Response.json({message:'Tag required'},{status:400});
 if(b.action==='remove'){
 const {error}=await supabaseServer.from('asset_tags').delete().eq('asset_id',assetId).eq('user_id',user.id).ilike('name',name);if(error)throw error;
 await supabaseServer.from('asset_tag_rejections').upsert({asset_id:assetId,user_id:user.id,name},{onConflict:'asset_id,name'});
 }else{
 await supabaseServer.from('asset_tag_rejections').delete().eq('asset_id',assetId).eq('user_id',user.id).ilike('name',name);
 const {error}=await supabaseServer.from('asset_tags').upsert({asset_id:assetId,user_id:user.id,name,source:'user'},{onConflict:'asset_id,name'});if(error)throw error;
 }return Response.json({success:true});}
 if(b.action==='suggest'){
 const inv=asset.asset_investigations?.[0]?.investigation_id;
 if(!inv)return Response.json({message:'No linked exploration'},{status:400});
 const {data:analysis}=await supabaseServer.from('investigations').select('current_analysis').eq('id',inv).eq('user_id',user.id).maybeSingle();
 if(!analysis)return Response.json({message:'Exploration not found'},{status:404});
 const result=await classifyAsset(assetId,user.id,analysis.current_analysis||'');return Response.json({success:true,...result});}
 return Response.json({message:'Invalid action'},{status:400});}catch(e){return fail(e)}}
