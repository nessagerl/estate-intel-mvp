# Estate Intelligence Release 4.4.1 — Item Insights presentation patch

This is a presentation-only patch based on Release 4.4. It preserves existing data, APIs, AI prompts, photo controls, and valuation functionality.

## Install
1. Back up the existing project folder.
2. Extract this ZIP and copy the **contents** of `estate-intelligence-release-4-4-1` into your project folder, replacing existing files.
3. Preserve your existing `.env.local`; never upload it to GitHub.
4. Run `npm run build` and then `npm run dev`.
5. Open both an old exploration and a new exploration. Confirm the At a Glance summary, readable evidence sections, and expandable original analysis.

## Database
**No Supabase migration is needed.** Do not rerun older migrations.

## What changed
- Improved legacy heading recognition, including `NEW EVIDENCE`, `UPDATED IDENTIFICATION`, and `WHAT THIS RESOLVES`.
- Simple Markdown bold is now rendered instead of displaying literal asterisks.
- Evidence and uncertainties have distinct, mobile-friendly sections.
- Label/value findings display as compact detail rows.
- Original analysis remains accessible in an expandable section.

## Limitations
Older free-form analyses may not contain reliable structured fields. The UI formats existing text without asking AI to reinterpret or invent facts. A fully structured AI output schema is a separate future backend improvement.
