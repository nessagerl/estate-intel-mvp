import OpenAI from "openai";
import {supabaseServer} from "@/lib/supabase-server";
import {requireUser,fail} from "@/lib/auth";
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
export async function POST(request:Request){try{
 const user=await requireUser(request);const{storagePath,investigationId}=await request.json();
 if(typeof storagePath!=="string"||!storagePath.startsWith(`${user.id}/incoming/`)||!Number.isSafeInteger(investigationId))return Response.json({message:"Invalid photo or investigation."},{status:400});
 const{data:investigation}=await supabaseServer.from("investigations").select("id,current_analysis").eq("id",investigationId).eq("user_id",user.id).single();if(!investigation)return Response.json({message:"Investigation not found."},{status:404});
 const{data:photos,error}=await supabaseServer.from("investigation_photos").select("storage_path").eq("investigation_id",investigationId).order("created_at",{ascending:true}).limit(2);if(error)throw error;
 if(!photos?.length)return Response.json({decision:"uncertain",reason:"No reference photograph available."});
 const paths=[photos[0].storage_path,storagePath];if(paths.some(path=>!path.startsWith(`${user.id}/incoming/`)))return Response.json({message:"Photo ownership mismatch."},{status:403});
 const images=await Promise.all(paths.map(async path=>{const{data,error}=await supabaseServer.storage.from("investigation-photos").createSignedUrl(path,600);if(error||!data?.signedUrl)throw error||new Error("Photo unavailable");return{type:"input_image" as const,image_url:data.signedUrl,detail:"low" as const}}));
 const response=await openai.responses.create({model:"gpt-5.4-mini",input:[{role:"user",content:[{type:"input_text",text:`Compare two photographs of household objects. First photo is from the existing investigation. Second is newly uploaded. Determine whether they depict the SAME primary physical object, a DIFFERENT primary object, or if UNCERTAIN (including multiple objects, matching sets, ambiguous close-ups). Ignore background objects. Existing investigation summary: ${String(investigation.current_analysis||"").slice(0,1300)}. Return ONLY a JSON object with decision ("same", "different", or "uncertain") and reason (short, plain English). Prefer uncertain over an unsupported conclusion.`},...images]}]});
 let result:{decision?:string;reason?:string}={};try{result=JSON.parse(response.output_text.replace(/^```(?:json)?\s*|\s*```$/g,""))}catch{}const decision=["same","different","uncertain"].includes(result.decision||"")?result.decision:"uncertain";return Response.json({decision,reason:typeof result.reason==="string"?result.reason.slice(0,300):"Please confirm where this photo belongs."});
 }catch(error){console.error("Photo comparison error",error);return fail(error)}}
