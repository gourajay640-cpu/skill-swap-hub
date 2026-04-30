alter publication supabase_realtime add table public.swap_requests;
alter table public.swap_requests replica identity full;