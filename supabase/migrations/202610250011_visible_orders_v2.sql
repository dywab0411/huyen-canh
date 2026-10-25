-- New catalog and secure one-field access. Existing order snapshots are never updated.
alter table public.service_packages drop constraint service_packages_code_check;
alter table public.service_packages add constraint service_packages_code_check check(code in ('G10','G20','G50','G60','G70'));
alter table public.service_packages alter column delivery_hours drop not null;
alter table public.orders alter column delivery_hours drop not null;
alter table public.consent_events drop constraint consent_events_age_band_check;
alter table public.consent_events add constraint consent_events_age_band_check check(age_band in ('16-17','18+','unknown'));
update public.service_packages set active=false,version=version+1 where code='G50';
update public.service_packages set price_vnd=case code when 'G10' then 10000 else 20000 end,delivery_hours=null,version=version+1 where code in ('G10','G20');
insert into public.service_packages(code,price_vnd,delivery_hours) values('G60',60000,null),('G70',70000,null);
update public.site_config set bank='{"bank_name":"SACOMBANK","account_number":"040058981194","beneficiary":"NGUYỄN MINH CHÍNH"}',support='Chính Nguyễn — 0343321608; Quỳnh Chi — 0328026738',release_verified=false;
alter table public.order_credentials add column access_digest text check(access_digest is null or access_digest ~ '^[a-f0-9]{64}$');
create unique index order_access_digest_unique on public.order_credentials(access_digest) where access_digest is not null;

create function public.create_order_v2(p_package_version integer,p_key uuid,p_user uuid,p_code text,p_legacy_digest text,p_access_digest text,p_phone text,p_phone_hash text,p_package text,p_name text,p_inputs jsonb) returns jsonb language plpgsql security definer set search_path='' as $$declare v integer;r jsonb;o public.orders;c public.site_config;p public.service_packages;begin
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));if exists(select 1 from public.orders where idempotency_key=p_key) then return jsonb_build_object('created',false);end if;
 if p_package not in ('G10','G20','G60','G70') or p_access_digest is null or p_access_digest !~ '^[a-f0-9]{64}$' or coalesce(p_inputs->>'gender','') not in ('Nam','Nữ') or (p_inputs ? 'name2')<>(p_inputs ? 'gender2') then raise exception 'invalid order';end if;
 select * into strict p from public.service_packages where code=p_package and active and delivery_hours is null for share;v:=p.version;
 if v is distinct from p_package_version then raise exception using errcode='40001',message='package version conflict';end if;
 select * into c from public.site_config limit 1;
 if c.refund_policy is null or c.support is null or c.retention_approved is not true or c.release_verified is not true then raise exception 'checkout_locked';end if;
 if c.bank->>'bank_name' is distinct from 'SACOMBANK' or c.bank->>'account_number' is distinct from '040058981194' or c.bank->>'beneficiary' is distinct from 'NGUYỄN MINH CHÍNH' then raise exception 'bank mismatch';end if;
 if coalesce((p_inputs->>'photo_consent')::boolean,false) and p_inputs->>'age_band' is distinct from '18+' then raise exception 'adult photo consent required';end if;
 insert into public.orders(idempotency_key,user_id,order_code,package_code,price_vnd,delivery_hours,package_version,name,phone_e164,phone_lookup_hmac,inputs) values(p_key,p_user,p_code,p.code,p.price_vnd,null,p.version,p_name,p_phone,p_phone_hash,p_inputs) returning * into o;
 insert into public.order_credentials(order_id,secret_digest,access_digest) values(o.id,p_legacy_digest,p_access_digest);
 insert into public.consent_events(order_id,scope,granted,notice_version,age_band,actor) values(o.id,'service_processing',true,'order-v2-submit',coalesce(p_inputs->>'age_band','unknown'),p_user);
 r:=jsonb_build_object('created',true,'order_code',o.order_code,'price_vnd',o.price_vnd,'expires_at',o.expires_at,'bank',c.bank);
 if coalesce((p_inputs->>'photo_consent')::boolean,false) then insert into public.consent_events(order_id,scope,granted,notice_version,age_band,actor) values(o.id,'customer_photo_for_private_video',true,'order-v2-photo','18+',p_user);end if;
 return r;end$$;

create function public.lookup_order_access(p_digest text,p_session text,p_csrf text) returns jsonb language plpgsql security definer set search_path='' as $$declare o public.orders;r public.reading_results;begin
 select o1.* into o from public.orders o1 join public.order_credentials c on c.order_id=o1.id where c.access_digest=p_digest and c.revoked_at is null;
 if o.id is null then return null;end if;
 insert into public.lookup_sessions(token_digest,csrf_digest,order_id) values(p_session,p_csrf,o.id);
 select * into r from public.reading_results where order_id=o.id and state='published';
 return jsonb_build_object('order_code',o.order_code,'price_vnd',o.price_vnd,'package_code',o.package_code,'result',case when r.id is null then null else jsonb_build_object('body',r.body,'revision',r.revision) end,'attachments',case when r.id is null then '[]'::jsonb else (select coalesce(jsonb_agg(jsonb_build_object('id',id,'mime',mime,'size',size)),'[]'::jsonb) from public.attachments where order_id=o.id and classification='private_result' and release_state='released') end);end$$;
create function public.upgrade_order_access(p_order uuid,p_digest text) returns void language plpgsql security definer set search_path='' as $$begin
 perform 1 from public.orders where id=p_order for update;
 if p_digest !~ '^[a-f0-9]{64}$' then raise exception 'digest';end if;
 update public.order_credentials set access_digest=p_digest,updated_at=now() where order_id=p_order and access_digest is null and revoked_at is null;
 if not found then raise exception using errcode='40001',message='access code already issued';end if;
 insert into public.audit_events(action,resource_id,changed_fields) values('legacy_access_upgraded',p_order,array['access_digest']);end$$;
create function public.reset_order_access(p_actor uuid,p_order uuid,p_digest text,p_legacy_digest text,p_reason text) returns void language plpgsql security definer set search_path='' as $$begin
 perform public.require_admin(p_actor,true);perform 1 from public.orders where id=p_order for update;
 if length(trim(p_reason))<20 or p_digest !~ '^[a-f0-9]{64}$' then raise exception 'verified recovery required';end if;
 update public.order_credentials set access_digest=p_digest,secret_digest=p_legacy_digest,revoked_at=null,updated_at=now() where order_id=p_order;
 update public.lookup_sessions set revoked_at=now() where order_id=p_order;
 insert into public.audit_events(actor,action,resource_id,changed_fields) values(p_actor,'access_reset_verified',p_order,array['access_digest','sessions']);end$$;
create or replace function public.reset_credential(p_actor uuid,p_order uuid,p_digest text,p_reason text) returns void language plpgsql security definer set search_path='' as $$begin perform public.require_admin(p_actor,true);perform 1 from public.orders where id=p_order for update;if length(trim(p_reason))<20 then raise exception 'verification reason required';end if;update public.order_credentials set secret_digest=p_digest,access_digest=null,pepper_version=1,revoked_at=null,updated_at=now() where order_id=p_order;update public.lookup_sessions set revoked_at=now() where order_id=p_order;insert into public.audit_events(actor,action,resource_id,changed_fields) values(p_actor,'credential_reset_verified',p_order,array['secret_digest','access_digest','sessions']);end$$;

create function public.reserve_customer_photo(p_order uuid,p_id uuid,p_mime text,p_size bigint) returns void language plpgsql security definer set search_path='' as $$declare o public.orders;begin
 select * into strict o from public.orders where id=p_order for update;
 if o.inputs->>'age_band' is distinct from '18+' or not coalesce((select granted from public.consent_events where order_id=o.id and scope='customer_photo_for_private_video' order by event_seq desc limit 1),false) or p_mime not in ('image/jpeg','image/png','image/webp') or p_size<1 or p_size>5242880 then raise exception 'private photo permission required';end if;
 if (select coalesce(sum(size),0) from public.attachments where order_id=p_order and release_state<>'rejected')+p_size>31457280 then raise exception 'quota';end if;
 insert into public.attachments(id,order_id,storage_key,bucket,mime,size,checksum,classification) values(p_id,p_order,p_order::text||'/'||p_id::text,'source-photos',p_mime,p_size,'pending','source');
 insert into public.audit_events(action,resource_id,changed_fields) values('customer_photo_quarantined',p_order,array['source_photo']);end$$;

create or replace function public.write_result_versioned(p_actor uuid,p_order uuid,p_version integer,p_body text,p_publish boolean) returns jsonb language plpgsql security definer set search_path='' as $$declare o public.orders;begin
 perform public.require_admin(p_actor);select * into strict o from public.orders where id=p_order for update;
 if o.version is distinct from p_version then raise exception using errcode='40001',message='order version conflict';end if;
 if p_publish and o.package_code in ('G60','G70') and not exists(select 1 from public.attachments where order_id=p_order and classification='private_result' and mime='video/mp4' and release_state='released') then raise exception 'video required';end if;
 perform public.write_result(p_actor,p_order,p_body,p_publish);if not p_publish then update public.orders set version=version+1,updated_at=now() where id=p_order;end if;
 select * into strict o from public.orders where id=p_order;return jsonb_build_object('id',o.id,'order_code',o.order_code,'package_code',o.package_code,'price_vnd',o.price_vnd,'internal_state',o.internal_state,'version',o.version);end$$;
create or replace function public.set_package(p_actor uuid,p_code text,p_price integer,p_hours integer,p_version integer) returns void language plpgsql security definer set search_path='' as $$begin perform public.require_admin(p_actor,true);if p_code not in ('G10','G20','G60','G70') or p_price<1000 or p_price>10000000 or p_hours is not null then raise exception 'package invalid';end if;update public.service_packages set price_vnd=p_price,delivery_hours=null,version=version+1,updated_at=now() where code=p_code and version=p_version and active;if not found then raise exception using errcode='40001',message='version conflict';end if;update public.site_config set release_verified=false;insert into public.audit_events(actor,action,changed_fields) values(p_actor,'package_changed_release_locked',array['price_vnd','version']);end$$;
do $$declare f record;begin for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('create_order_v2','lookup_order_access','upgrade_order_access','reset_order_access','reset_credential','reserve_customer_photo','write_result_versioned','set_package') loop execute format('revoke all on function %s from public,anon,authenticated',f.signature);execute format('grant execute on function %s to service_role',f.signature);end loop;end$$;
