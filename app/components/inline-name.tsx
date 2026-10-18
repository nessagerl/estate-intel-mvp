"use client";
import {useEffect,useState} from "react";
export default function InlineName({name,label="Name",onSave}:{name:string;label?:string;onSave:(name:string)=>Promise<void>}){
 const[open,setOpen]=useState(false),[draft,setDraft]=useState(name),[busy,setBusy]=useState(false),[error,setError]=useState("");
 useEffect(()=>setDraft(name),[name]);
 async function save(){const value=draft.trim();if(!value)return setError("Enter a name");setBusy(true);setError("");try{await onSave(value);setOpen(false)}catch(e){setError(String(e))}finally{setBusy(false)}}
 return <div className="min-w-0">{!open?<button type="button" className="rounded-lg border border-stone-400 px-3 py-1 text-sm text-stone-900 hover:bg-stone-100" onClick={()=>setOpen(true)}>Edit {label}</button>:<div className="mt-2 rounded-xl border border-stone-400 bg-stone-50 p-3"><label className="block text-sm font-semibold text-stone-900">{label}<input autoFocus className="mt-1 w-full rounded-lg border border-stone-500 bg-white p-2 text-stone-950" value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void save();if(e.key==="Escape")setOpen(false)}}/></label>{error&&<p role="alert" className="text-red-700">{error}</p>}<div className="mt-2 flex gap-2"><button disabled={busy} className="rounded-lg bg-stone-900 px-3 py-2 text-white" onClick={()=>void save()}>Save</button><button className="rounded-lg border px-3 py-2 text-stone-900" onClick={()=>setOpen(false)}>Cancel</button></div></div>}</div>
}
