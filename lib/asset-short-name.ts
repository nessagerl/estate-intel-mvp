/** A short, conservative name inferred from existing exploration text. No speculative makers. */
export function shortAssetName(analysis:string|null|undefined,title?:string|null):string{
 const raw=(title||'').trim();
 const candidate=(!raw||/^exploration\s*#?\d+$/i.test(raw)) ? (analysis||'') : raw;
 const first=candidate.replace(/```[\s\S]*?```/g,' ').split(/\n|\.|:/).map(s=>s.replace(/^[#*\s\-]+/,'').trim()).find(Boolean)||'';
 const cleaned=first.replace(/^(?:item|identification|most likely identification|at a glance|summary|object|likely item)\s*[:\-]\s*/i,'').replace(/\*\*/g,'').replace(/[^\p{L}\p{N} &'’\-]/gu,' ').replace(/\s+/g,' ').trim();
 const words=cleaned.split(' ').filter(Boolean);
 if(!words.length)return 'Unidentified Item';
 // Do not turn a whole observation sentence into a name.
 if(words.length>9 || /^(this|the|these|there|based|image|photo|appears|likely|visible|observed|i|it)\b/i.test(cleaned))return 'Unidentified Item';
 return words.slice(0,4).join(' ').slice(0,55)||'Unidentified Item';
}
export function assetDisplayName(id:number,name:string|null|undefined):string{
 const label=(name||'').trim();
 if(!label)return `Asset #${id} — Unidentified Item`;
 return /^Asset\s*#?\d+\s*[—-]/i.test(label)?label:`Asset #${id} — ${label}`;
}
