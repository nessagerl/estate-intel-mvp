# Estate Intelligence 4.4.6 — Automatic Inventory + Fast Guided Discovery

## What's new

- A successful capture creates an asset in My Stuff immediately, even before AI analysis completes. Home and room remain optional.
- The Exploration page shows a **Remove from My Stuff** action with two explicit choices: remove the asset but retain the exploration, or move both to Trash (30-day restore policy).
- Initial AI analysis now returns up to three item-specific, multiple-choice Guided Discovery questions **in the same AI request**. No separate AI call is made between answers. The next question is instantly available.
- Where appropriate, an answer reveals **Take another picture to show us**. No typing is required for guided questions; the existing optional written-details control remains available.
- Submit the collected answers once to save them as evidence and trigger one full reassessment (identification, summary, evidence, questions and valuations).
- Adding another photograph scrolls to the top once and displays an update status. Previously displayed research stays visible until refreshed.
- Automatically created placeholder asset names are replaced with short AI identifications after analysis. User-renamed assets are not overwritten.

## Important limitations

- The **initial** AI analysis and the **final** reassessment can still take several seconds; the no-wait promise applies **between question taps**, not to server research.
- AI responses may omit questions or return malformed data. The page continues to work without Guided Discovery in that case.
- Analysis is still tied to an active browser request. Guaranteed processing after closing the tab requires a durable job queue.
- Auto-saving creates an asset when the capture record is created; existing unsaved explorations are not bulk converted.
- Moving to Trash uses existing soft-delete fields and does not permanently delete uploaded photographs.
- This release has not been production-build or live-database tested in this environment. Please run `npm install`, `npm run build`, `npm run dev`, and test locally before deploying.

## Install

Back up the existing project. Extract this complete ZIP into the project folder, keeping `.git` and `.env.local` unchanged. No new Supabase migration is required (uses existing tables and soft-delete columns).

## Suggested tests

1. Take a new picture: ensure a new item appears in My Stuff before analysis finishes.
2. Wait for preliminary insights: verify up to three questions, with instant transitions between choices.
3. Answer all and select **Update My Insights**: ensure one reassessment and refreshed summary/valuation.
4. Select a choice that requests a photo: confirm the camera/photo picker opens.
5. Add a second photograph: confirm scroll to top and reanalysis message.
6. Remove item only: verify the exploration remains accessible; restore asset from Trash if desired.
7. Remove item and exploration: verify both are in Trash and recoverable.
8. Verify a custom asset name is preserved after further research.
