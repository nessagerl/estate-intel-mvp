export const VALUE_TYPES = ["resale","retail_replacement","auction","liquidation","insurance_replacement"] as const;
export type ValueType = typeof VALUE_TYPES[number];
export type Estimate = {low:number|null;high:number|null;confidence:"low"|"moderate"|"high"|"insufficient";reason:string};
export type Valuation = {currency:"USD";item_summary:string;estimates:Record<ValueType,Estimate>;factors:string[];needed_evidence:string[];comparables:string[];caveat:string};
export function parseValuation(raw:string):Valuation {
 const cleaned=raw.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");const v=JSON.parse(cleaned) as Valuation;
 if(!v||v.currency!=="USD"||!v.estimates)throw new Error("Invalid valuation response");
 for(const k of VALUE_TYPES){const e=v.estimates[k];if(!e||typeof e.reason!=="string")throw new Error("Incomplete valuation");for(const n of ["low","high"] as const){if(e[n]!==null&&(!Number.isFinite(e[n])||e[n]<0))throw new Error("Invalid amount");}if((e.low===null)!==(e.high===null)|| (e.low!==null&&e.high!==null&&e.high<e.low))throw new Error("Invalid range");}
 return v;
}
