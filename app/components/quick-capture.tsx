"use client";
import {useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {authorizedFetch,supabaseBrowser} from "@/lib/supabase-browser";
export default function QuickCapture({compact=false}:{compact?:boolean}){
 const input=useRef<HTMLInputElement>(null),router=useRouter();const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function capture(file?:File){if(!file)return;setBusy(true);setError("");try{
  if(!file.type.startsWith("image/"))throw new Error("Choose a photograph.");
  if(file.size>20*1024*1024)throw new Error("Choose a photograph under 20 MB.");
  const r=await authorizedFetch("/api/upload-photo",{method:"POST"});const grant=await r.json();if(!r.ok)throw new Error(grant.message||"Please sign in to capture an item.");
  const {error:uploadError}=await supabaseBrowser.storage.from("investigation-photos").uploadToSignedUrl(grant.storagePath,grant.token,file,{contentType:file.type});if(uploadError)throw uploadError;
  const c=await authorizedFetch("/api/capture",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({storagePath:grant.storagePath})});const data=await c.json();if(!c.ok)throw new Error(data.message||"Unable to save photograph");
  router.push(`/scan?investigation=${data.investigationId}&research=${encodeURIComponent(grant.storagePath)}`);
 }catch(e){setError(e instanceof Error?e.message:"Capture failed");setBusy(false)}}
 return <div className={compact?"":"w-full"}>
  <input ref={input} type="file" accept="image/*" capture="environment" className="sr-only" aria-label="Take or choose a picture" onChange={e=>{void capture(e.target.files?.[0]);e.target.value=""}}/>
  <button type="button" disabled={busy} onClick={()=>input.current?.click()} className="ei-primary min-h-12 rounded-xl px-5 py-3 font-bold shadow-md">{busy?"Saving your photo…":"📷 Take a Picture"}</button>
  {error&&<p role="alert" className="mt-1 max-w-64 text-xs font-semibold text-red-800">{error}</p>}
 </div>;
}
