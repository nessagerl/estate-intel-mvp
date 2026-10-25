import { supabaseServer } from "@/lib/supabase-server";
import { requireUser, fail } from "@/lib/auth";
import {shortAssetName} from "@/lib/asset-short-name";
import {classifyAsset} from "@/lib/asset-classification";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const investigationId = Number(body.investigationId);
    const existingAssetId = body.assetId == null ? null : Number(body.assetId);
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 160) : "";
    if (!Number.isSafeInteger(investigationId) || investigationId <= 0 ||
        (existingAssetId !== null && (!Number.isSafeInteger(existingAssetId) || existingAssetId <= 0))) {
      return Response.json({ success: false, message: "Invalid investigation or asset." }, { status: 400 });
    }
    const { data: investigation, error: investigationError } = await supabaseServer
      .from("investigations").select("id,title,current_analysis").eq("id", investigationId)
      .eq("user_id", user.id).is("deleted_at",null).maybeSingle();
    if (investigationError) throw investigationError;
    if (!investigation) return Response.json({ success: false, message: "Investigation not found." }, { status: 404 });

    // Idempotent direct-save: return an already linked active asset instead of duplicating it.
    if(existingAssetId===null){
      const {data:links}=await supabaseServer.from('asset_investigations').select('asset_id').eq('investigation_id',investigationId);
      const linkedIds=(links||[]).map(x=>x.asset_id);
      if(linkedIds.length){const {data:existing}=await supabaseServer.from('assets').select('id').eq('user_id',user.id).is('deleted_at',null).in('id',linkedIds).limit(1).maybeSingle();if(existing){try{await classifyAsset(existing.id,user.id,investigation.current_analysis||'')}catch(error){console.warn('Tag refresh failed',error)}return Response.json({success:true,asset:{id:existing.id},created:false});}}
      const {data:legacy}=await supabaseServer.from('assets').select('id').eq('user_id',user.id).eq('investigation_id',investigationId).is('deleted_at',null).limit(1).maybeSingle();
      if(legacy){try{await classifyAsset(legacy.id,user.id,investigation.current_analysis||'')}catch(error){console.warn('Tag refresh failed',error)}return Response.json({success:true,asset:{id:legacy.id},created:false});}
    }
    let assetId = existingAssetId;
    let created = false;
    if (assetId !== null) {
      const { data: asset, error } = await supabaseServer.from("assets")
        .select("id").eq("id", assetId).eq("user_id", user.id).is("deleted_at",null).maybeSingle();
      if (error) throw error;
      if (!asset) return Response.json({ success: false, message: "Asset not found." }, { status: 404 });
    } else {
      // A single investigation may produce multiple distinct assets.
      const { data: asset, error } = await supabaseServer.from("assets")
        .insert({ investigation_id: investigationId, user_id: user.id, name: name || shortAssetName(investigation.current_analysis,investigation.title) })
        .select("id").single();
      if (error) throw error;
      assetId = asset.id;
      created = true;
    }
    const { error: linkError } = await supabaseServer.from("asset_investigations")
      .upsert({ asset_id: assetId, investigation_id: investigationId,
        relationship: created ? "original" : "evidence" },
        { onConflict: "asset_id,investigation_id", ignoreDuplicates: true });
    if (linkError) throw linkError;
    if(created){try{const {data:details}=await supabaseServer.from('investigations').select('current_analysis').eq('id',investigationId).eq('user_id',user.id).maybeSingle();if(details?.current_analysis)await classifyAsset(assetId!,user.id,details.current_analysis);}catch(error){console.warn('Classification unavailable; asset saved successfully',error)}}
    return Response.json({ success: true, asset: { id: assetId }, created });
  } catch (error) { return fail(error); }
}
