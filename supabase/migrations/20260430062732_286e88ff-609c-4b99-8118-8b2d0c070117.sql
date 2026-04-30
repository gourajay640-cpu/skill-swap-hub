-- Add category column to skills
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS category text;

-- Categorize existing skills
UPDATE public.skills SET category = 'Frontend' WHERE slug IN ('react','vue','svelte','nextjs','tailwindcss','javascript','typescript');
UPDATE public.skills SET category = 'Backend' WHERE slug IN ('nodejs','python','go','rust','java','ruby','php','elixir','cpp','graphql');
UPDATE public.skills SET category = 'DevOps' WHERE slug IN ('docker','kubernetes','aws','terraform');
UPDATE public.skills SET category = 'Database' WHERE slug IN ('postgresql','mongodb','redis');
UPDATE public.skills SET category = 'Mobile' WHERE slug IN ('swift','kotlin');
UPDATE public.skills SET category = 'AI' WHERE slug IN ('ml','tensorflow');
UPDATE public.skills SET category = 'Design' WHERE slug IN ('figma');
UPDATE public.skills SET category = 'Blockchain' WHERE slug IN ('solidity');
UPDATE public.skills SET category = 'Other' WHERE category IS NULL;

-- Create the potential_matches view: pairs of users where A's "knows" matches B's "wants" AND B's "knows" matches A's "wants"
CREATE OR REPLACE VIEW public.potential_matches
WITH (security_invoker = true)
AS
SELECT DISTINCT
  a_knows.user_id        AS user_a_id,
  b_knows.user_id        AS user_b_id,
  a_knows.skill_id       AS a_teaches_skill_id,
  b_knows.skill_id       AS b_teaches_skill_id
FROM public.user_skills a_knows
JOIN public.user_skills b_wants
  ON b_wants.skill_id = a_knows.skill_id
 AND b_wants.kind = 'wants'
 AND b_wants.user_id <> a_knows.user_id
JOIN public.user_skills b_knows
  ON b_knows.user_id = b_wants.user_id
 AND b_knows.kind = 'knows'
JOIN public.user_skills a_wants
  ON a_wants.user_id = a_knows.user_id
 AND a_wants.kind = 'wants'
 AND a_wants.skill_id = b_knows.skill_id
WHERE a_knows.kind = 'knows';

GRANT SELECT ON public.potential_matches TO anon, authenticated;