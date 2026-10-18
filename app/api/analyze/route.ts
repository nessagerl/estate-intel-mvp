import OpenAI from "openai";
import {generateValuation} from "@/lib/valuation-server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireUser, fail } from "@/lib/auth";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { storagePath, investigationId } = await request.json();
    if (typeof storagePath !== "string" || !storagePath.startsWith(`${user.id}/incoming/`))
      return Response.json({ success: false, message: "Invalid photo reference." }, { status: 400 });
    const { data: file } = await supabaseServer.storage.from("investigation-photos").info(storagePath);
    if (!file) return Response.json({ success: false, message: "Upload not found." }, { status: 400 });
    let id: number;
    let previous = "";
    let mode: "initial" | "followup" = "initial";
    if (investigationId != null) {
      const { data: existing, error } = await supabaseServer.from("investigations").select("id,current_analysis").eq("id", investigationId).eq("user_id", user.id).is("deleted_at",null).single();
      if (error || !existing) return Response.json({ success: false, message: "Investigation not found." }, { status: 404 });
      id = existing.id; previous = existing.current_analysis || ""; mode = "followup";
    } else {
      const { data, error } = await supabaseServer.from("investigations").insert({ user_id: user.id, status: "active", current_analysis: "" }).select("id").single();
      if (error) throw error;
      id = data.id;
    }
    const { data: existingPhotos, error: photoError } = await supabaseServer.from("investigation_photos").select("storage_path").eq("investigation_id", id).order("created_at", { ascending: true });
    if (photoError) throw photoError;
    if ((existingPhotos?.length || 0) >= 12) return Response.json({ success: false, message: "Maximum 12 photos per investigation." }, { status: 400 });
    const paths = [...(existingPhotos || []).map(x => x.storage_path), storagePath];
    const images = await Promise.all(paths.map(async path => {
      const { data, error } = await supabaseServer.storage.from("investigation-photos").createSignedUrl(path, 900);
      if (error || !data?.signedUrl) throw error || new Error("Photo unavailable");
      return { type: "input_image" as const, image_url: data.signedUrl, detail: "high" as const };
    }));
    const prompt = mode === "initial" ? `Investigate this household item from photographs. Identify visible text, marks, logos, materials, category, maker and model when evidence supports them. Separate OBSERVED, INFERRED and UNKNOWN. Use web search to verify distinctive clues, identify source names and URLs when available. Never invent details, provenance or precise value. Structure your response: WHAT IT MAY BE; VISIBLE CLUES; WHAT RESEARCH FOUND; WHAT IS STILL UNKNOWN; WHAT TO PHOTOGRAPH NEXT (specific view); CONFIDENCE (category, maker, model separately).` : `Continue the investigation using all photos. Previous analysis:
${previous}
Focus on NEW EVIDENCE, WHAT THIS RESOLVES, RESEARCH & VERIFICATION, UPDATED IDENTIFICATION, STILL UNKNOWN, BEST NEXT STEP, UPDATED CONFIDENCE. Do not invent or repeat the old report unnecessarily.`;
    const response = await openai.responses.create({ model: "gpt-5.4-mini", tools: [{ type: "web_search" }], input: [{ role: "user", content: [{ type: "input_text", text: prompt }, ...images] }] });
    const analysis = response.output_text;
    const { error: insertError } = await supabaseServer.from("investigation_photos").insert({ investigation_id: id, storage_path: storagePath });
    if (insertError) throw insertError;
    const { error: updateError } = await supabaseServer.from("investigations").update({ current_analysis: analysis }).eq("id", id).eq("user_id", user.id);
    if (updateError) throw updateError;
    let valuationUpdated=false;let valuationWarning="";try{await generateValuation(id,user.id);valuationUpdated=true;}catch(e){console.error("Automatic valuation failed",e);valuationWarning="Item analyzed, but valuation is not available yet. You can retry from Value Insights.";}return Response.json({ success: true, analysis, investigationId: id, mode, valuationUpdated, valuationWarning });
  } catch (error) { console.error("Analysis error", error); return fail(error); }
}
