import { supabaseServer } from '@/lib/supabase-server';
import { requireUser, fail } from '@/lib/auth';
const validId=(x:unknown)=>Number.isSafeInteger(Number(x))&&Number(x)>0;
export async function GET(request:Request){
 try{
  const user=await requireUser(request);const url=new URL(request.url);
  const kind=url.searchParams.get('kind'),id=Number(url.searchParams.get('id'));
  if(!['home','collection'].includes(kind||'')||!validId(id))return Response.json({message:'Invalid request'},{status:400});
  if(kind==='home'){
   const {data:home,error}=await supabaseServer.from('homes').select('id,name').eq('id',id).eq('user_id',user.id).maybeSingle();
   if(error)throw error;if(!home)return Response.json({message:'Home not found'},{status:404});
   const [rooms,assets,explorations,homes,collections]=await Promise.all([
    supabaseServer.from('rooms').select('id',{count:'exact',head:true}).eq('home_id',id),
    supabaseServer.from('assets').select('id',{count:'exact',head:true}).eq('user_id',user.id).eq('home_id',id).is('deleted_at',null),
    supabaseServer.from('investigations').select('id',{count:'exact',head:true}).eq('user_id',user.id).eq('home_id',id).is('deleted_at',null),
    supabaseServer.from('homes').select('id,name').eq('user_id',user.id).neq('id',id),
    supabaseServer.from('collections').select('id').eq('user_id',user.id)
   ]);
   for(const r of [rooms,assets,explorations,homes,collections])if(r.error)throw r.error;
   return Response.json({name:home.name,counts:{rooms:rooms.count||0,assets:assets.count||0,explorations:explorations.count||0},destinations:homes.data||[],notice:'Rooms will be removed. Explorations and photos are retained. Transferred assets lose their old room assignment.'});
  }
  const {data:collection,error}=await supabaseServer.from('collections').select('id,name').eq('id',id).eq('user_id',user.id).maybeSingle();
  if(error)throw error;if(!collection)return Response.json({message:'Collection not found'},{status:404});
  const [members,others]=await Promise.all([supabaseServer.from('collection_assets').select('asset_id').eq('collection_id',id),supabaseServer.from('collections').select('id,name').eq('user_id',user.id).neq('id',id)]);
  if(members.error)throw members.error;if(others.error)throw others.error;
  const ids=(members.data||[]).map(x=>x.asset_id);let active=0,shared=0;
  if(ids.length){
   const [a,links]=await Promise.all([supabaseServer.from('assets').select('id').eq('user_id',user.id).is('deleted_at',null).in('id',ids),supabaseServer.from('collection_assets').select('asset_id,collection_id').in('asset_id',ids).neq('collection_id',id)]);
   if(a.error)throw a.error;if(links.error)throw links.error;
   const activeIds=new Set((a.data||[]).map(x=>x.id));active=activeIds.size;
   shared=new Set((links.data||[]).filter(x=>activeIds.has(x.asset_id)).map(x=>x.asset_id)).size;
  }
  return Response.json({name:collection.name,counts:{assets:active,shared,exclusive:active-shared},destinations:others.data||[],notice:'Shared items remain active in their other collections. Explorations and photos are retained.'});
 }catch(e){return fail(e)}
}
export async function POST(request:Request){
 try{
  const user=await requireUser(request);const b=await request.json();
  if(!['home','collection'].includes(b.kind)||!validId(b.id)||!['transfer','unassign','trash'].includes(b.action)||
    (b.action==='transfer'&&!validId(b.destinationId)))return Response.json({message:'Invalid deletion options'},{status:400});
  const {data,error}=await supabaseServer.rpc('manage_inventory_container',{
   p_user_id:user.id,p_kind:b.kind,p_id:Number(b.id),p_action:b.action,p_destination_id:b.action==='transfer'?Number(b.destinationId):null
  });
  if(error)throw error;return Response.json(data);
 }catch(e){return fail(e)}
}
