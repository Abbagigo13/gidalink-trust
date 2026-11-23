#!/usr/bin/env node
/**
 * Kane closed loop for GidaLink Trust.
 *
 *   npm run kane                 run every scenario
 *   npm run kane:smoke           run scenarios tagged "smoke"
 *   npm run kane:gate            smoke run that exits 1 on any failure (used by the pre-push hook)
 *   npm run kane -- --only K03,K07 --tag trust --headless --base-url http://localhost:5173
 *
 * For every scenario it runs `kane-cli run "<objective>" --agent`, parses the NDJSON stream,
 * and writes:
 *   kane/reports/latest.json    full machine-readable result
 *   kane/reports/history.json   one summary line per run (last 30)
 *   KANE_FEEDBACK.md            plain-English failures for the coding agent to read and fix
 *   public/kane-report.json     copy shown on the in-app "Kane quality" page (git-ignored)
 *
 * Credentials come from .env.kane (git-ignored) or the environment and are passed to Kane as
 * secret variables. They are redacted from every file this script writes.
 */
import { execSync, spawn, spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, copyFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

/* ---------- configuration ---------- */

function loadEnvFile(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#")) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...loadEnvFile(join(root, ".env.kane")), ...process.env };

const SECRET_KEYS = new Set([
  "buyer_password", "landlord_password", "verifier_password", "admin_password", "kane_password",
]);

const variables = {
  base_url: option("base-url") || env.KANE_BASE_URL || "http://localhost:5173",
  buyer_email: env.KANE_BUYER_EMAIL,
  buyer_password: env.KANE_BUYER_PASSWORD,
  landlord_email: env.KANE_LANDLORD_EMAIL,
  landlord_password: env.KANE_LANDLORD_PASSWORD,
  verifier_email: env.KANE_VERIFIER_EMAIL,
  verifier_password: env.KANE_VERIFIER_PASSWORD,
  admin_email: env.KANE_ADMIN_EMAIL,
  admin_password: env.KANE_ADMIN_PASSWORD,
  kane_password: env.KANE_REGISTER_PASSWORD,
};

const gate = flag("gate");
const headless = flag("headless") || gate || env.KANE_HEADLESS === "1";
const maxSteps = option("max-steps") || "40";
const timeout = option("timeout") || "420";

const scenarios = JSON.parse(readFileSync(join(root, "kane/scenarios.json"), "utf8"));
const only = (option("only") || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
const tag = option("tag") || (gate ? "smoke" : "");

const selected = scenarios.filter(
  (s) => (only.length === 0 || only.includes(s.id)) && (!tag || s.tags.includes(tag))
);

/* ---------- helpers ---------- */

const secretValues = Object.entries(variables)
  .filter(([k, v]) => SECRET_KEYS.has(k) && v)
  .map(([, v]) => String(v));

const redact = (text) =>
  secretValues.reduce((acc, secret) => acc.split(secret).join("***"), String(text ?? ""));

function fail(message, code = 2) {
  console.error(`\n[kane] ${message}\n`);
  process.exit(code);
}

/**
 * Finds a way to start Kane without going through a shell.
 * - Mac/Linux: `kane-cli` is a real executable on PATH.
 * - Windows: npm installs `kane-cli.cmd`, which cannot be spawned without a shell. Running the
 *   package's JavaScript entry with Node avoids cmd.exe and keeps the objective text intact.
 * - Override: set KANE_CLI_PATH to the path of kane-cli.cjs.
 */
function resolveKane() {
  const tryCommand = (command, prefix) => {
    const r = spawnSync(command, [...prefix, "--version"], { encoding: "utf8" });
    if (r.error || r.status !== 0) return null;
    return { command, prefix, version: r.stdout.trim().split("\n").pop() };
  };

  if (process.env.KANE_CLI_PATH && existsSync(process.env.KANE_CLI_PATH)) {
    const viaOverride = tryCommand(process.execPath, [process.env.KANE_CLI_PATH]);
    if (viaOverride) return viaOverride;
  }

  const direct = tryCommand("kane-cli", []);
  if (direct) return direct;

  try {
    const globalRoot = execSync("npm root -g", { encoding: "utf8" }).trim();
    const entry = join(globalRoot, "@testmuai", "kane-cli", "bin", "kane-cli.cjs");
    if (existsSync(entry)) return tryCommand(process.execPath, [entry]);
  } catch {
    /* npm not available */
  }
  return null;
}

async function appIsUp(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch {
    return false;
  }
}

function runScenario(kane, scenario, varsFile) {
  return new Promise((resolve) => {
    const started = Date.now();
    const cliArgs = [
      "run", scenario.objective, "--agent",
      "--variables-file", varsFile,
      "--max-steps", maxSteps,
      "--timeout", timeout,
    ];
    if (headless) cliArgs.push("--headless");

    const child = spawn(kane.command, [...kane.prefix, ...cliArgs], { stdio: ["ignore", "pipe", "pipe"] });
    const steps = [];
    let runEnd = null;
    let buffer = "";
    let stderr = "";

    const handleLine = (line) => {
      const text = line.trim();
      if (!text.startsWith("{")) return;
      try {
        const event = JSON.parse(text);
        if (event.type === "run_end") runEnd = event;
        else if (typeof event.step === "number") {
          steps.push({ step: event.step, status: event.status ?? "unknown", remark: redact(event.remark ?? "") });
        }
      } catch {
        /* ignore non-JSON noise */
      }
    };

    child.stdout.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      lines.forEach(handleLine);
    });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

    child.on("error", (err) => {
      resolve({ exitCode: -1, steps, runEnd, stderr: String(err), seconds: 0 });
    });
    child.on("close", (code) => {
      if (buffer) handleLine(buffer);
      resolve({ exitCode: code ?? -1, steps, runEnd, stderr, seconds: (Date.now() - started) / 1000 });
    });
  });
}

function classify(result) {
  const reported = result.runEnd?.status;
  if (reported === "passed" || (!reported && result.exitCode === 0 && result.steps.length > 0)) return "passed";
  if (reported === "failed") return "failed";
  if (!result.runEnd && result.exitCode !== 0) return "error";
  return reported ?? "error";
}

/* ---------- main ---------- */

if (selected.length === 0) fail("No scenarios matched --only / --tag.");

const kane = resolveKane();
const version = kane?.version ?? null;
if (!kane) {
  fail(
    "kane-cli could not be started from Node.\n  Install it:  npm install -g @testmuai/kane-cli\n  Then log in: kane-cli --tui   (use /login)\n  Windows tip: if it works in your terminal but not here, set KANE_CLI_PATH to the full path of\n  <npm root -g>\\@testmuai\\kane-cli\\bin\\kane-cli.cjs\n" +
      (gate ? "  To skip this gate once, set KANE_SKIP=1 (the skip is not recorded as a pass)." : "")
  );
}

const missing = [...new Set(selected.flatMap((s) => s.requires))].filter((k) => !variables[k]);
if (missing.length) {
  fail(
    `Missing test credentials: ${missing.join(", ")}.\n  Run "cp kane/env.example .env.kane" and fill in the KANE_* values (see docs/KANE.md).`
  );
}

if (!(await appIsUp(variables.base_url))) {
  fail(`The app is not reachable at ${variables.base_url}. Start it with "npm run dev" first.`);
}

const tempDir = mkdtempSync(join(tmpdir(), "gidalink-kane-"));
const varsFile = join(tempDir, "variables.json");
writeFileSync(
  varsFile,
  JSON.stringify(
    Object.fromEntries(
      Object.entries(variables)
        .filter(([, v]) => v)
        .map(([k, v]) => [k, { value: String(v), secret: SECRET_KEYS.has(k) }])
    )
  ),
  { mode: 0o600 }
);

console.log(`[kane] kane-cli ${version} | ${selected.length} scenario(s) | ${variables.base_url}${headless ? " | headless" : ""}`);

const results = [];
try {
  for (const scenario of selected) {
    process.stdout.write(`[kane] ${scenario.id} ${scenario.title} ... `);
    const raw = await runScenario(kane, scenario, varsFile);
    const status = classify(raw);
    const failedStep = raw.steps.find((s) => s.status === "failed") ?? null;

    results.push({
      id: scenario.id,
      title: scenario.title,
      tags: scenario.tags,
      objective: scenario.objective,
      status,
      durationSec: Math.round((raw.runEnd?.duration ?? raw.seconds) * 10) / 10,
      summary: redact(raw.runEnd?.summary ?? ""),
      steps: raw.steps,
      failure: status === "passed" ? null : {
        step: failedStep?.step ?? null,
        remark: failedStep?.remark || redact(raw.stderr).slice(-500) || "Run ended without a result.",
      },
      testUrl: raw.runEnd?.test_url ?? null,
    });
    console.log(status.toUpperCase());
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

const totals = {
  passed: results.filter((r) => r.status === "passed").length,
  failed: results.filter((r) => r.status === "failed").length,
  error: results.filter((r) => r.status !== "passed" && r.status !== "failed").length,
};

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl: variables.base_url,
  kaneVersion: version,
  mode: gate ? "gate" : tag ? `tag:${tag}` : only.length ? "selected" : "full",
  totals,
  scenarios: results,
};

/* ---------- outputs ---------- */

const reportsDir = join(root, "kane/reports");
mkdirSync(reportsDir, { recursive: true });
mkdirSync(join(root, "public"), { recursive: true });

writeFileSync(join(reportsDir, "latest.json"), JSON.stringify(report, null, 2));

const historyPath = join(reportsDir, "history.json");
const history = existsSync(historyPath) ? JSON.parse(readFileSync(historyPath, "utf8")) : [];
history.push({
  generatedAt: report.generatedAt,
  mode: report.mode,
  totals,
  failedIds: results.filter((r) => r.status !== "passed").map((r) => r.id),
});
writeFileSync(historyPath, JSON.stringify(history.slice(-30), null, 2));

copyFileSync(join(reportsDir, "latest.json"), join(root, "public/kane-report.json"));
copyFileSync(historyPath, join(root, "public/kane-history.json"));

const problems = results.filter((r) => r.status !== "passed");
const lines = [
  "# Kane feedback",
  "",
  `Generated ${report.generatedAt}. ${totals.passed} passed, ${totals.failed} failed, ${totals.error} errored.`,
  "",
];
if (problems.length === 0) {
  lines.push("All selected scenarios passed. Nothing to fix.", "");
} else {
  lines.push(
    "## Instructions for the coding agent",
    "",
    "Kane drove a real browser against the running app and the scenarios below did not pass.",
    "1. Fix the application (not the scenario) so the stated expectation is true.",
    "2. Re-run `npm run kane -- --only " + problems.map((p) => p.id).join(",") + "`.",
    "3. Repeat until everything passes, then run `npm run kane:gate` before pushing.",
    "4. If the scenario itself is wrong (the expectation contradicts the product rules in docs/PRD.md), say so and propose a change to kane/scenarios.json instead of silently editing it.",
    ""
  );
  for (const p of problems) {
    lines.push(
      `## ${p.id} - ${p.title} - ${p.status.toUpperCase()}`,
      "",
      `Expected (objective given to Kane): ${p.objective}`,
      "",
      `Failing step: ${p.failure?.step ?? "unknown"} - ${p.failure?.remark}`,
      p.summary ? `\nKane summary: ${p.summary}` : "",
      p.testUrl ? `\nEvidence: ${p.testUrl}` : "",
      ""
    );
  }
}
writeFileSync(join(root, "KANE_FEEDBACK.md"), redact(lines.join("\n")));

console.log(`\n[kane] ${totals.passed} passed, ${totals.failed} failed, ${totals.error} errored`);
console.log("[kane] wrote kane/reports/latest.json and KANE_FEEDBACK.md");

if (problems.length > 0) {
  console.error("[kane] Not all scenarios passed. Read KANE_FEEDBACK.md, fix, and re-run.");
  if (gate || flag("strict")) process.exit(1);
}
