# Estate Intelligence — Release 4.4.3

## Changes
- Exploration History cards can save directly to My Stuff; saved status is visible. Direct save reuses the existing secure `/api/save-asset` route.
- Save is idempotent for an exploration already linked to an active asset; no duplicate asset should be created by repeated taps.
- New assets get a conservative 2–4-word name based on the existing exploration title/AI findings. Unclear descriptions use `Unidentified Item` rather than inventing provenance. Display labels use `Asset #N — Short Name`. Existing custom names are retained.
- More prominent Item Insights and other navigation links.
- Midnight blue `#172C42`, warm ivory `#F8F6F0`, and restrained antique gold `#B59864` theme.

## Install / test
1. Back up your existing project. Extract this archive and copy the project contents over the existing project (not your `.env.local`).
2. Keep existing Vercel and Supabase environment variables. No new SQL migration is required.
3. Run `npm install`, `npm run build`, `npm run dev`.
4. In My Stuff > Exploration History, save an unsaved exploration; verify it appears in Assets and shows as Saved. Click again/reload to confirm no duplicates.
5. Verify names, bold navigation, and navy/ivory palette on mobile and desktop.

Note: AI-generated names here are conservative short titles inferred from the existing saved analysis; this release does not make a separate OpenAI naming request. Existing custom asset names are not overwritten.
