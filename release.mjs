// release.mjs (Universal Monorepo Version)
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// --- Helper Functions ---
const run = (cmd, args = [], opts = {}) => {
  const res = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
  if (res.status !== 0) process.exit(res.status ?? 1);
  return res;
};

const out = (cmd, args = [], opts = {}) => {
  const res = spawnSync(cmd, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    ...opts,
  });
  if (res.status !== 0) {
    console.error(`❌ Command failed: ${cmd} ${args.join(" ")}`);
    console.error(res.stderr);
    process.exit(1);
  }
  return res.stdout.toString().trim();
};

// --- 1. Get Input Arguments ---
const targetPackageShortName = process.argv[2];
if (!targetPackageShortName) {
  console.error("❌ Error: Package name not specified.");
  console.log("Usage: pnpm release <package-name> [version-type] [--notes \"...\"]");
  console.log("Example: pnpm release react-query-conditional patch");
  process.exit(1);
}

const versionType = process.argv[3] || "patch";
let notes = null;
for (let i = 4; i < process.argv.length; i++) {
  if (process.argv[i] === "--notes") {
    notes = process.argv.slice(i + 1).join(" ");
    break;
  }
}

// --- 2. Find Package via pnpm ---
let pkgData;
try {
  // Find package name and path using 'pnpm list'
  const listOutput = out("pnpm", ["list", "--filter", targetPackageShortName, "--depth=-1", "--json"]);
  const list = JSON.parse(listOutput);
  if (!list || list.length === 0) {
    throw new Error(`Package not found with filter: ${targetPackageShortName}`);
  }
  pkgData = list[0];
} catch (e) {
  console.error(`❌ Error finding package "${targetPackageShortName}".`);
  console.error(e.message);
  process.exit(1);
}

const PKG_NAME = pkgData.name; // e.g., @sayyyat/react-query-conditional
const PKG_PATH = pkgData.path; // e.g., D:\...\packages\react-query-conditional

console.log(`🚀 Releasing package: ${PKG_NAME} (v${pkgData.version})`);
console.log(`   Path: ${PKG_PATH}`);

// --- 3. Check Git Status ---
console.log("Checking git status...");
const isClean =
    spawnSync("git", ["diff", "--quiet"]).status === 0 &&
    spawnSync("git", ["diff", "--cached", "--quiet"]).status === 0;

if (!isClean) {
  console.error("❌ Git working directory not clean. Commit or stash your changes first.");
  process.exit(1);
}

// --- 4. Check GitHub CLI Auth ---
console.log("Checking GitHub CLI auth status...");
const hasGh = spawnSync("gh", ["--version"], { stdio: "ignore" }).status === 0;
const ghToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!hasGh) {
  console.error("❌ GitHub CLI (gh) is not installed.");
  process.exit(1);
}
if (spawnSync("gh", ["auth", "status"], { stdio: "ignore" }).status !== 0 && !ghToken) {
  console.error("❌ Not authenticated with gh CLI. Run `gh auth login`.");
  process.exit(1);
}

// --- 5. Bump Version using pnpm ---
console.log(`Bumping version for ${PKG_NAME} using ${versionType}...`);
// We run 'pnpm version' from WITHIN the package directory (cwd)
// and disable its built-in git commands, as we'll do them manually.
run(
    "pnpm",
    ["version", versionType, "--git-tag-version=false"],
    { cwd: PKG_PATH }
);

// --- 6. Get New Version and Tag ---
const pkgJsonPath = path.join(PKG_PATH, "package.json");
const newVersion = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")).version;
const newTag = `${PKG_NAME}@${newVersion}`; // Format: @scope/name@1.2.3

console.log(`New version: ${newVersion}, New tag: ${newTag}`);

// --- 7. Create Git Commit and Tag ---
console.log("Committing version bump...");
run("git", ["add", pkgJsonPath]);
run("git", ["add", "pnpm-lock.yaml"]); // Lockfile is always in the root
// Combine -m flag and message into one arg to prevent shell splitting issues on Windows
run("git", ["commit", `-m"chore(release): ${newTag}"`]);

console.log(`Creating git tag ${newTag}...`);
run("git", ["tag", newTag]);

// --- 8. Push to Remote ---
console.log("Pushing commit and tag...");
run("git", ["push"]);
run("git", ["push", "--tags"]);

// --- 9. Create GitHub Release ---
console.log("Creating GitHub Release...");
const ghArgs = ["release", "create", newTag, "--latest"];
if (notes) ghArgs.push("--notes", notes);
else ghArgs.push("--generate-notes");

run("gh", ghArgs, {
  env: { ...process.env, GH_TOKEN: ghToken ?? process.env.GITHUB_TOKEN },
});

console.log(`✅ Release ${newTag} created. CI/CD will now take over.`);