-- Additive: library videos never share the customer results bucket.
create table public.showcase_videos (
 id uuid primary key, request_id uuid not null unique, object_key text not null unique,
 mime text not null check(mime in ('video/mp4','video/webm')),
 expected_size bigint not null check(expected_size between 12 and 20971520),
 title text not null default '' check(length(title)<=160),
 description text not null default '' check(length(description)<=20000),
 visibility text not null default 'hidden' check(visibility in ('hidden','public')),
 rights_confirmed boolean not null default false,
 validated boolean not null default false,
 version integer not null default 1 check(version>0),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 check(visibility <> 'public' or (validated and rights_confirmed and length(trim(title))>0))
);
alter table public.showcase_videos enable row level security;
revoke all on public.showcase_videos from public,anon,authenticated;
grant select,insert,update on public.showcase_videos to service_role;
create index showcase_list on public.showcase_videos(created_at desc,id) where deleted_at is null;
insert into storage.buckets(id,name,public,file_size_limit)
values('showcase-videos','showcase-videos',false,20971520) on conflict(id) do nothing;
do $$ begin
 if exists(select 1 from storage.buckets where id='showcase-videos' and (public or file_size_limit is null or file_size_limit>20971520)) then
 raise exception 'showcase-videos must be private and limited to 20 MB';end if;
end $$;
-- No anon/authenticated Storage policy. Backend grants exact upload capabilities;
-- public playback URLs are signed only for explicitly published editorial content.
