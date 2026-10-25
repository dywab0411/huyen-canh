-- Read-only verification after applying migrations001–013 to a NEW staging project.
-- Does not return customer rows, contacts, codes, credentials or signed URLs.
select 'schema_version' as check_name, public.order_birth_schema_version()=13 as pass;
select c.relname as table_name,c.relrowsecurity as rls_enabled from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' order by c.relname;
select id,public as bucket_is_public,file_size_limit from storage.buckets where id in ('source-photos','private-results','public-derivatives','library-media') order by id;
select 'anon_orders_select_denied' as check_name,not has_table_privilege('anon','public.orders','select') as pass
union all select 'authenticated_orders_select_denied',not has_table_privilege('authenticated','public.orders','select')
union all select 'anon_credentials_select_denied',not has_table_privilege('anon','public.order_credentials','select')
union all select 'anon_private_rpc_denied',not has_function_privilege('anon','public.lookup_order_access(text,text,text)','execute');
select code,price_vnd,delivery_hours,active,version from public.service_packages order by price_vnd;
select release_verified=false as release_remains_locked,retention_approved from public.site_config;
select schemaname,tablename,policyname,roles,cmd from pg_policies where schemaname in ('public','storage') order by schemaname,tablename,policyname;
-- Expected: all app tables RLS=true, four buckets public=false, all denied checks=true,
-- active G10/G20/G60/G70 only, release_remains_locked=true. Review all policies.
-- This SQL is not proof of real Auth/MFA, API cross-order access, Storage URLs or concurrency.
