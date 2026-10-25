create function public.release_attachment(p_actor uuid,p_attachment uuid,p_key text,p_checksum text,p_size bigint) returns void language plpgsql security definer set search_path='' as $$declare a public.attachments;begin
 perform public.require_admin(p_actor);select * into strict a from public.attachments where id=p_attachment for update;
 perform 1 from public.orders where id=a.order_id for update;
 if a.classification='source' and not coalesce((select granted from public.consent_events where order_id=a.order_id and scope='customer_photo_for_private_video' order by event_seq desc limit 1),false) then raise exception 'photo consent revoked';end if;
 if a.release_state<>'quarantine' or p_size<1 or p_size>20971520 or p_checksum !~ '^[a-f0-9]{64}$' or p_key not like a.order_id::text||'/%' then raise exception 'invalid release';end if;
 if (select coalesce(sum(size),0) from public.attachments where order_id=a.order_id and id<>a.id and release_state<>'rejected')+p_size>31457280 then raise exception 'quota';end if;
 update public.attachments set storage_key=p_key,checksum=p_checksum,size=p_size,release_state='released',updated_at=now() where id=p_attachment;
 insert into public.audit_events(actor,action,resource_id,changed_fields) values(p_actor,'attachment_validated_offline',p_attachment,array['checksum','storage_key','release_state']);end$$;
revoke all on function public.release_attachment(uuid,uuid,text,text,bigint) from public,anon,authenticated;
grant execute on function public.release_attachment(uuid,uuid,text,text,bigint) to service_role;
