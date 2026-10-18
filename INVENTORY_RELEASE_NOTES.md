# Inventory management release

Changes: recent My Stuff on home page; clickable investigation history and detail page; continue an old investigation; save it as an asset; rename homes, rooms, assets, collections, investigations; collections accessible from Handle a Home; room assignment API; retains photo comparison.

## Database step
Run `supabase/inventory-management-update.sql` in Supabase SQL Editor once. This only adds an optional investigation title and refreshes the schema cache.

## Installation
Back up your existing project, copy release files into it, keep your own `.env.local` and never upload secrets. Stop the dev server, delete `.next` if Windows OneDrive reports stale types, then run `npm install`, `npm run build`, `npm run dev`.

## Test
1. Sign in and open an investigation from My Stuff > Investigation history.
2. Reopen its saved photographs and findings; continue adding evidence.
3. Save it to My Stuff and verify the home-page list.
4. Rename a home and room, and create a collection from Handle a Home.
5. Test item ownership with two different user accounts before deploying publicly.

## Limitations
Previously created investigations with NULL user_id are not automatically assigned to any user. Their ownership must be reconciled carefully. Photo signed URLs expire and are regenerated when the detail page is loaded. This release has not been validated against your live Supabase database.
