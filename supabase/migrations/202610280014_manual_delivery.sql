-- Additive migration: existing paid orders and Auth users are not modified.
create table public.manual_deliveries (
 id uuid primary key, request_id uuid not null unique,
 access_code text not null unique check(length(access_code)>=43),
 code_digest text not null unique check(length(code_digest)=64),
 body text not null default '' check(length(body)<=50000),
 video_key text, published boolean not null default false,
 deleted_at timestamptz, version integer not null default 1 check(version>0),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.manual_delivery_uploads (
 object_key text primary key, delivery_id uuid not null references public.manual_deliveries(id),
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
alter table public.manual_deliveries enable row level security;
alter table public.manual_delivery_uploads enable row level security;
revoke all on public.manual_deliveries,public.manual_delivery_uploads from anon,authenticated;
grant select,insert,update on public.manual_deliveries,public.manual_delivery_uploads to service_role;
create index manual_deliveries_list on public.manual_deliveries(created_at desc) where deleted_at is null;
insert into storage.buckets(id,name,public,file_size_limit)
values('manual-results','manual-results',false,20971520) on conflict(id) do nothing;
-- No client Storage policy: all writes use short-lived server-generated upload tokens.

do $$ begin
 if exists(select 1 from storage.buckets where id='manual-results' and (public or file_size_limit is null or file_size_limit>20971520)) then
  raise exception 'manual-results must be private; review existing bucket before continuing';
 end if;
end $$;
