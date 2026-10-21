-- The media manager needs durable storage references and archive state.
-- These columns are intentionally additive so existing site_media rows remain intact.
ALTER TABLE public.site_media
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS site_media_category_visibility_created_idx
  ON public.site_media (category, is_active, is_archived, created_at DESC);

-- The website displays media through public URLs. Ensure the existing media bucket
-- is available publicly; authenticated writes remain protected by storage RLS policies.
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Explicit least-privilege policies for the public media bucket.
-- Public visitors can read images; only admins can add, replace or remove files.
DROP POLICY IF EXISTS "public_read_site_media_bucket" ON storage.objects;
CREATE POLICY "public_read_site_media_bucket"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "admin_insert_site_media_bucket" ON storage.objects;
CREATE POLICY "admin_insert_site_media_bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "admin_update_site_media_bucket" ON storage.objects;
CREATE POLICY "admin_update_site_media_bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

DROP POLICY IF EXISTS "admin_delete_site_media_bucket" ON storage.objects;
CREATE POLICY "admin_delete_site_media_bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_admin());
