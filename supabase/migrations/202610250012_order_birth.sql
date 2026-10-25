-- Additive only: old orders remain byte-for-byte unchanged, no inferred birth values.
create function public.validate_order_birth(p jsonb) returns void language plpgsql set search_path='' as $$declare k text;v text;d date;h text;begin
 foreach k in array array['birth_date','birth_date2'] loop
  v:=p->>k;
  if k='birth_date' or p ? 'name2' then
   if v is null or v !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'valid birth date required';end if;
   d:=v::date;if to_char(d,'YYYY-MM-DD')<>v or d>(now() at time zone 'Asia/Ho_Chi_Minh')::date then raise exception 'birth date invalid or future';end if;
  elsif v is not null then raise exception 'unexpected second birth date';end if;
 end loop;
 foreach k in array array['birth_hour','birth_hour2'] loop
  h:=p->>k;if h is not null and h !~ '^([01][0-9]|2[0-3])$' then raise exception 'invalid birth hour';end if;
  if k='birth_hour2' and not(p ? 'name2') and h is not null then raise exception 'unexpected second birth hour';end if;
 end loop;
end$$;
revoke all on function public.validate_order_birth(jsonb) from public,anon,authenticated;
grant execute on function public.validate_order_birth(jsonb) to service_role;
create or replace function public.create_order_v2(p_package_version integer,p_key uuid,p_user uuid,p_code text,p_legacy_digest text,p_access_digest text,p_phone text,p_phone_hash text,p_package text,p_name text,p_inputs jsonb) returns jsonb language plpgsql security definer set search_path='' as $$declare v integer;r jsonb;o public.orders;c public.site_config;p public.service_packages;begin
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));if exists(select 1 from public.orders where idempotency_key=p_key) then return jsonb_build_object('created',false);end if;
 perform public.validate_order_birth(p_inputs);
 if p_package not in ('G10','G20','G60','G70') or p_access_digest is null or p_access_digest !~ '^[a-f0-9]{64}$' or coalesce(p_inputs->>'gender','') not in ('Nam','Nữ') or (p_inputs ? 'name2')<>(p_inputs ? 'gender2') then raise exception 'invalid order';end if;
 select * into strict p from public.service_packages where code=p_package and active and delivery_hours is null for share;v:=p.version;
 if v is distinct from p_package_version then raise exception using errcode='40001',message='package version conflict';end if;
 select * into c from public.site_config limit 1;
 if c.refund_policy is null or c.support is null or c.retention_approved is not true or c.release_verified is not true then raise exception 'checkout_locked';end if;
 if c.bank->>'bank_name' is distinct from 'SACOMBANK' or c.bank->>'account_number' is distinct from '040058981194' or c.bank->>'beneficiary' is distinct from 'NGUYỄN MINH CHÍNH' then raise exception 'bank mismatch';end if;
 if coalesce((p_inputs->>'photo_consent')::boolean,false) and p_inputs->>'age_band' is distinct from '18+' then raise exception 'adult photo consent required';end if;
 insert into public.orders(idempotency_key,user_id,order_code,package_code,price_vnd,delivery_hours,package_version,name,phone_e164,phone_lookup_hmac,inputs) values(p_key,p_user,p_code,p.code,p.price_vnd,null,p.version,p_name,p_phone,p_phone_hash,p_inputs) returning * into o;
 insert into public.order_credentials(order_id,secret_digest,access_digest) values(o.id,p_legacy_digest,p_access_digest);
 insert into public.consent_events(order_id,scope,granted,notice_version,age_band,actor) values(o.id,'service_processing',true,'order-v3-submit',coalesce(p_inputs->>'age_band','unknown'),p_user);
 r:=jsonb_build_object('created',true,'order_code',o.order_code,'price_vnd',o.price_vnd,'expires_at',o.expires_at,'bank',c.bank);
 if coalesce((p_inputs->>'photo_consent')::boolean,false) then insert into public.consent_events(order_id,scope,granted,notice_version,age_band,actor) values(o.id,'customer_photo_for_private_video',true,'order-v2-photo','18+',p_user);end if;
 return r;end$$;

revoke all on function public.create_order_v2(integer,uuid,uuid,text,text,text,text,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.create_order_v2(integer,uuid,uuid,text,text,text,text,text,text,text,jsonb) to service_role;

create function public.order_birth_schema_version() returns integer language sql stable set search_path='' as $$select 12$$;
revoke all on function public.order_birth_schema_version() from public,anon,authenticated;
grant execute on function public.order_birth_schema_version() to service_role;
update public.site_config set release_verified=false;
