# Estate Intelligence Release 4.3 — Navigation and transfer fix

## What is implemented
- **Critical fix**: Home Transfer now moves room records to the destination home and preserves existing room IDs on assets and explorations. Atomic PostgreSQL function replaces the 4.2 version.
- Clickable Homes, home detail pages with room and item counts, item thumbnails, and room-based inventory.
- Thumbnail previews in Homes, My Stuff, and the homepage. Uses short-lived signed URLs to existing private photos.
- Item Insights now begins with an at-a-glance summary and provides the complete original text in a disclosure.

## Not yet included in this package
- Automatic categories and custom/AI tags, category/tag filtering, and thumbnails in every area (collections, trash, estates).
- Full signed-out redirect handling and universal clickable navigation.
- Recovery of rooms deleted by **previous** 4.2 transfers. Those records were already deleted; this migration cannot reconstruct them.

## Installation
1. Back up your project and preserve `.env.local`. Do not commit it.
2. In Supabase SQL Editor, run ONLY `supabase/migrations/20261025_release4_3.sql` before testing a new transfer. Do not rerun older migrations.
3. Copy the contents of this folder over your project.
4. Run `npm install`, `npm run build`, `npm run dev`.
5. Test on disposable homes: create source and destination homes, source room, and item; transfer; confirm destination home shows the room and item in that room.
6. Test existing home cards, thumbnails, My Stuff and Item Insights; only deploy to Vercel after build and checks succeed.

**Caution:** No changes to auth policy or RLS were made. Before public rollout, review all service-role endpoints and authorization checks. Signed thumbnail URLs are temporary.
