# Estate Intelligence Release 4.3 — Consolidated

## Features
- Fixed atomic home transfers and clickable home inventory (from the prior 4.3 preview).
- Legacy and new exploration Item Insights in summary-first cards (from legacy fix).
- AI-assisted category and tags on newly saved assets; custom tag add/remove; removed AI tags are remembered.
- Filter My Stuff by item name, category, or tag; grid/list switch.
- Saved-photo thumbnails in Home, homepage, My Stuff, Collections, and Estates. Links from those thumbnails to existing explorations.
- Friendly signed-out state with sign-in action for protected routes; returns to requested page after email authentication.

## Supabase SQL (two separate situations)
- If you **already ran** `supabase/migrations/20261025_release4_3.sql` for the transfer fix, do NOT rerun it.
- Run **only** `supabase/migrations/20261025_release4_3_classification.sql` to enable categories and tags.
- If you have **not** applied the earlier 4.3 transfer migration, run that first, then the classification migration.
- Do not rerun 4.2 or older migrations.

## Install
1. Back up your current project. Keep `.env.local` untouched and out of Git.
2. Copy this folder's project contents over your local project.
3. Run `npm install`, `npm run build`, `npm run dev`.
4. Test with disposable items first. Do not deploy until the build and tests pass.

## Test checklist
1. Transfer a test home with rooms and items. Check room IDs and assignments in destination.
2. Open Home, Room, and linked item exploration; check thumbnail previews.
3. Open an older exploration and confirm At a Glance and full analysis.
4. Save a newly photographed item; check category/tags in My Stuff. AI classification can fail independently without losing the item.
5. Add/remove a tag, refresh, then rerun suggestions. Removed tag should not reappear.
6. Filter My Stuff by tag/category and switch grid/list.
7. Sign out, open a protected URL, and confirm Sign In instead of an error; follow new magic link back to that page.

## Limitations
- AI category/tag classification is heuristic and not authentication or appraisal evidence.
- Existing items require clicking Suggest tags; bulk auto-tagging old inventories is intentionally not run automatically to avoid surprise API costs.
- Collections and Estates show item thumbnails; room detail navigation uses the home detail page.
- The 12-photo exploration safeguard is unchanged.
- Before public launch, audit all service-role API endpoints and RLS/ownership controls.
