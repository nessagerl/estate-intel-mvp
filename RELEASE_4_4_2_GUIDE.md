# Estate Intelligence Release 4.4.2 — Mobile Item Insights

## Scope
- New analyses request concise JSON with identification, summary, observations, interpretations, unknowns, and next steps.
- Item Insights displays a compact summary followed by the latest saved **resale valuation** (from Value Insights).
- When the saved valuation has low confidence, displays “More information needed to refine this estimate.”
- No fabricated value ranges: if valuation fails or cannot reasonably determine a range, the app clearly says so.
- Supporting sections are collapsed by default. Original research is preserved and collapsible.
- Existing explorations get the compact layout, using a conservative legacy summary rather than pretending the old text is structured.
- The Location form is collapsed below the item summary.
- Add Photo, Add Details, and Save Item are accessible directly after the summary.
- Five value types are available in a collapsed Value Insights panel; written evidence remains accessible by Add Details.

## Installation
1. Back up the current local project.
2. Copy the contents of this release folder over the existing project, keeping `.env.local`.
3. **No Supabase SQL migration required.** Do not rerun previous migrations.
4. Run `npm install`, `npm run build`, and `npm run dev`.
5. Test an existing exploration and a new photo, including the summary, numeric value, collapsed sections, Add Details, and location.
6. Only deploy to Vercel after local tests succeed.

## Known limitations
- Previously saved free-text analyses are not retroactively rewritten into structured fields; their original text remains available under Original Research.
- If the AI valuation cannot produce a defensible numeric range, it will not fabricate one. Use Add Details or refresh the valuation.
- Existing photo limits and security behavior are unchanged.
