import { execFileSync } from "node:child_process";

const projectRef = process.env.SUPABASE_PROJECT_REF || "cnlqxnnbqqvthyaomwzj";

function runSupabaseDbQuery(sql) {
  // Uses npx so we don't require global supabase.
  const args = [
    "--yes",
    "supabase",
    "db",
    "query",
    "--linked",
    "--output",
    "json",
    "--agent",
    "no",
    sql,
  ];

  try {
    return execFileSync("npx", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const stdout = err?.stdout?.toString?.() ?? "";
    const stderr = err?.stderr?.toString?.() ?? "";
    const message = [
      "Failed to query linked Supabase database.",
      "- Ensure you are authenticated: set SUPABASE_ACCESS_TOKEN or run `npx supabase login`.",
      `- Ensure project is linked (requires DB password): npx supabase link --project-ref ${projectRef}`,
      "- If you already linked, try: npm run supabase:fix:todos && npm run supabase:reload",
      stderr && `\nCLI stderr:\n${stderr}`,
      stdout && `\nCLI stdout:\n${stdout}`,
    ]
      .filter(Boolean)
      .join("\n");

    throw new Error(message);
  }
}

function extractJson(text) {
  // Supabase CLI can print extra lines; extract the first JSON array/object.
  const start = Math.min(
    ...[text.indexOf("["), text.indexOf("{")].filter((i) => i >= 0),
  );
  if (!Number.isFinite(start)) return null;

  const sliced = text.slice(start).trim();
  try {
    return JSON.parse(sliced);
  } catch {
    // Try to recover if there is trailing non-JSON.
    const endBracket = sliced.lastIndexOf("]");
    const endBrace = sliced.lastIndexOf("}");
    const end = Math.max(endBracket >= 0 ? endBracket + 1 : -1, endBrace >= 0 ? endBrace + 1 : -1);
    if (end > 0) {
      return JSON.parse(sliced.slice(0, end));
    }
    return null;
  }
}

const sql = `
select
  exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='todos' and column_name='category'
  ) as has_category,
  exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='todos' and column_name='description'
  ) as has_description,
  exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='todos' and column_name='due_date'
  ) as has_due_date,
  exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='todos' and column_name='priority'
  ) as has_priority;
`;

const out = runSupabaseDbQuery(sql);
const parsed = extractJson(out);

if (!parsed) {
  console.error(out);
  throw new Error("Could not parse supabase db query JSON output.");
}

const row = Array.isArray(parsed) ? parsed[0] : parsed;
const required = ["has_category", "has_description", "has_due_date", "has_priority"];
const missing = required.filter((k) => !row?.[k]);

if (missing.length > 0) {
  console.error("Supabase schema check failed: missing columns on public.todos:");
  for (const key of missing) console.error(`- ${key.replace(/^has_/, "")}`);
  process.exit(1);
}

console.log("Supabase schema check OK: public.todos has category/description/due_date/priority");

