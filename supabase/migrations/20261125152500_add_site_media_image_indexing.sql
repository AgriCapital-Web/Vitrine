alter table public.site_media
  add column if not exists is_search_indexable boolean not null default false;

comment on column public.site_media.is_search_indexable is
  'Autorisation éditoriale explicite d’inclure cette image dans le sitemap Google.';

create index if not exists site_media_search_indexable_idx
  on public.site_media (created_at desc)
  where is_active = true and is_archived = false and is_search_indexable = true;
