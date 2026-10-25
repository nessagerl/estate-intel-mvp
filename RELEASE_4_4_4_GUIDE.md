# Estate Intelligence Release 4.4.4 — Full Reassessment

Base: Release 4.4.3 Tag Fix. Complete source included.

## Changes
- Saving written details now invokes `/api/reassess`, regenerating the **entire** structured identification, summary, characteristics, evidence, uncertainties and next steps from all available photos, past analysis and user-written evidence. The five value estimates are recalculated afterward.
- The new summary and value panel update without requiring another photograph.
- The analysis flow displays an elapsed timer instead of an uninformative waiting message.
- The exploration screen prompts for an optional existing home and room when saving to My Stuff; skipping home is supported.
- The previously delivered 4.4.3 tagging patch is included.

## Installation
1. Back up your existing project.
2. Extract this complete ZIP and copy the project contents over your existing project; **preserve `.env.local`**.
3. Run `npm install`, `npm run build`, then `npm run dev`.
4. Test with an existing exploration: enter new written evidence, save, and verify the entire At a Glance and detailed report change, as well as all five valuations. Test the optional home prompt and analysis elapsed timer.

**New Supabase migration:** none. Existing `investigation_evidence` and `investigation_photos` tables must already exist.

## Caveats
- Earlier analysis is not separately versioned by this patch; valuation history and user evidence remain saved.
- If AI reassessment fails after written evidence is saved, the evidence is retained; retry with new evidence or use a future dedicated retry action.
- Live integration with your Supabase and OpenAI credentials has not been verified here.
