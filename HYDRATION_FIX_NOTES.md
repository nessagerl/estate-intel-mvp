Release 4 hydration fix
=======================
Changed app/homes/page.tsx so room rows use a div instead of a p around the InlineName component. This resolves the invalid <div> inside <p> hydration error.

No additional Supabase SQL is needed if Release 4 migration was already applied. Preserve .env.local. Run npm run build then npm run dev.

This fix has not been production-build verified in this environment (Next.js executable unavailable).
