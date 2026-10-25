"use client";
import {useRef,useState} from "react";
import {authorizedFetch,supabaseBrowser} from "@/lib/supabase-browser";

const MAX_WAIT_MS=25000;
async function timed<T>(task:PromiseLike<T>,message:string):Promise<T>{
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{return await Promise.race([Promise.resolve(task),new Promise<T>((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),MAX_WAIT_MS)})]);}
 finally{if(timer)clearTimeout(timer)}
}
async function responseData(response:Response){
 const data=await response.json().catch(()=>({message:"The server returned an unreadable response."}));
 if(!response.ok)throw new Error(data.message||`Request failed (${response.status}).`);
 return data;
}
export default function QuickCapture({compact=false}:{compact?:boolean}){
 const input=useRef<HTMLInputElement>(null);
 const[busy,setBusy]=useState(false),[stage,setStage]=useState(""),[error,setError]=useState("");
 async function capture(file?:File){
  if(!file||busy)return;
  setBusy(true);setError("");
  try{
   if(!file.type.startsWith("image/"))throw new Error("Choose a photograph.");
   if(file.size>20*1024*1024)throw new Error("Choose a photograph under 20 MB.");
   setStage("Preparing secure upload…");
   const grant=await responseData(await timed(authorizedFetch("/api/upload-photo",{method:"POST"}),"Preparing the upload took too long. Check your connection and try again."));
   setStage("Uploading photograph…");
   const {error:uploadError}=await timed(supabaseBrowser.storage.from("investigation-photos").uploadToSignedUrl(grant.storagePath,grant.token,file,{contentType:file.type}),"Photo upload took too long. Check your connection and try again.");
   if(uploadError)throw uploadError;
   setStage("Creating exploration…");
   const saved=await responseData(await timed(authorizedFetch("/api/capture",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({storagePath:grant.storagePath})}),"The photo uploaded, but creating the exploration took too long. Check Exploration History before retrying."));
   if(!saved.investigationId)throw new Error("The server did not return an exploration ID.");
   setStage("Opening exploration…");
   const destination=`/scan?investigation=${encodeURIComponent(String(saved.investigationId))}&research=${encodeURIComponent(grant.storagePath)}`;
   // A document navigation is reliable even if Next.js client navigation is interrupted.
   window.location.assign(destination);
  }catch(e){setError(e instanceof Error?e.message:"Capture failed. Please try again.");setBusy(false);setStage("");}
 }
 return <div className={compact?"":"w-full"}>
  <input ref={input} type="file" accept="image/*" capture="environment" className="sr-only" aria-label="Take or choose a picture" onChange={e=>{void capture(e.target.files?.[0]);e.target.value=""}}/>
  <button type="button" disabled={busy} onClick={()=>input.current?.click()} className="ei-primary min-h-12 rounded-xl px-5 py-3 font-bold shadow-md disabled:opacity-70">{busy?stage:"📷 Take a Picture"}</button>
  {busy&&<p role="status" className="mt-2 text-sm text-[#172c42]">{stage} Please keep this page open.</p>}
  {error&&<p role="alert" className="mt-2 max-w-sm rounded-lg bg-red-50 p-2 text-sm font-semibold text-red-900">{error}</p>}
 </div>;
}
