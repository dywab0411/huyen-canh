alter table public.consent_events add column event_seq bigint generated always as identity unique;
create table public.external_removal_tasks(id uuid primary key default gen_random_uuid(),media_id uuid not null references public.public_media,platform text not null,state text not null default 'pending' check(state in ('pending','completed')),completed_by uuid references auth.users,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.external_removal_tasks enable row level security;
revoke all on public.external_removal_tasks from anon,authenticated;
grant all on all tables in schema public to service_role;
grant usage,select on all sequences in schema public to service_role;
create function public.change_consent(p_order uuid,p_asset uuid,p_scope text,p_granted boolean) returns void language plpgsql security definer set search_path='' as $$declare a public.attachments;o public.orders;begin
 select * into strict o from public.orders where id=p_order for update;
 select * into strict a from public.attachments where id=p_asset and order_id=p_order;
 if p_scope not in ('customer_photo_for_private_video','website_public_gallery','youtube_publication','tiktok_publication') then raise exception 'scope';end if;
 if p_granted and o.inputs->>'age_band'<>'18+' then raise exception 'adult required';end if;
 if p_granted and p_scope<>'customer_photo_for_private_video' and (a.classification<>'public_derivative' or a.release_state<>'released') then raise exception 'previewed derivative required';end if;
 insert into public.consent_events(order_id,scope,granted,asset_id,asset_hash,asset_version,notice_version,age_band) values(p_order,p_scope,p_granted,a.id,a.checksum,a.asset_version,'v1',o.inputs->>'age_band');
 if not p_granted then
 insert into public.external_removal_tasks(media_id,platform) select id,platform from public.public_media where asset_id=p_asset and platform=p_scope and platform<>'website_public_gallery' and state in ('approved','published');
 update public.public_media set state='withdrawn',updated_at=now() where asset_id=p_asset and platform=p_scope;end if;
 insert into public.audit_events(action,resource_id,changed_fields) values(case when p_granted then 'consent_granted' else 'consent_revoked' end,p_order,array[p_scope]);end$$;
create function public.publish_media(p_actor uuid,p_asset uuid,p_scope text) returns void language plpgsql security definer set search_path='' as $$declare a public.attachments;c public.consent_events;begin
 perform public.require_admin(p_actor,true);select * into strict a from public.attachments where id=p_asset;
 perform 1 from public.orders where id=a.order_id for update;
 if a.classification<>'public_derivative' or a.release_state<>'released' then raise exception 'invalid asset';end if;
 select * into c from public.consent_events where order_id=a.order_id and asset_id=a.id and scope=p_scope order by event_seq desc limit 1;
 if c.id is null or not c.granted or c.age_band<>'18+' or c.asset_hash<>a.checksum or c.asset_version<>a.asset_version then raise exception 'consent required';end if;
 insert into public.public_media(asset_id,consent_id,platform,state) values(a.id,c.id,p_scope,case when p_scope='website_public_gallery' then 'published' else 'approved' end);
 insert into public.audit_events(actor,action,resource_id,changed_fields) values(p_actor,'media_approved',a.id,array[p_scope]);end$$;
create function public.retention_dry_run(p_now timestamptz default now()) returns table(resource_id uuid,reason text) language sql security definer set search_path='' as $$select id,'expired_unpaid_30d' from public.orders where internal_state='expired' and expires_at<p_now-interval '30 days' union all select id,'delivered_180d_review_before_delete' from public.orders where internal_state='delivered' and delivered_at<p_now-interval '180 days'$$;
revoke all on function public.change_consent(uuid,uuid,text,boolean),public.publish_media(uuid,uuid,text),public.retention_dry_run(timestamptz) from public,anon,authenticated;
grant execute on function public.change_consent(uuid,uuid,text,boolean),public.publish_media(uuid,uuid,text),public.retention_dry_run(timestamptz) to service_role;
