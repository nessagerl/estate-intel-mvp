# Release 4.3 — Saved Item Insights compatibility fix

## Issue
Previously saved explorations displayed the raw `current_analysis` text in the exploration detail page, bypassing the new `FindingsPanel` presentation used by the scan page.

## Fix
The exploration detail page now renders saved `current_analysis` using the same summary-first FindingsPanel as the live scan page. It also routes Add Another Photo to the existing exploration.

## Data impact
No database changes, no migration, and no AI reanalysis are needed. Historical text is displayed using the new formatting without overwriting the saved analysis. Summaries for legacy text are extracted heuristically from existing text, not regenerated.

## Install
Copy the project contents over your Release 4.3 preview, preserving `.env.local`. Run `npm run build`, then `npm run dev`. Open an old exploration from Exploration History and check the At a Glance card, structured sections, original analysis disclosure, and Add Another Photo action.
