import OpenAI from 'openai';
import {supabaseServer} from '@/lib/supabase-server';
export async function classifyAsset(assetId:number,userId:string,analysis:string){
 if(!analysis.trim())return {category:null,tags:[] as string[]};
 const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
 const response=await client.responses.create({model:'gpt-5.4-mini',text:{format:{type:'json_object'}},input:[{role:'user',content:`Classify this item based ONLY on the analysis. Return a JSON object with keys category (broad category, e.g. Jewelry, Furniture, Books, Art, Electronics, Household, Clothing, Other) and tags (up to 6 concise descriptive strings). Do not assert uncertain materials, authenticity, maker or era as facts; omit them if uncertain. No prose.\n${analysis.slice(0,9000)}`} ]});
 let parsed:{category?:unknown;tags?:unknown};
 try{parsed=JSON.parse(response.output_text.replace(/^```(?:json)?\s*|\s*```$/g,''))}catch{parsed={category:'Other',tags:[]}}
 const category=typeof parsed.category==='string'?parsed.category.trim().slice(0,80):null;
 let tags=Array.isArray(parsed.tags)?Array.from(new Set(parsed.tags.filter((x):x is string=>typeof x==='string').map(x=>x.trim().slice(0,60)).filter(Boolean))).slice(0,6):[];
 if(tags.length===0){const words=analysis.toLowerCase();const candidates:[string,string[]][]=[['Jewelry',['ring','necklace','bracelet','earring','pendant']],['Footwear',['shoe','sneaker','boot','sandal']],['Documents',['document','certificate','letter','manuscript']],['Furniture',['chair','table','desk','cabinet']],['Art',['painting','print','sculpture']],['Watches',['watch','timepiece']],['Ceramics',['vase','pottery','ceramic']]];const found=candidates.find(([,keys])=>keys.some(k=>new RegExp('\\b'+k+'s?\\b','i').test(words)));if(found){tags=[found[0],...found[1].filter(k=>new RegExp('\\b'+k+'s?\\b','i').test(words)).map(k=>k[0].toUpperCase()+k.slice(1))].slice(0,6)}}
 const {data:asset}=await supabaseServer.from('assets').select('id,category,category_source').eq('id',assetId).eq('user_id',userId).is('deleted_at',null).maybeSingle();
 if(!asset)return {category:null,tags:[] as string[]};
 if(category&&!asset.category_source)await supabaseServer.from('assets').update({category,category_source:'ai'}).eq('id',assetId).eq('user_id',userId);
 const [{data:existing},{data:rejected}]=await Promise.all([supabaseServer.from('asset_tags').select('name').eq('asset_id',assetId).eq('user_id',userId),supabaseServer.from('asset_tag_rejections').select('name').eq('asset_id',assetId).eq('user_id',userId)]);
 const used=new Set([...(existing||[]).map(x=>x.name.toLowerCase()),...(rejected||[]).map(x=>x.name.toLowerCase())]);
 const additions=tags.filter(x=>!used.has(x.toLowerCase())).map(name=>({asset_id:assetId,user_id:userId,name,source:'ai'}));
 if(additions.length){const {error}=await supabaseServer.from('asset_tags').upsert(additions,{onConflict:'asset_id,name',ignoreDuplicates:true});if(error)throw error}
 return {category,tags};
}
