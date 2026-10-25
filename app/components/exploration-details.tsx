"use client";
import {useState} from "react";
import {authorizedFetch} from "@/lib/supabase-browser";
export default function ExplorationDetails({investigationId,researching,onUpdated,onQueued}:{investigationId:number;researching:boolean;onUpdated:(analysis:string)=>void;onQueued:()=>void}){
 const [details,setDetails]=useState(""),[condition,setCondition]=useState("unknown"),[source,setSource]=useState("personal"),[busy,setBusy]=useState(false),[status,setStatus]=useState(""),[error,setError]=useState("");
 async function submit(){if(!details.trim())return;setBusy(true);setError("");setStatus("");try{
 const r=await authorizedFetch("/api/evidence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({investigationId,details,condition,source})});const d=await r.json();if(!r.ok)throw new Error(d.message||"Could not save details");
 setDetails("");setStatus("✓ New information saved. Updating all insights…");
 if(researching){onQueued();setStatus("✓ New information saved. We'll reassess after the current research finishes.");return}
 const v=await authorizedFetch("/api/reassess",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({investigationId})});const result=await v.json();if(!v.ok)throw new Error(result.message||"Research update failed. Your details are safely saved; retry the analysis.");onUpdated(result.analysis);setStatus("✓ Item Insights updated with your new information.");
 }catch(e){setError(e instanceof Error?e.message:"Unable to update insights")}finally{setBusy(false)}}
 return <details id="add-details" className="rounded-2xl border border-[#b59864] bg-white p-4"><summary className="cursor-pointer text-lg font-bold">+ Add Details</summary>
 <p className="mt-2 text-sm">Add information now, even while initial research is running. Your details are saved before analysis starts.</p>
 <textarea className="mt-3 w-full rounded-xl border p-3" rows={3} maxLength={4000} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Maker, marks, measurements, condition, history, or anything you know…"/>
 <div className="mt-2 grid gap-2 sm:grid-cols-2"><label className="text-sm">Condition<select className="mt-1 w-full rounded-lg border p-2" value={condition} onChange={e=>setCondition(e.target.value)}>{["unknown","excellent","good","fair","poor"].map(x=><option key={x}>{x}</option>)}</select></label><label className="text-sm">Source<select className="mt-1 w-full rounded-lg border p-2" value={source} onChange={e=>setSource(e.target.value)}>{[["personal","Personal knowledge"],["family","Family history"],["document","Receipt / document"],["appraisal","Professional appraisal"],["other","Other"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></div>
 <button onClick={()=>void submit()} disabled={busy||!details.trim()} className="ei-primary mt-3 min-h-11 rounded-xl px-4 py-3 font-bold">{busy?"Saving and researching…":"Save Details & Update Insights"}</button>
 {status&&<p role="status" className="mt-2 text-sm font-semibold text-green-800">{status}</p>}{error&&<p role="alert" className="mt-2 text-sm font-semibold text-red-800">{error}</p>}
 </details>;
}
