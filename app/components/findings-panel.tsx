"use client";

type Props={analysis:string;updated:boolean;onAddPhoto:()=>void;disabled:boolean};
const titles=new Set(["WHAT IT MAY BE","VISIBLE CLUES","WHAT RESEARCH FOUND","WHAT IS STILL UNKNOWN","WHAT TO PHOTOGRAPH NEXT","CONFIDENCE","NEW EVIDENCE","WHAT THIS RESOLVES","RESEARCH & VERIFICATION","UPDATED IDENTIFICATION","STILL UNKNOWN","BEST NEXT STEP","UPDATED CONFIDENCE"]);
function sections(text:string){
 const output:{title:string;lines:string[]}[]=[];
 let current={title:"Overview",lines:[] as string[]};
 for(const line of text.split(/\r?\n/)){
  const clean=line.trim();
  const normalized=clean.replace(/^#{1,5}\s*/,"").replace(/^[*]{1,2}|[*]{1,2}$/g,"").replace(/:$/,"").trim().toUpperCase();
  const matched=[...titles].find(t=>normalized===t||normalized.startsWith(t+" ("));
  if(matched){if(current.lines.length)output.push(current);current={title:matched.replace(/\b\w/g,c=>c.toUpperCase()).replace(/\bIt\b/g,"it"),lines:[]};continue}
  if(clean)current.lines.push(clean);
 }
 if(current.lines.length)output.push(current);
 return output.length?output:[{title:"Findings",lines:[text]}];
}
export default function FindingsPanel({analysis,updated,onAddPhoto,disabled}:Props){
 const blocks=sections(analysis);
 return <section className="mt-6 space-y-4" aria-label="AI findings">
  <div className="rounded-2xl border border-stone-300 bg-white p-5"><h2 className="text-2xl font-bold text-stone-900">{updated?"Updated Item Insights":"Item Insights"}</h2><p className="mt-2 text-sm text-stone-700">AI findings based on the photographs and evidence in this exploration. Verify important details independently.</p></div>
  {blocks.map((block,i)=><section key={i} className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm"><h3 className="text-lg font-bold text-stone-900">{block.title}</h3><div className="mt-3 space-y-3 text-sm leading-7 text-stone-800">{block.lines.map((line,j)=><p key={j} className="whitespace-pre-wrap break-words">{line.replace(/^[-*]\s*/,"• ")}</p>)}</div>{i===blocks.length-1||/next|photograph|unknown/i.test(block.title)?<button type="button" onClick={onAddPhoto} disabled={disabled} className="mt-4 w-full rounded-xl border border-stone-500 px-4 py-3 font-semibold text-stone-900 disabled:opacity-50">+ Add Another Photo</button>:null}</section>)}
 </section>
}
