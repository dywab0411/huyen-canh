-- Additive migration: preserve existing order and reading snapshots.
create function public.confirm_payment_versioned(p_actor uuid,p_order uuid,p_version integer,p_amount integer,p_reference text,p_reason text) returns jsonb language plpgsql security definer set search_path='' as $$declare o public.orders;begin
 perform public.require_admin(p_actor);select * into strict o from public.orders where id=p_order for update;
 if p_amount<>o.price_vnd then raise exception 'amount mismatch';end if;
 if not exists(select 1 from public.payment_events where order_id=p_order and reference=p_reference and amount=p_amount and kind in ('verified','reconciled')) and o.version is distinct from p_version then raise exception using errcode='40001',message='order version conflict';end if;
 perform public.confirm_payment(p_actor,p_order,o.version,p_amount,p_reference,p_reason);
 select * into strict o from public.orders where id=p_order;
 return jsonb_build_object('id',o.id,'order_code',o.order_code,'package_code',o.package_code,'price_vnd',o.price_vnd,'internal_state',o.internal_state,'version',o.version);end$$;
create function public.write_result_versioned(p_actor uuid,p_order uuid,p_version integer,p_body text,p_publish boolean) returns jsonb language plpgsql security definer set search_path='' as $$declare o public.orders;begin
 perform public.require_admin(p_actor);select * into strict o from public.orders where id=p_order for update;
 if o.version is distinct from p_version then raise exception using errcode='40001',message='order version conflict';end if;
 perform public.write_result(p_actor,p_order,p_body,p_publish);
 if not p_publish then update public.orders set version=version+1,updated_at=now() where id=p_order;end if;
 select * into strict o from public.orders where id=p_order;
 return jsonb_build_object('id',o.id,'order_code',o.order_code,'package_code',o.package_code,'price_vnd',o.price_vnd,'internal_state',o.internal_state,'version',o.version);end$$;
create function public.create_order_quoted(p_package_version integer,p_key uuid,p_user uuid,p_code text,p_secret text,p_phone text,p_phone_hash text,p_package text,p_name text,p_email text,p_inputs jsonb) returns jsonb language plpgsql security definer set search_path='' as $$declare v integer;begin
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 if exists(select 1 from public.orders where idempotency_key=p_key) then return jsonb_build_object('created',false);end if;
 select version into strict v from public.service_packages where code=p_package and active for share;
 if v is distinct from p_package_version then raise exception using errcode='40001',message='package version conflict';end if;
 return public.create_order(p_key,p_user,p_code,p_secret,p_phone,p_phone_hash,p_package,p_name,p_email,p_inputs);end$$;
revoke all on function public.confirm_payment_versioned(uuid,uuid,integer,integer,text,text),public.write_result_versioned(uuid,uuid,integer,text,boolean),public.create_order_quoted(integer,uuid,uuid,text,text,text,text,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.confirm_payment_versioned(uuid,uuid,integer,integer,text,text),public.write_result_versioned(uuid,uuid,integer,text,boolean),public.create_order_quoted(integer,uuid,uuid,text,text,text,text,text,text,text,jsonb) to service_role;
revoke execute on function public.confirm_payment(uuid,uuid,integer,integer,text,text),public.write_result(uuid,uuid,text,boolean),public.create_order(uuid,uuid,text,text,text,text,text,text,text,jsonb) from service_role;
