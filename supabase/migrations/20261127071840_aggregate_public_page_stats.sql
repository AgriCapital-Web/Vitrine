create or replace function public.get_public_page_stats()
returns jsonb
language sql
security definer
set search_path = ''
as $function$
with windowed as materialized (
  select page_path, referrer_host, device_type, is_automated, created_at
  from public.public_page_events
  where created_at >= now() - interval '180 days'
),
daily_days as (
  select generate_series(current_date - 6, current_date, interval '1 day')::date as day
),
daily_counts as (
  select created_at::date as day, count(*)::int as visits_count
  from windowed
  where created_at >= current_date - 6
  group by created_at::date
),
top_pages as (
  select page_path, count(*)::int as visits_count
  from windowed
  group by page_path
  order by visits_count desc
  limit 10
),
top_referrers as (
  select coalesce(referrer_host, 'Accès direct') as referrer, count(*)::int as visits_count
  from windowed
  group by coalesce(referrer_host, 'Accès direct')
  order by visits_count desc
  limit 10
),
top_devices as (
  select case device_type
    when 'mobile' then 'Téléphone'
    when 'tablet' then 'Tablette'
    when 'desktop' then 'Ordinateur'
    else 'Non déterminé'
  end as label, count(*)::int as visits_count
  from windowed
  group by 1
),
recent_page_views as (
  select page_path, referrer_host, device_type, created_at
  from windowed
  order by created_at desc
  limit 20
)
select jsonb_build_object(
  'periodDays', 180,
  'totalVisits', (select count(*)::int from windowed),
  'todayVisits', (select count(*)::int from windowed where created_at >= date_trunc('day', now())),
  'weekVisits', (select count(*)::int from windowed where created_at >= date_trunc('day', now()) - interval '6 days'),
  'monthVisits', (select count(*)::int from windowed where created_at >= now() - interval '30 days'),
  'suspectedBotVisits', (select count(*)::int from windowed where is_automated),
  'humanVisits', (select count(*)::int from windowed where not is_automated),
  'topPages', coalesce((select jsonb_agg(jsonb_build_object('page_path', page_path, 'count', visits_count) order by visits_count desc) from top_pages), '[]'::jsonb),
  'topReferrers', coalesce((select jsonb_agg(jsonb_build_object('referrer', referrer, 'count', visits_count) order by visits_count desc) from top_referrers), '[]'::jsonb),
  'topDevices', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', visits_count) order by visits_count desc) from top_devices), '[]'::jsonb),
  'dailyVisits', coalesce((
    select jsonb_agg(jsonb_build_object('date', to_char(d.day, 'DD/MM'), 'count', coalesce(dc.visits_count, 0)) order by d.day)
    from daily_days d left join daily_counts dc on dc.day = d.day
  ), '[]'::jsonb),
  'recentPageViews', coalesce((
    select jsonb_agg(jsonb_build_object(
      'page_path', page_path,
      'referrer_host', referrer_host,
      'device_type', device_type,
      'created_at', created_at
    ) order by created_at desc)
    from recent_page_views
  ), '[]'::jsonb)
);
$function$;

revoke all on function public.get_public_page_stats() from public, anon, authenticated;
grant execute on function public.get_public_page_stats() to service_role;
