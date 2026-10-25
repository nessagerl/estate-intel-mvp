# Release 4.4.3 — Tag generation hotfix

This package builds on 4.4.3 and addresses missing AI-suggested tags on saved items.

## Changes
- Request strict JSON output from the classification model to avoid silent parsing failures.
- Fall back to conservative object-type tags when the model returns no tags.
- Refresh tags when an already-saved exploration is saved again, without duplicating the asset.
- Display Category & Tags on saved exploration detail pages.
- Show a one-click **Suggest Tags** action when the tag list is empty, without requiring a new photo.
- Preserve manually added tags and rejected/removed AI suggestions.

## Install
Back up your project, extract this package over your existing project, and preserve `.env.local`. Run `npm install`, `npm run build`, and `npm run dev`. No new Supabase migration is required if 4.4.3's classification tables are already installed.

## Verify
Open a saved exploration that lacks tags, click **Suggest Tags**, and check that tags appear. For an unsaved exploration, save it to My Stuff first. The current data model associates persistent tags with assets rather than unsaved explorations; generating persistent tags on unsaved explorations requires a separate schema/UI enhancement.

## Limitations
Build and live Supabase/OpenAI integration were not verified in this environment. Fallback tags are intentionally broad and are based on analysis text, not independent verification of materials or authenticity.
