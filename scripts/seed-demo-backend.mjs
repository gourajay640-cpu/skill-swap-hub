import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = loadEnv();
const url = env.VITE_SUPABASE_URL ?? env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey || serviceRoleKey.includes("your-service-role-key")) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.");
  console.error(
    "Add it locally from Supabase Project Settings > API, then rerun npm run backend:seed.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const demoUsers = [
  {
    email: "demo-react@skill-swap-hub.local",
    fullName: "Maya React",
    headline: "Frontend mentor",
    bio: "I help teams untangle React apps and TypeScript component systems.",
    knows: ["react", "typescript"],
    wants: ["python", "aws"],
  },
  {
    email: "demo-python@skill-swap-hub.local",
    fullName: "Arjun Python",
    headline: "Backend and data mentor",
    bio: "I teach Python services, APIs, and pragmatic cloud workflows.",
    knows: ["python", "aws"],
    wants: ["react", "typescript"],
  },
  {
    email: "demo-devops@skill-swap-hub.local",
    fullName: "Nora DevOps",
    headline: "Platform engineer",
    bio: "I can pair on Docker, Kubernetes, deployments, and infrastructure basics.",
    knows: ["docker", "kubernetes"],
    wants: ["go", "rust"],
  },
  {
    email: "demo-go@skill-swap-hub.local",
    fullName: "Leo Go",
    headline: "Systems engineer",
    bio: "I teach Go services and Rust fundamentals through small production patterns.",
    knows: ["go", "rust"],
    wants: ["docker", "kubernetes"],
  },
];

const skillCatalog = [
  ["react", "React", "#38bdf8", "Frontend"],
  ["typescript", "TypeScript", "#3b82f6", "Frontend"],
  ["python", "Python", "#facc15", "Backend"],
  ["aws", "AWS", "#fb923c", "DevOps"],
  ["docker", "Docker", "#0ea5e9", "DevOps"],
  ["kubernetes", "Kubernetes", "#6366f1", "DevOps"],
  ["go", "Go", "#22d3ee", "Backend"],
  ["rust", "Rust", "#f97316", "Backend"],
];

console.log("Ensuring required skills exist...");
const { error: skillsError } = await supabase.from("skills").upsert(
  skillCatalog.map(([slug, name, color, category]) => ({ slug, name, color, category })),
  { onConflict: "slug" },
);
if (skillsError) throw skillsError;

const { data: skills, error: skillReadError } = await supabase
  .from("skills")
  .select("id,slug")
  .in(
    "slug",
    skillCatalog.map(([slug]) => slug),
  );
if (skillReadError) throw skillReadError;

const skillBySlug = new Map(skills.map((skill) => [skill.slug, skill.id]));
const authUsers = [];

for (const demo of demoUsers) {
  const user = await ensureAuthUser(demo);
  authUsers.push({ ...demo, id: user.id });
}

console.log("Upserting demo profiles...");
const { error: profileError } = await supabase.from("profiles").upsert(
  authUsers.map((user) => ({
    id: user.id,
    full_name: user.fullName,
    headline: user.headline,
    bio: user.bio,
  })),
);
if (profileError) throw profileError;

console.log("Replacing demo user skills...");
const demoIds = authUsers.map((user) => user.id);
const { error: deleteSkillError } = await supabase
  .from("user_skills")
  .delete()
  .in("user_id", demoIds);
if (deleteSkillError) throw deleteSkillError;

const userSkillRows = authUsers.flatMap((user) => [
  ...user.knows.map((slug) => ({
    user_id: user.id,
    skill_id: skillBySlug.get(slug),
    kind: "knows",
  })),
  ...user.wants.map((slug) => ({
    user_id: user.id,
    skill_id: skillBySlug.get(slug),
    kind: "wants",
  })),
]);

const { error: userSkillError } = await supabase.from("user_skills").insert(userSkillRows);
if (userSkillError) throw userSkillError;

console.log("Replacing demo swap requests...");
const { error: deleteSwapError } = await supabase
  .from("swap_requests")
  .delete()
  .or(`requester_id.in.(${demoIds.join(",")}),receiver_id.in.(${demoIds.join(",")})`);
if (deleteSwapError) throw deleteSwapError;

const byEmail = new Map(authUsers.map((user) => [user.email, user]));
const swapRows = [
  {
    requester_id: byEmail.get("demo-react@skill-swap-hub.local").id,
    receiver_id: byEmail.get("demo-python@skill-swap-hub.local").id,
    status: "accepted",
    message: "I can help with React and TypeScript, and would love Python guidance.",
  },
  {
    requester_id: byEmail.get("demo-devops@skill-swap-hub.local").id,
    receiver_id: byEmail.get("demo-go@skill-swap-hub.local").id,
    status: "pending",
    message: "I can help with Docker/Kubernetes and want to learn Go/Rust.",
  },
];

const { error: swapError } = await supabase.from("swap_requests").insert(swapRows);
if (swapError) throw swapError;

console.log("Demo backend seed complete.");
console.log("- Created/updated 4 demo auth users");
console.log("- Added complementary knows/wants skills");
console.log("- Added accepted and pending swap requests");

async function ensureAuthUser(demo) {
  const existing = await findUserByEmail(demo.email);
  if (existing) return existing;

  const { data, error } = await supabase.auth.admin.createUser({
    email: demo.email,
    email_confirm: true,
    user_metadata: { full_name: demo.fullName },
  });
  if (error) throw error;
  return data.user;
}

async function findUserByEmail(email) {
  let page = 1;
  while (page < 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const user = data.users.find((candidate) => candidate.email === email);
    if (user) return user;
    if (data.users.length < 100) return null;
    page += 1;
  }
  return null;
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
