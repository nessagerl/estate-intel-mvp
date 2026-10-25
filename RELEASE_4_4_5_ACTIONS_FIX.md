# Release 4.4.5 — Exploration Actions Hotfix

This patch corrects the confusing top-of-page actions on `/scan`.

- Removes the redundant Add Details anchor that only jumped down the page.
- Makes the actual Add Details disclosure the primary, prominent control. Tap it to expand/collapse the form.
- Moves the optional-home Save to My Stuff confirmation directly under the top action area, instead of below valuation and location.
- Preserves the existing save API and home/room selection behavior.

## Install
Back up your project, extract over the existing files, and preserve `.env.local` and `.git`.
Run `npm run build` and `npm run dev`. Test opening Add Details, saving details, opening Save to My Stuff, saving with no home, and saving with a home.

No database migration required. This package was not production-build tested in this environment.
