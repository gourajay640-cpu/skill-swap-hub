DROP VIEW IF EXISTS public.recent_swaps_feed;

CREATE OR REPLACE FUNCTION public.get_recent_swaps_feed()
RETURNS TABLE (
  id uuid,
  status text,
  created_at timestamptz,
  requester_name text,
  receiver_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sr.id,
    sr.status::text,
    sr.created_at,
    split_part(coalesce(rp.full_name, 'Engineer'), ' ', 1),
    split_part(coalesce(vp.full_name, 'Engineer'), ' ', 1)
  FROM public.swap_requests sr
  LEFT JOIN public.profiles rp ON rp.id = sr.requester_id
  LEFT JOIN public.profiles vp ON vp.id = sr.receiver_id
  ORDER BY sr.created_at DESC
  LIMIT 20;
$$;

GRANT EXECUTE ON FUNCTION public.get_recent_swaps_feed() TO anon, authenticated;