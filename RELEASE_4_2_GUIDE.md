# Estate Intelligence Release 4.2 — Safe Home and Collection Deletion

## Install
1. Back up your working project and preserve `.env.local` (never commit it).
2. Run **only** `supabase/migrations/20261025_release4_2.sql` in the Supabase SQL Editor for the same project your app uses. It adds a transactional RPC; it does not remove existing records.
3. Copy the contents of this ZIP's `estate-intelligence-release-4` folder into your project, preserving `.env.local`.
4. Stop `npm run dev`, then run `npm install`, `npm run build`, `npm run dev`.
5. Test on disposable home/collection data before pushing to GitHub/Vercel.

## Behavior
- Home deletion counts rooms, active assets and active explorations, and requires a choice and explicit checkbox confirmation.
- **Transfer home**: assets and explorations point to destination home; room assignments are cleared; original rooms removed.
- **Keep unassigned**: assets and explorations retain their content but have no home/room; original rooms removed.
- **Trash home contents**: active assets in the home are soft-deleted, but explorations/photos remain; original rooms removed.
- **Collection transfer**: memberships copied to target collection without duplication; source collection removed.
- **Collection unassign**: source collection removed; items stay in My Stuff.
- **Collection trash**: only assets exclusively belonging to the collection are soft-deleted. Assets shared with other collections remain active. Explorations remain.
- **Home and collection records themselves are deleted permanently**. Their room structure/membership links cannot be recovered via the 30-day Trash. This is explicitly disclosed in the confirmation.
- Counts are retrieved when opening the dialog. They can change if another session modifies data before confirmation.
- Mutations run atomically inside a Postgres function. Ownership is checked on the server; function execution is restricted to service_role.

## Tests
1. Create disposable home with room and test asset. Open Delete Home and verify counts.
2. Transfer to another home; verify asset appears under new home and room is cleared.
3. Repeat with unassign and Trash; confirm Trash asset can be restored.
4. Create two collections with the same test asset; trash one collection and verify shared asset is preserved.
5. Transfer a collection and verify target membership is retained without duplicates.
6. Confirm cancel never deletes anything; try from mobile.

## Important limitations
- No room deletion dialog in this batch; room deletion is a separate follow-up.
- No automatic 30-day purge. The Trash restoration policy from Release 4 remains unchanged.
- If you need **recoverable homes and room structures**, do not delete a real home yet; that requires a different soft-delete design.
