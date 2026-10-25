# Capture hotfix for 4.4.5

Addresses the indefinite **Saving your photo…** state in the global Take a Picture action.

- Displays actual capture steps: preparing, uploading, creating exploration, opening.
- Adds a 25-second client-side timeout to each network operation and shows actionable errors.
- Uses full-page navigation once an exploration ID is returned, avoiding a stuck client-side transition.
- Preserves the existing upload and capture APIs and requires no database migration.

This change **does not establish the root cause** of the stalled request; if it still fails, the stage and error help identify which network operation is failing.

Install over 4.4.5, preserve .env.local and .git, run `npm run build` locally before deploying. If the request times out after uploading, check Exploration History before retrying to avoid duplicates.
