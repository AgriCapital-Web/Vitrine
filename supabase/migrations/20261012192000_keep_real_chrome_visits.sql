CREATE OR REPLACE FUNCTION public.bump_visitor_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_week timestamptz := date_trunc('week', now());
BEGIN
  -- Keep the existing cumulative history. Exclude only clearly identified
  -- crawlers/automation; do not classify ordinary Chrome versions as bots.
  IF COALESCE(NEW.user_agent, '') ~* '(bot|crawler|spider|headlesschrome|lighthouse|pagespeed|preview|facebookexternalhit|meta-externalagent|whatsapp|telegram|ahrefsbot|bingbot|googlebot|shapbot|reflectionbot|playwright|puppeteer|selenium|cypress|webdriver|curl/|wget/|python-requests|node.js)' THEN
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
        ELSE public.visitor_counters.week_started_at
      END,
      updated_at = now();
  RETURN NEW;
END;
$function$;
