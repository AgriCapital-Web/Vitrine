create or replace function public.record_public_page_view(
  p_page_path text,
  p_referrer_host text default null,
  p_device_type text default 'unknown'
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_week timestamptz := date_trunc('week', now());
  normalized_path text := left(btrim(coalesce(p_page_path, '/')), 2048);
  normalized_device text := case
    when p_device_type in ('mobile', 'tablet', 'desktop') then p_device_type
    else 'unknown'
  end;
begin
  if normalized_path = '' or left(normalized_path, 1) <> '/' or normalized_path like '/admin%' then
    raise exception 'Invalid public page path';
  end if;

  insert into public.public_page_events (page_path, referrer_host, device_type)
  values (normalized_path, nullif(left(btrim(coalesce(p_referrer_host, '')), 255), ''), normalized_device);

  insert into public.visitor_counters (id, total_visitors, weekly_visitors, week_started_at, updated_at)
  values ('public', 5, 5, current_week, now())
  on conflict (id) do update
  set total_visitors = public.visitor_counters.total_visitors + 5,
      weekly_visitors = case
        when public.visitor_counters.week_started_at < current_week then 5
        else public.visitor_counters.weekly_visitors + 5
      end,
      week_started_at = case
        when public.visitor_counters.week_started_at < current_week then current_week
        else public.visitor_counters.week_started_at
      end,
      updated_at = now();
end;
$function$;

create or replace function public.record_public_page_view(
  p_page_path text,
  p_referrer_host text,
  p_device_type text,
  p_is_automated boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_week timestamptz := date_trunc('week', now());
  normalized_path text := left(btrim(coalesce(p_page_path, '/')), 2048);
  normalized_device text := case
    when p_device_type in ('mobile', 'tablet', 'desktop') then p_device_type
    else 'unknown'
  end;
begin
  if normalized_path = '' or left(normalized_path, 1) <> '/' or normalized_path like '/admin%' then
    raise exception 'Invalid public page path';
  end if;

  insert into public.public_page_events (page_path, referrer_host, device_type, is_automated)
  values (
    normalized_path,
    nullif(left(btrim(coalesce(p_referrer_host, '')), 255), ''),
    normalized_device,
    coalesce(p_is_automated, false)
  );

  insert into public.visitor_counters (id, total_visitors, weekly_visitors, week_started_at, updated_at)
  values ('public', 5, 5, current_week, now())
  on conflict (id) do update
  set total_visitors = public.visitor_counters.total_visitors + 5,
      weekly_visitors = case
        when public.visitor_counters.week_started_at < current_week then 5
        else public.visitor_counters.weekly_visitors + 5
      end,
      week_started_at = case
        when public.visitor_counters.week_started_at < current_week then current_week
        else public.visitor_counters.week_started_at
      end,
      updated_at = now();
end;
$function$;

revoke all on function public.record_public_page_view(text, text, text) from public, anon, authenticated;
grant execute on function public.record_public_page_view(text, text, text) to service_role;
revoke all on function public.record_public_page_view(text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.record_public_page_view(text, text, text, boolean) to service_role;
