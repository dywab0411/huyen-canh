create function public.reserve_attachment(p_actor uuid,p_id uuid,p_order uuid,p_key text,p_bucket text,p_mime text,p_size bigint,p_classification text) returns void language plpgsql security definer set search_path='' as $$declare o public.orders;begin
 perform public.require_admin(p_actor);select * into strict o from public.orders where id=p_order for update;
 if (select coalesce(sum(size),0) from public.attachments where order_id=p_order and release_state<>'rejected')+p_size>31457280 then raise exception 'order attachment quota';end if;
 if p_classification='source' and (o.inputs->>'age_band'<>'18+' or not coalesce((select granted from public.consent_events where order_id=p_order and scope='customer_photo_for_private_video' order by event_seq desc limit 1),false)) then raise exception 'photo consent required';end if;
 if p_mime not in ('image/jpeg','image/png','image/webp','application/pdf','video/mp4','audio/mpeg','text/plain') then raise exception 'mime';end if;
 insert into public.attachments(id,order_id,storage_key,bucket,mime,size,checksum,classification,uploader) values(p_id,p_order,p_key,p_bucket,p_mime,p_size,'pending',p_classification,p_actor);
 insert into public.audit_events(actor,action,resource_id,changed_fields) values(p_actor,'attachment_quarantined',p_id,array['storage_key','mime','size']);end$$;
revoke all on function public.reserve_attachment(uuid,uuid,uuid,text,text,text,bigint,text) from public,anon,authenticated;
grant execute on function public.reserve_attachment(uuid,uuid,uuid,text,text,text,bigint,text) to service_role;
