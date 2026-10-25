"use client";
import {useEffect,useState} from "react";
import {authorizedFetch} from "@/lib/supabase-browser";

type Report={title:string;summary:string;characteristics:string[];observed:string[];inferred:string[];unknowns:string[];next_steps:string[]};
type Props={analysis:string;updated:boolean;onAddPhoto:()=>void;disabled:boolean;investigationId?:number};
type Estimate={low:number|null;high:number|null;confidence:string};
function clean(s:string){return s.replace(/^\s*#{1,6}\s*/gm,"").replace(/\*\*(.*?)\*\*/g,"$1").replace(/__(.*?)__/g,"$1").replace(/`([^`]+)`/g,"$1").replace(/^\s*[-•*]\s*/,"").trim();}
function short(s:string,n=250){const t=clean(s).replace(/\s+/g," ");return t.length>n?t.slice(0,n).replace(/\s+\S*$/,"")+"…":t;}
function legacyReport(text:string):Report{
 const rows=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const first=rows.find(x=>/^(?:best identification|updated identification|what it may be|observed|identification)\s*:/i.test(clean(x)))||rows.find(x=>!/^#{1,6}\s|^[A-Z &-]{4,}:?$/.test(x))||"Item awaiting identification";
 const summary=short(first.replace(/^(?:#+\s*)?(?:best identification|updated identification|what it may be|observed|identification)\s*:\s*/i,""),230);
 const title=short(summary.split(/[.;]/)[0],85);
 // Preserve older free-form findings intact in the original report; don't guess which phrases are facts.
 return {title:title||"Item under investigation",summary:summary||"Review the original research for details.",characteristics:[],observed:[],inferred:[],unknowns:[],next_steps:[]};
}
function readReport(text:string):{report:Report;structured:boolean}{
 try{const obj=JSON.parse(text);if(obj&&obj.schema_version===2&&typeof obj.summary==="string"){
 const list=(k:string)=>Array.isArray(obj[k])?obj[k].filter((v:unknown):v is string=>typeof v==="string").slice(0,5).map(clean):[];
 return {structured:true,report:{title:short(String(obj.title||"Item under investigation"),95),summary:short(obj.summary,410),characteristics:list("characteristics"),observed:list("observed"),inferred:list("inferred"),unknowns:list("unknowns"),next_steps:list("next_steps")}};
 }}catch{}return {report:legacyReport(text),structured:false};
}
const dollars=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
function Detail({title,items}:{title:string;items:string[]}){if(!items.length)return null;return <details className="rounded-xl border border-stone-200 bg-white"><summary className="cursor-pointer px-4 py-4 font-semibold text-stone-900">{title}<span className="ml-2 text-xs font-normal text-stone-500">({items.length})</span></summary><ul className="list-disc space-y-2 border-t border-stone-100 px-8 py-4 text-sm leading-6 text-stone-700">{items.map((x,i)=><li key={i}>{x}</li>)}</ul></details>}
export default function FindingsPanel({analysis,onAddPhoto,disabled,investigationId}:Props){
 const {report,structured}=readReport(analysis);
 const [resale,setResale]=useState<Estimate|null>(null);
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{let live=true;setLoaded(false);setResale(null);if(!investigationId)return;authorizedFetch(`/api/valuation?investigationId=${investigationId}`).then(r=>r.json()).then(d=>{if(!live)return;const v=d.history?.[0]?.valuation?.estimates?.resale;if(v)setResale(v);}).catch(()=>{}).finally(()=>{if(live)setLoaded(true)});return()=>{live=false}},[investigationId,analysis]);
 const range=resale?.low!=null&&resale.high!=null?`${dollars(resale.low)}–${dollars(resale.high)}`:null;
 const uncertain=!range||resale?.confidence==="low"||resale?.confidence==="insufficient";
 return <section className="mt-4 space-y-3" aria-label="Item Insights">
  <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
   <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Item Insights · At a Glance</p>
   <h2 className="mt-2 text-xl font-bold leading-7 text-stone-900">{report.title}</h2>
   <p className="mt-2 text-sm leading-6 text-stone-700">{report.summary}</p>
   <p className="mt-3 text-sm font-semibold text-stone-900">Estimated resale value: {range|| (loaded?"Estimate being refined":"Loading estimate…")}</p>
   {uncertain&&<p className="mt-1 text-xs text-stone-600">More information needed to refine this estimate.{!range&&" No reliable numerical range is available yet; the app won't invent one."}</p>}
  </div>
  <div className="grid grid-cols-2 gap-2"><button type="button" onClick={onAddPhoto} disabled={disabled} className="rounded-xl bg-stone-900 px-3 py-3 text-sm font-semibold text-white disabled:opacity-50">+ Add Photo</button><a href="#written-evidence" className="rounded-xl border border-stone-400 px-3 py-3 text-center text-sm font-semibold text-stone-900">Add Details</a></div>
  <Detail title="Key Characteristics" items={report.characteristics}/>
  <Detail title="Evidence Seen in Photos" items={report.observed}/>
  <Detail title="Interpretations (Unverified)" items={report.inferred}/>
  <Detail title="What Remains Uncertain" items={report.unknowns}/>
  <Detail title="Recommended Next Steps" items={report.next_steps}/>
  {!structured&&<p className="text-xs text-stone-600">This is an older exploration. Its original research is preserved below; add a new photo to generate the updated structured report.</p>}
  <details className="rounded-xl border border-stone-200 bg-white"><summary className="cursor-pointer px-4 py-4 font-semibold text-stone-900">Original Research {structured?"(Structured data)":"(Full text)"}</summary><pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words border-t border-stone-100 p-4 text-xs leading-6 text-stone-700">{structured?JSON.stringify(JSON.parse(analysis),null,2):analysis}</pre></details>
 </section>
}
