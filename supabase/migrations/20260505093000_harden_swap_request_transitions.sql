create or replace function public.enforce_swap_request_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if new.requester_id <> old.requester_id or new.receiver_id <> old.receiver_id then
    raise exception 'Swap request participants cannot be changed';
  end if;

  if new.id <> old.id or new.created_at <> old.created_at then
    raise exception 'Swap request identity fields cannot be changed';
  end if;

  if old.status <> 'pending' then
    raise exception 'Only pending swap requests can be updated';
  end if;

  if current_user_id = old.receiver_id and new.status in ('accepted', 'rejected') then
    return new;
  end if;

  if current_user_id = old.requester_id and new.status = 'cancelled' then
    return new;
  end if;

  raise exception 'You are not allowed to make this swap request transition';
end;
$$;

drop trigger if exists swap_requests_enforce_transition on public.swap_requests;
create trigger swap_requests_enforce_transition
  before update on public.swap_requests
  for each row execute function public.enforce_swap_request_transition();

drop policy if exists "Participants can update their swap requests" on public.swap_requests;

create policy "Participants can update pending swap status"
  on public.swap_requests for update
  using (
    status = 'pending'
    and (auth.uid() = requester_id or auth.uid() = receiver_id)
  )
  with check (
    auth.uid() = requester_id or auth.uid() = receiver_id
  );

revoke execute on function public.enforce_swap_request_transition() from public, anon, authenticated;
