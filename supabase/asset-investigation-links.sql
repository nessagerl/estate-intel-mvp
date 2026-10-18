-- Run AFTER next-release.sql. Keeps all investigations, assets, and photos.
-- Assets and investigations are independent; this table connects them many-to-many.
CREATE TABLE IF NOT EXISTS public.asset_investigations (
  asset_id bigint NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  investigation_id bigint NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
  relationship text NOT NULL DEFAULT 'evidence',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (asset_id, investigation_id)
);
CREATE INDEX IF NOT EXISTS asset_investigations_investigation_idx
  ON public.asset_investigations(investigation_id);
ALTER TABLE public.asset_investigations ENABLE ROW LEVEL SECURITY;
-- Backfill existing associations, without destroying the original columns.
INSERT INTO public.asset_investigations(asset_id, investigation_id, relationship)
SELECT id, investigation_id, 'original'
FROM public.assets
WHERE investigation_id IS NOT NULL
ON CONFLICT (asset_id, investigation_id) DO NOTHING;
-- Remove the old one-investigation-one-asset restriction.
DROP INDEX IF EXISTS public.assets_unique_investigation;
-- Make the old legacy column optional so assets can exist without an investigation.
ALTER TABLE public.assets ALTER COLUMN investigation_id DROP NOT NULL;
