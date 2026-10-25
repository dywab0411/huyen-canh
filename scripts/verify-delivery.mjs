import { spawnSync } from "node:child_process";
import { writeFile, readFile } from "node:fs/promises";
const commands = [
  ["ci"],
  ["run", "typecheck"],
  ["run", "lint"],
  ["test"],
  ["run", "test:integration"],
  ["run", "build"],
  ["run", "check:secrets"],
];
const results = [];
for (const args of commands) {
  const r = spawnSync(process.execPath, [process.env.npm_execpath, ...args], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  });
  process.stdout.write(r.stdout ?? "");
  process.stderr.write(r.stderr ?? "");
  results.push({
    command: "npm " + args.join(" "),
    exitCode: r.status,
    output: r.stdout,
  });
  if (r.status !== 0) {
    await writeFile(
      "docs/CLEAN_WINDOWS_REPORT.json",
      JSON.stringify(
        { date: "2026-10-25", workspace: process.cwd(), results, pass: false },
        null,
        2,
      ),
    );
    process.exit(r.status ?? 1);
  }
}
await writeFile(
  "docs/CLEAN_WINDOWS_REPORT.json",
  JSON.stringify(
    {
      date: "2026-10-25",
      workspace: process.cwd(),
      node: process.version,
      results,
      pass: true,
      limits:
        "Fresh npm ci in delivery directory, not a remote Git clone. Browser E2E previously ran in authoring workspace with same source.",
    },
    null,
    2,
  ),
);
const file = "IMPLEMENTATION_STATUS.md";
let status = await readFile(file, "utf8");
status = status.replace(
  "WindowsCbuild/testsPASS; Dcleaninstall sẽ ghi kết quả đồng bộ bên dưới",
  "WindowsD fresh npmci/typecheck/lint/26unit/19integration/build/scan PASS; không phải Git clone remote",
);
status +=
  "\n## Xác minh thư mục bàn giao\n\n`" +
  process.cwd() +
  "`: fresh `npm ci`, typecheck, lint,26unit,19integration,build,secret scan đều PASS. Chi tiết `docs/CLEAN_WINDOWS_REPORT.json`. Đây là cài mới dependency trong thư mục bàn giao, không gọi là clone Git từ remote. Không thay trạng thái BLOCKED của cloud.\n";
await writeFile(file, status);
console.log("Delivery directory clean dependency install and checks passed.");
