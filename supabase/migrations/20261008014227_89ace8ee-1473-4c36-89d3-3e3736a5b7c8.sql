DROP POLICY IF EXISTS "Public can read news slug redirects" ON public.news_slug_redirects;
CREATE POLICY "Public can read redirects of published news" ON public.news_slug_redirects
FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.news n WHERE n.id = news_slug_redirects.news_id AND n.is_published = true));
CREATE POLICY "Admins can read all news slug redirects" ON public.news_slug_redirects
FOR SELECT TO authenticated USING (public.is_admin());