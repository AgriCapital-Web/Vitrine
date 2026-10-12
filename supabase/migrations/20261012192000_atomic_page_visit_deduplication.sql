CREATE OR REPLACE FUNCTION public.record_page_visit_deduplicated(
  p_page_path text,
  p_visitor_id text,
  p_user_agent text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_country_code text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_region text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF COALESCE(p_page_path, '') = '' OR COALESCE(p_visitor_id, '') = '' THEN
    RAISE EXCEPTION 'page_path and visitor_id are required';
  END IF;

  -- Serialize concurrent inserts for the same browser and path to prevent race duplicates.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_visitor_id || '|' || p_page_path, 0));

  IF EXISTS (
    SELECT 1 FROM public.page_visits
    WHERE visitor_id = p_visitor_id
      AND page_path = p_page_path
      AND created_at >= now() - interval '30 minutes'
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO public.page_visits (
    page_path, visitor_id, user_agent, referrer,
    country_code, country, city, region
  ) VALUES (
    p_page_path, p_visitor_id, p_user_agent, p_referrer,
    p_country_code, p_country, p_city, p_region
  );

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.record_page_visit_deduplicated(text,text,text,text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_page_visit_deduplicated(text,text,text,text,text,text,text,text) TO service_role;