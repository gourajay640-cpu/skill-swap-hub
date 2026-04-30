CREATE OR REPLACE VIEW public.recent_swaps_feed
WITH (security_invoker = false)
AS
SELECT
  sr.id,
  sr.status::text AS status,
  sr.created_at,
  split_part(coalesce(rp.full_name, 'Engineer'), ' ', 1) AS requester_name,
  split_part(coalesce(vp.full_name, 'Engineer'), ' ', 1) AS receiver_name
FROM public.swap_requests sr
LEFT JOIN public.profiles rp ON rp.id = sr.requester_id
LEFT JOIN public.profiles vp ON vp.id = sr.receiver_id
ORDER BY sr.created_at DESC
LIMIT 20;

GRANT SELECT ON public.recent_swaps_feed TO anon, authenticated;