-- Count real site entries independently from optional third-party analytics.
-- This counter stores only aggregate totals; no visitor identifier or navigation data is recorded.
create or replace function public.record_public_visit()
returns void
language plpgsql
security definer
set search_path to public
as $function$
declare
  current_week timestamptz := date_trunc('week', now());
begin
  insert into public.visitor_counters (id, total_visitors, weekly_visitors, week_started_at, updated_at)
  values ('public', 1, 1, current_week, now())
  on conflict (id) do update
  set total_visitors = public.visitor_counters.total_visitors + 1,
      weekly_visitors = case
        when public.visitor_counters.week_started_at < current_week then 1
        else public.visitor_counters.weekly_visitors + 1
      end,
      week_started_at = case
        when public.visitor_counters.week_started_at < current_week then current_week
        else public.visitor_counters.week_started_at
      end,
      updated_at = now();
end;
$function$;

revoke all on function public.record_public_visit() from public, anon, authenticated;
grant execute on function public.record_public_visit() to service_role;

-- Detailed page analytics still run only after consent. They must not also increment
-- the public aggregate counter, otherwise consenting visitors would be counted twice.
drop trigger if exists page_visits_bump_visitor_counters on public.page_visits;
