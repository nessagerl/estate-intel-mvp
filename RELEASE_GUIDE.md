# Estate Intelligence Release 4 — Installation & Test

## BEFORE YOU COPY FILES
1. Back up your existing project folder. Preserve `.env.local` (never share it).
2. In Supabase SQL Editor, run **only** `supabase/migrations/20261018_release4.sql`, once. It is designed to be idempotent. Do NOT rerun older migration files.
3. Confirm the SQL editor reports success. This adds `deleted_at` to assets/investigations and creates evidence and valuation-history tables.

## INSTALL
1. Unzip and copy the contents of the `estate-intelligence-release-4` folder into your local `estate-intel-mvp` folder (not the containing folder). Do not replace `.env.local`.
2. In PowerShell in your project directory: `npm install`, then `npm run build`.
3. Only after build passes, run `npm run dev` and test locally. Deploy to Vercel only after testing.

## TEST
- Photograph a new item. The AI should identify it and attempt five USD estimates automatically. A valuation error should not discard a successful exploration.
- Open exploration details, verify five valuation types. Add written evidence, choose condition and source, save. Verify updated valuation and history persist after refresh.
- Move one test asset to Trash; verify it disappears from My Stuff but its exploration remains. Restore it from Trash.
- Move a test exploration to Trash; verify it disappears from history but its asset remains. Restore it.
- Confirm your existing inline renaming and Create & Select workflows still work.

## IMPORTANT LIMITATIONS
- 30-day recovery window is enforced for restoration, but no automatic permanent-deletion job exists; older soft-deleted records remain in the database and storage until a future retention/purge implementation. Do not describe them as permanently erased.
- Automatic valuation requires a working OpenAI key, uses an additional AI call per analyzed photo, and may incur web-search/API charges and latency. Not all item categories support defensible ranges. Values are AI estimates, not certified appraisals.
- This release does NOT fully implement Create & Select for all dropdowns or full inline editing for every data entity. Collection management remains at its previous functionality.
- This release has not undergone a complete production security audit; do not invite public users until server ownership, storage policies, rate limits, and billing controls have been reviewed.
