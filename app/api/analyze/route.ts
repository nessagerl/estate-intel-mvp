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
    const prompt = `Analyze this item using all provided photos and any prior research. Return ONLY a valid JSON object, no markdown fences or commentary, with this exact structure: {"schema_version":2,"title":"short specific item name","summary":"2 or 3 short sentences, max 65 words, identifying the item and biggest uncertainty; DO NOT invent a monetary value (valuation is computed separately)","characteristics":["up to 5 short distinctive characteristics"],"observed":["up to 5 photo-verifiable facts"],"inferred":["up to 3 explicitly uncertain interpretations"],"unknowns":["up to 3 important unresolved facts"],"next_steps":["up to 3 specific ways to improve identification"]}. Keep bullets short, avoid repetition across fields, separate observed from inferred, don't invent facts or sources. If new evidence contradicts earlier findings, favor new photos. ${mode === "followup" ? "Prior research (may be legacy text or JSON): " + previous.slice(0,10000) : "This is the initial analysis."}`;
    const response = await openai.responses.create({ model: "gpt-5.4-mini", tools: [{ type: "web_search" }], input: [{ role: "user", content: [{ type: "input_text", text: prompt }, ...images] }] });
    const analysis = response.output_text;
    const { error: insertError } = await supabaseServer.from("investigation_photos").insert({ investigation_id: id, storage_path: storagePath });
    if (insertError) throw insertError;
    const { error: updateError } = await supabaseServer.from("investigations").update({ current_analysis: analysis }).eq("id", id).eq("user_id", user.id);
    if (updateError) throw updateError;
    let valuationUpdated=false;let valuationWarning="";try{await generateValuation(id,user.id);valuationUpdated=true;}catch(e){console.error("Automatic valuation failed",e);valuationWarning="Item analyzed, but valuation is not available yet. You can retry from Value Insights.";}return Response.json({ success: true, analysis, investigationId: id, mode, valuationUpdated, valuationWarning });
  } catch (error) { console.error("Analysis error", error); return fail(error); }
}
