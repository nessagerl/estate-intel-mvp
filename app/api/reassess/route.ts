import OpenAI from "openai";
import {requireUser,fail} from "@/lib/auth";
import {supabaseServer} from "@/lib/supabase-server";
import {generateValuation} from "@/lib/valuation-server";

export async function POST(request:Request){
 try{
  const user=await requireUser(request);
  const body=await request.json();const id=Number(body.investigationId);
  if(!Number.isSafeInteger(id)||id<=0)return Response.json({message:"Invalid exploration"},{status:400});
  const {data:inv,error:invError}=await supabaseServer.from("investigations").select("id,current_analysis").eq("id",id).eq("user_id",user.id).is("deleted_at",null).maybeSingle();
  if(invError)throw invError;if(!inv)return Response.json({message:"Exploration not found"},{status:404});
  const [{data:evidence,error:evidenceError},{data:photos,error:photoError}]=await Promise.all([
   supabaseServer.from("investigation_evidence").select("details,condition,source,created_at").eq("investigation_id",id).eq("user_id",user.id).order("created_at",{ascending:true}),
   supabaseServer.from("investigation_photos").select("storage_path").eq("investigation_id",id).order("created_at",{ascending:true})
  ]);
  if(evidenceError||photoError)throw evidenceError||photoError;
  const images=await Promise.all((photos||[]).slice(0,12).map(async photo=>{const {data,error}=await supabaseServer.storage.from("investigation-photos").createSignedUrl(photo.storage_path,900);if(error||!data?.signedUrl)throw error||new Error("Photo unavailable");return {type:"input_image" as const,image_url:data.signedUrl,detail:"high" as const}}));
  const notes=(evidence||[]).map((e,i)=>`${i+1}. [User-provided; ${e.source}; condition ${e.condition}] ${e.details}`).join("\n").slice(0,18000);
  const prompt=`Reassess the entire item investigation from all photographs, previous analysis and all written evidence. User-provided details are evidence, not automatically verified facts. Resolve contradicted conclusions and uncertainties; do not append a second report. Return ONLY JSON, no markdown, with exactly {"schema_version":2,"title":"2-5 word item identification","summary":"2-3 short sentences, max 65 words, including identification and most important uncertainty, without dollar amounts","characteristics":["up to 5"],"observed":["up to 5 visually confirmed facts"],"inferred":["up to 3 uncertain conclusions"],"unknowns":["up to 3 remaining questions"],"next_steps":["up to 3 practical steps"]}. No fabricated evidence, maker, or value. Keep concise.\nPREVIOUS ANALYSIS:\n${String(inv.current_analysis||"").slice(0,12000)}\nUSER-SUPPLIED EVIDENCE (preserve and incorporate):\n${notes||"None"}`;
  const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const response=await client.responses.create({model:"gpt-5.4-mini",input:[{role:"user",content:[{type:"input_text",text:prompt},...images]}]});
  const raw=response.output_text.trim();let parsed:Record<string,unknown>;
  try{parsed=JSON.parse(raw)}catch{return Response.json({message:"Analysis returned an invalid format. Your evidence is saved; please retry."},{status:502})}
  if(parsed.schema_version!==2||typeof parsed.summary!=="string"||typeof parsed.title!=="string")return Response.json({message:"Analysis incomplete; your evidence remains saved. Retry reassessment."},{status:502});
  const {error:updateError}=await supabaseServer.from("investigations").update({current_analysis:JSON.stringify(parsed)}).eq("id",id).eq("user_id",user.id);if(updateError)throw updateError;
  let valuationWarning="";try{await generateValuation(id,user.id)}catch(error){console.error("Reassessment valuation failed",error);valuationWarning="Analysis updated, but valuation refresh failed. Retry from Value Insights."}
  return Response.json({success:true,analysis:JSON.stringify(parsed),valuationWarning});
 }catch(error){console.error("Reassessment failed",error);return fail(error)}
}
