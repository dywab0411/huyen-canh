-- New submissions use exact HH:mm. Do not update legacy hour-only snapshots or infer minutes.
create or replace function public.validate_order_birth(p jsonb) returns void language plpgsql set search_path='' as $$declare k text;v text;d date;h text;begin
 foreach k in array array['birth_date','birth_date2'] loop
  v:=p->>k;
  if k='birth_date' or p ? 'name2' then
   if v is null or v !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'valid birth date required';end if;
   d:=v::date;if to_char(d,'YYYY-MM-DD')<>v or d>(now() at time zone 'Asia/Ho_Chi_Minh')::date then raise exception 'birth date invalid or future';end if;
  elsif v is not null then raise exception 'unexpected second birth date';end if;
 end loop;
 foreach k in array array['birth_hour','birth_hour2'] loop
  h:=p->>k;if h is not null and h !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'invalid birth hour';end if;
  if k='birth_hour2' and not(p ? 'name2') and h is not null then raise exception 'unexpected second birth hour';end if;
 end loop;
end$$;
create or replace function public.order_birth_schema_version() returns integer language sql stable set search_path='' as $$select 13$$;
revoke all on function public.validate_order_birth(jsonb),public.order_birth_schema_version() from public,anon,authenticated;
grant execute on function public.validate_order_birth(jsonb),public.order_birth_schema_version() to service_role;
update public.site_config set release_verified=false;
