"use client";
import {useEffect,useState} from 'react';
import {authorizedFetch} from '@/lib/supabase-browser';
type Kind='home'|'collection';
type Preview={name:string;counts:Record<string,number>;destinations:{id:number;name:string}[];notice:string};
export default function DeleteContainer({kind,id,onDone}:{kind:Kind;id:number;onDone:()=>Promise<void>}){
 const [open,setOpen]=useState(false),[preview,setPreview]=useState<Preview|null>(null),[error,setError]=useState('');
 const [action,setAction]=useState<'transfer'|'unassign'|'trash'>('transfer'),[destination,setDestination]=useState('');
 const [busy,setBusy]=useState(false),[confirm,setConfirm]=useState(false);
 useEffect(()=>{if(!open)return;let live=true;setError('');setPreview(null);setConfirm(false);setAction('transfer');setDestination('');
  authorizedFetch(`/api/manage-container?kind=${kind}&id=${id}`).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.message);if(live)setPreview(d)}).catch(e=>{if(live)setError(String(e))});return()=>{live=false};
 },[open,kind,id]);
 async function remove(){if(!preview||!confirm||(action==='transfer'&&!destination))return;setBusy(true);setError('');
  try{const r=await authorizedFetch('/api/manage-container',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,id,action,destinationId:action==='transfer'?Number(destination):null})});
   const d=await r.json();if(!r.ok)throw Error(d.message||'Could not remove');setOpen(false);await onDone();
  }catch(e){setError(String(e))}finally{setBusy(false)}
 }
 return <><button type="button" onClick={()=>setOpen(true)} className="rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-800">Delete {kind}</button>
 {open&&<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4" role="presentation"><div role="dialog" aria-modal="true" aria-label={`Delete ${kind}`} className="w-full max-w-lg rounded-2xl bg-white p-5 text-stone-900 shadow-xl">
 <h3 className="text-xl font-bold">Delete {kind}{preview?`: ${preview.name}`:''}?</h3>
 {!preview&&!error&&<p className="mt-3">Loading actual inventory counts…</p>}
 {preview&&<><p className="mt-3 text-sm">This {kind} currently contains:</p><ul className="mt-2 list-inside list-disc rounded-xl bg-stone-100 p-3 text-sm">{Object.entries(preview.counts).map(([k,v])=><li key={k}>{v} {k}</li>)}</ul>
 <p className="mt-3 text-sm">{preview.notice}</p>
 <fieldset className="mt-4 space-y-3"><legend className="font-semibold">Choose what happens to the contents</legend>
 <label className="flex gap-2"><input type="radio" checked={action==='transfer'} onChange={()=>{setAction('transfer');setConfirm(false)}}/>Transfer to another {kind}</label>
 {action==='transfer'&&<select className="w-full rounded-lg border p-2" value={destination} onChange={e=>{setDestination(e.target.value);setConfirm(false)}}><option value="">Select destination</option>{preview.destinations.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>}
 <label className="flex gap-2"><input type="radio" checked={action==='unassign'} onChange={()=>{setAction('unassign');setConfirm(false)}}/>Keep items, unassigned</label>
 <label className="flex gap-2"><input type="radio" checked={action==='trash'} onChange={()=>{setAction('trash');setConfirm(false)}}/>Move affected items to Trash</label>
 </fieldset><p className="mt-3 text-sm text-amber-900">{kind==='home'?'Deleting this home removes its rooms. Room assignments will be cleared.':'Deleting this collection removes its membership links. Shared items will not be trashed.'} The {kind} itself cannot be restored.</p>
 <label className="mt-4 flex gap-2 text-sm"><input type="checkbox" checked={confirm} onChange={e=>setConfirm(e.target.checked)}/>I understand the impact and confirm this deletion.</label></>}
 {error&&<p role="alert" className="mt-3 text-red-700">{error}</p>}
 <div className="mt-5 flex justify-end gap-3"><button className="rounded-xl border px-4 py-2" onClick={()=>setOpen(false)} disabled={busy}>Cancel</button><button className="rounded-xl bg-red-800 px-4 py-2 font-semibold text-white disabled:opacity-40" disabled={busy||!preview||!confirm||(action==='transfer'&&!destination)} onClick={remove}>{busy?'Working…':'Confirm deletion'}</button></div>
 </div></div>}</>
}
