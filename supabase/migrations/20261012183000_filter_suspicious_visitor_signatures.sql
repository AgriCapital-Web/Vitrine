CREATE OR REPLACE FUNCTION public.bump_visitor_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_week timestamptz := date_trunc('week', now());
BEGIN
  -- Keep all historical visit rows; filter obvious bots and anomalous stale browser signatures from future counter increments.
  IF COALESCE(NEW.user_agent, '') ~* '(bot|crawler|spider|headlesschrome|lighthouse|pagespeed|preview|facebookexternalhit|meta-externalagent|whatsapp|telegram|ahrefsbot|bingbot|googlebot|shapbot|reflectionbot|playwright|puppeteer|selenium|cypress|webdriver|curl/|wget/|python-requests|node.js|X11; Linux x86_64.*Chrome/121[.]0[.]0[.]0|Windows NT 10[.]0; Win64; x64.*Chrome/119[.]0[.]0[.]0)' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.visitor_counters (id, total_visitors, weekly_visitors, week_started_at, updated_at)
  VALUES ('public', 1, 1, current_week, now())
  ON CONFLICT (id) DO UPDATE
  SET total_visitors = public.visitor_counters.total_visitors + 1,
      weekly_visitors = CASE
        WHEN public.visitor_counters.week_started_at < current_week THEN 1
        ELSE public.visitor_counters.weekly_visitors + 1
      END,
      week_started_at = CASE
        WHEN public.visitor_counters.week_started_at < current_week THEN current_week
        ELSE public.visitor_counters.weekly_visitors + 1
      END,
      updated_at = now();
  RETURN NEW;
END;
$function$;