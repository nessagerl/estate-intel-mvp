# Estate Intelligence 4.4.5 — Capture First

## What's new
- **Take a Picture** from the global navigation and a prominent mobile bottom button; home page has a primary capture action. Mobile browsers may show camera or photo-library choices.
- Uploaded photograph is saved to a new exploration **before AI research starts**. The exploration page shows the saved photograph and a research timer while the existing analysis endpoint works.
- **Add Details** and **Save to My Stuff** appear near the top, independently of Value Insights. The save dialog retains optional home/room assignment.
- Details can be saved during initial analysis. When the active analysis completes, a follow-up reassessment incorporates any details added while it was running.
- Value Insights stays separate and collapsed. Previous full reassessment and tagging improvements are retained.

## Install
1. Back up the project. Extract and copy the files into your existing project, preserving `.env.local` and `.git`.
2. `npm install` then `npm run build` and `npm run dev`.
3. Test on desktop and phone before `git add .`, `git commit -m "Release 4.4.5 capture first"`, `git push origin main`.

## Database
No new Supabase migration required. Uses existing investigations, investigation_photos and investigation_evidence tables.

## Important limitations
- Photo upload must finish before navigation to the exploration page. Once the page opens, the photograph is persisted and visible while research runs.
- AI research runs in the active browser request, **not** a durable background worker. Leaving the page or a server timeout can interrupt research; the captured photo and saved details remain in the database. A future background job system would be needed for guaranteed completion after navigation.
- The research timer reflects elapsed time, not a fabricated percentage or step-by-step completion claim.
- A full live Supabase/OpenAI integration test is still required.
