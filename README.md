# `smart-i18n` Monorepo

[](https://github.com/Sayyat/smart-i18n-monorepo/actions)
[](./LICENSE)
[](https://pnpm.io/)

This is the official pnpm monorepo for the `smart-i18n` CLI toolkit.

`smart-i18n` is a Gulp-based CLI tool designed to automate and scale internationalization (i18n) workflows in any JavaScript or TypeScript project.

-----

## 🚀 What's Inside?

This monorepo is managed using `pnpm workspaces` and contains the following packages and applications:

### `packages/`

  * **`@sayyyat/smart-i18n`** (Core Package)

      * The framework-agnostic core CLI.
      * Contains all primary Gulp tasks like `init`, `sync`, `translate`, and `generate:types`.
      * ➡️ **[View Package README](./packages/smart-i18n/README.md)**

  * **`@sayyyat/smart-i18n-react`** (React/Next.js Package)

      * The "superset" package recommended for React developers.
      * Includes **all commands** from the core package.
      * Adds a React-specific `init` command and extra scaffolding tools like `create-feature` (for FSD).
      * ➡️ **[View Package README](./packages/smart-i18n-react/README.md)**

### `apps/`

  * **`example-next16`**
      * A Next.js 16 (App Router) example application.
      * Imports `@sayyyat/smart-i18n-react` using `workspace:*`.
      * Serves as a local testing ground and live example for developing the packages.

-----

## ⚙️ Getting Started

### 1\. Prerequisites

  * [Node.js](https://nodejs.org/) (v20 or higher)
  * [pnpm](https://pnpm.io/installation) (v10 or higher)
  * [GitHub CLI (gh)](https://cli.github.com/) (required for publishing new releases)

### 2\. Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/Sayyat/smart-i18n-monorepo.git
    cd smart-i18n-monorepo
    ```

2.  Install all dependencies using `pnpm`:

    ```bash
    pnpm install
    ```

## 🛠️ Local Development Workflow

To develop the libraries and see your changes live in the example app, you need to run two separate terminals.

**Terminal 1: Watch & Build Packages**
(This terminal watches for changes in your library code and automatically rebuilds it.)

```bash
# Recursively run 'build --watch' for all packages in the 'packages/' directory
pnpm --filter "./packages/*" build --watch
```

**Terminal 2: Run the Example App**
(This terminal runs the `example-next16` demo app on `localhost:3000`.)

```bash
# Run the 'dev' script for the 'example-next16' app
pnpm --filter "example-next16" dev
```

Now, open [http://localhost:3000](http://localhost:3000). Any changes you make in the `packages/` directory will be rebuilt by Terminal 1, and Next.js (in Terminal 2) will automatically hot-reload the app.

-----

## 🚀 Releasing a New Version

This repository uses a semi-automated release process managed by a local script.

1.  Ensure your `git status` is clean and you are authenticated with GitHub CLI (`gh auth status`).
2.  Run the `release` script from the **root** of the monorepo.

The script accepts the package's **short name** (the directory name) and a **version type** (`patch`, `minor`, `major`):

```bash
# Usage: pnpm release <package-name> <version-type>

# Example for a patch release of 'smart-i18n' (e.g., v1.0.0 -> v1.0.1)
pnpm release smart-i18n patch

# Example for a minor release of 'smart-i18n-react' (e.g., v1.0.0 -> v1.1.0)
pnpm release smart-i18n-react minor
```

### What the script does:

The `release.mjs` script will automatically:

1.  Bump the version in the specified package's `package.json`.
2.  Create a new Git commit (e.g., `chore(release): @sayyyat/smart-i18n@3.0.1`).
3.  Create a new Git tag (e.g., `@sayyyat/smart-i18n@3.0.1`).
4.  Push the commit and tag to GitHub.
5.  Create a new GitHub Release based on the tag.

### CI/CD Automation

Pushing a tag in the format `@*/*@*.*.*` will automatically trigger the [**NPM Publish**](./.github/workflows/publish.yml) GitHub Actions workflow. The CI/CD pipeline will then build, test, and publish the newly tagged package to npm.

-----

## ⚖️ License

[MIT](LICENSE) © Sayat Raykul