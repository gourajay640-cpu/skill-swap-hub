import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = loadEnv();
const url = env.VITE_SUPABASE_URL ?? env.SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !anonKey) {
  fail("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
}

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const checks = [
  {
    name: "skills catalog",
    run: () => supabase.from("skills").select("id,name,slug,color,category").limit(30),
    requireRows: true,
  },
  {
    name: "profiles table",
    run: () => supabase.from("profiles").select("id,full_name,headline").limit(5),
  },
  {
    name: "user_skills table",
    run: () => supabase.from("user_skills").select("user_id,skill_id,kind").limit(5),
  },
  {
    name: "swap_requests table",
    run: () => supabase.from("swap_requests").select("id,status,requester_id,receiver_id").limit(5),
  },
  {
    name: "potential_matches view",
    run: () =>
      supabase
        .from("potential_matches")
        .select("user_a_id,user_b_id,a_teaches_skill_id,b_teaches_skill_id")
        .limit(5),
  },
  {
    name: "recent feed rpc",
    run: () => supabase.rpc("get_recent_swaps_feed", { p_limit: 5 }),
  },
];

const results = [];
let hasFailure = false;

for (const check of checks) {
  try {
    const { data, error } = await check.run();
    const count = Array.isArray(data) ? data.length : data ? 1 : 0;
    const ok = !error && (!check.requireRows || count > 0);
    if (!ok) hasFailure = true;
    results.push({
      name: check.name,
      ok,
      rowsVisible: count,
      message: error?.message ?? (check.requireRows && count === 0 ? "No rows visible" : "OK"),
    });
  } catch (error) {
    hasFailure = true;
    results.push({
      name: check.name,
      ok: false,
      rowsVisible: 0,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

for (const result of results) {
  const icon = result.ok ? "PASS" : "FAIL";
  console.log(`${icon} ${result.name} (${result.rowsVisible} rows visible): ${result.message}`);
}

const dataReadiness = await getDataReadiness();
console.log("");
console.log("Data readiness:");
for (const item of dataReadiness) {
  console.log(`- ${item.label}: ${item.count}`);
}

if (hasFailure) {
  process.exitCode = 1;
}

async function getDataReadiness() {
  const [profiles, skills, swaps] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("user_skills").select("id", { count: "exact", head: true }),
    supabase.from("swap_requests").select("id", { count: "exact", head: true }),
  ]);

  return [
    { label: "profiles", count: profiles.count ?? 0 },
    { label: "user skills", count: skills.count ?? 0 },
    { label: "swap requests visible to current anon context", count: swaps.count ?? 0 },
  ];
}

function loadEnv() {
  try {
    return Object.fromEntries(
      readFileSync(".env", "utf8")
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const index = line.indexOf("=");
          const key = line.slice(0, index);
          const value = line.slice(index + 1).replace(/^"|"$/g, "");
          return [key, value];
        }),
    );
  } catch {
    return process.env;
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
