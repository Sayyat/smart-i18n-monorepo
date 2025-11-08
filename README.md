Әрине. Monorepo-ның негізгі `README.md` файлы — бұл жобаның "маңдайшасы". Ол жаңадан келген кез келген әзірлеушіге (немесе болашақтағы өзіңізге) бұл жобаның не екенін, қалай жұмыс істейтінін және оны қалай басқару керектігін 5 минутта түсіндіруі тиіс.

Міне, сіздің `sayyyat-lib-workspace` жобаңыздың негізгі (root) папкасына арналған кәсіби `README.md` нұсқасы:

-----

(Осы жерден бастап көшіріңіз)

# sayyyat-lib-workspace

[](https://www.google.com/search?q=https://github.com/Sayyat/sayyyat-lib-workspace/actions)
[](https://opensource.org/licenses/MIT)
[](https://pnpm.io/)

This is the official monorepo for my open-source React components and libraries, managed using **pnpm workspaces**.

## What's Inside?

This monorepo contains the following packages and applications:

### `packages/`

* **`@sayyyat/react-query-conditional`**: A zero-dependency, declarative React component to gracefully handle `@tanstack/react-query` states (`isPending`, `isError`, `isEmpty`).
* *(...future packages will be listed here)*

### `apps/`

* **`web-next16`**: A Next.js 16 (App Router) application. Its primary purpose is to serve as a local development and testing environment for all packages within this workspace.

## Getting Started

### 1\. Prerequisites

* [Node.js](https://nodejs.org/) (v20 or higher)
* [pnpm](https://pnpm.io/installation) (v10 or higher)
* [GitHub CLI (gh)](https://cli.github.com/) (required for publishing new releases)

### 2\. Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/Sayyat/sayyyat-lib-workspace.git
    cd sayyyat-lib-workspace
    ```

2.  Install dependencies using `pnpm`:

    ```bash
    pnpm install
    ```

## Development

To run the development environment, you need to run two processes concurrently in separate terminals:

**Terminal 1: Build Packages**
(This terminal watches for changes in your library code and rebuilds it automatically.)

```bash
# Run the 'dev' script for the specific package you are working on
pnpm --filter "@sayyyat/react-query-conditional" dev
```

**Terminal 2: Run the Next.js App**
(This terminal runs the `web-next16` demo app that imports your local library.)

```bash
# Run the 'dev' script for the web application
pnpm --filter "web-next16" dev
```

Now, open [http://localhost:3000](http://localhost:3000) in your browser to see the `web-next16` app running with your local package.

## Releasing a New Version

This repository uses a semi-automated release process.

1.  Ensure your `git status` is clean and you are authenticated with GitHub CLI (`gh auth status`).
2.  Run the local `release` script from the **root** of the monorepo.

The script accepts the package's short name and a version type (`patch`, `minor`, `major`):

```bash
# Usage: pnpm release <package-name> <version-type>
# Example for a patch (e.g., 1.0.0 -> 1.0.1)
pnpm release react-query-conditional patch
```

### What this script does:

The `release.mjs` script will automatically:

1.  Find the specified package (e.g., `react-query-conditional`).
2.  Bump the version in its `package.json` file.
3.  Create a new Git commit (e.g., `chore(release): @sayyyat/react-query-conditional@1.0.1`).
4.  Create a new Git tag (e.g., `@sayyyat/react-query-conditional@1.0.1`).
5.  Push the commit and tag to GitHub.
6.  Create a new GitHub Release based on the tag.

### CI/CD Automation

Pushing a tag in the format `@*/*@*.*.*` will automatically trigger the [**NPM Publish**](./.github/workflows/publish.yml) GitHub Actions workflow. This CI/CD pipeline will then build, test, and publish the newly tagged package to npm.

## License

This monorepo and all packages within it are licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.