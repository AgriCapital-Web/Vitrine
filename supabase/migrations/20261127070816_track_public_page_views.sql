create table public.public_page_events (
  id uuid primary key default gen_random_uuid(),
  page_path text not null check (length(page_path) between 1 and 2048 and left(page_path, 1) = '/'),
  referrer_host text check (referrer_host is null or length(referrer_host) <= 255),
  device_type text not null default 'unknown' check (device_type in ('mobile', 'tablet', 'desktop', 'unknown')),
  created_at timestamptz not null default now()
);

create index public_page_events_created_at_idx
  on public.public_page_events (created_at desc);
create index public_page_events_page_path_created_at_idx
  on public.public_page_events (page_path, created_at desc);

alter table public.public_page_events enable row level security;
revoke all on table public.public_page_events from anon, authenticated;
grant select, insert on table public.public_page_events to service_role;

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

revoke all on function public.record_public_page_view(text, text, text) from public, anon, authenticated;
grant execute on function public.record_public_page_view(text, text, text) to service_role;
