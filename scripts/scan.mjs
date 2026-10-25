import { readdir, readFile } from "node:fs/promises";
const bad = [];
async function walk(path) {
  for (const f of await readdir(path, { withFileTypes: true })) {
    if (
      [
        "node_modules",
        ".git",
        ".wrangler",
        ".artifacts",
        "release",
        "test-results",
        "playwright-report",
      ].includes(f.name)
    )
      continue;
    const p = path + "/" + f.name;
    if (f.isDirectory()) await walk(p);
    else if (/\.(js|mjs|ts|tsx|json|html|env|md|yaml|yml|toml|sql)$/u.test(p)) {
      const s = await readFile(p, "utf8");
      if (
        /eyJhbGciOiJIUzI1Ni[^\s"']{80,}|sb_secret_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/u.test(
          s,
        )
      )
        bad.push(p);
    }
  }
}
await walk(".");
if (bad.length) {
  console.error(bad);
  process.exitCode = 1;
} else
  console.log(
    "No secret patterns found in source/build. Heuristic scan, not proof of absence.",
  );
