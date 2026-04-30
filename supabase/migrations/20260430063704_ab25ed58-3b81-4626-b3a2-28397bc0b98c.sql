DROP FUNCTION IF EXISTS public.get_recent_swaps_feed();
DROP FUNCTION IF EXISTS public.get_recent_swaps_feed(integer, timestamptz, text);

CREATE OR REPLACE FUNCTION public.get_recent_swaps_feed(
  p_limit integer DEFAULT 10,
  p_before timestamptz DEFAULT NULL,
  p_skill text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  status text,
  created_at timestamptz,
  requester_name text,
  receiver_name text,
  requester_skill text,
  receiver_skill text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      sr.id,
      sr.status::text AS status,
      sr.created_at,
      split_part(coalesce(rp.full_name, 'Engineer'), ' ', 1) AS requester_name,
      split_part(coalesce(vp.full_name, 'Engineer'), ' ', 1) AS receiver_name,
      (
        SELECT s.name FROM public.user_skills us
        JOIN public.skills s ON s.id = us.skill_id
        WHERE us.user_id = sr.requester_id AND us.kind = 'knows'
        ORDER BY us.created_at ASC LIMIT 1
      ) AS requester_skill,
      (
        SELECT s.name FROM public.user_skills us
        JOIN public.skills s ON s.id = us.skill_id
        WHERE us.user_id = sr.receiver_id AND us.kind = 'knows'
        ORDER BY us.created_at ASC LIMIT 1
      ) AS receiver_skill
    FROM public.swap_requests sr
    LEFT JOIN public.profiles rp ON rp.id = sr.requester_id
    LEFT JOIN public.profiles vp ON vp.id = sr.receiver_id
    WHERE (p_before IS NULL OR sr.created_at < p_before)
  )
  SELECT *
  FROM base
  WHERE p_skill IS NULL
     OR lower(requester_skill) = lower(p_skill)
     OR lower(receiver_skill)  = lower(p_skill)
  ORDER BY created_at DESC
  LIMIT greatest(1, least(coalesce(p_limit, 10), 50));
$$;

GRANT EXECUTE ON FUNCTION public.get_recent_swaps_feed(integer, timestamptz, text) TO anon, authenticated;