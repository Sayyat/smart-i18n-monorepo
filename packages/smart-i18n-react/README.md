# ⚠️ DEPRECATED

> **This package is no longer maintained.**
> Please migrate to the new, next-generation CLI: **[@sayyyat/smart-i18next-cli](https://www.npmjs.com/package/@sayyyat/smart-i18next-cli)**

### Why migrate?
* 🚀 **Pure TypeScript:** The new CLI is built entirely in TypeScript for better stability.
* ⚡️ **AST Parsing:** Uses `i18next-cli` (AST) instead of Regex/Gulp for smarter extraction.
* 💎 **Better Features:** Full support for **`<Trans>` components**, stricter type generation, and faster execution.

---

# @sayyyat/smart-i18n-react (Legacy)

[![npm version](https://img.shields.io/npm/v/@sayyyat/smart-i18n-react)](https://www.npmjs.com/package/@sayyyat/smart-i18n-react)
[![npm downloads](https://img.shields.io/npm/dm/@sayyyat/smart-i18n-react)](https://www.npmjs.com/package/@sayyyat/smart-i18n-react)
[![License](https://img.shields.io/npm/l/@sayyyat/smart-i18n-react)](./LICENSE)
[![Node.js CI](https://img.shields.io/github/actions/workflow/status/Sayyat/smart-i18n-react/npm-publish.yml?branch=master&kill_cache=1)](https://github.com/Sayyat/smart-i18n-react/actions)

> **The all-in-one CLI toolkit for smart-i18n in React & Next.js projects.**

This package is the **recommended** way to use the `smart-i18n` system in React or Next.js applications.

It acts as a "superset" of the core `@sayyyat/smart-i18n` package, providing:

1.  **All core commands** (`translate`, `sync`, `generate:types`, `watch`, etc.) from the base package, inherited automatically.
2.  A modified **`init` command** that scaffolds React/Next.js-specific template files (like `client.ts`, `server.ts`, and a React-ready `i18next.config.json`).
3.  An optional **`--fsd`** flag for the `init` command to scaffold a config for Feature-Sliced Design.
4.  Bonus scaffolding commands like **`create-feature`** for FSD-structured projects.

With this package, you **do not** need to install `@sayyyat/smart-i18n` separately.

-----

## 💾 Installation

Install this package as a development dependency:

```bash
# pnpm
pnpm add @sayyyat/smart-i18n-react -D

# yarn
yarn add @sayyyat/smart-i18n-react -D

# npm
npm install @sayyyat/smart-i18n-react --save-dev
```

-----

## ⚙️ Usage & CLI Commands

All commands are available through the `smart-i18n-react` binary (or `npx`). We recommend adding shortcuts to your `package.json`:

```json
{
  "scripts": {
    // Runs the main generation pipeline (config, namespaces, templates, types)
    "i18n": "smart-i18n-react",
    // Runs the auto-translation (killer feature)
    "i18n:translate": "smart-i18n-react generate-translations",
    // Runs in watch mode
    "i18n:watch": "smart-i18n-react watch",
    // Scaffolds a new FSD feature
    "i18n:feature": "smart-i18n-react create-feature"
  }
}
```

### React-Specific Commands

#### `npx smart-i18n-react init`

Initializes your project. This command copies all necessary template files (`src/i18n/...`) and a config file (`i18next.config.json`) into your project root.

  * **Default Mode:** `npx smart-i18n-react init`
    Scaffolds a **safe, minimal** `i18next.config.json` that only scans `src/app/` and `src/components/`. This is ideal for new or simple projects and avoids errors from missing folders.

  * **FSD Mode:** `npx smart-i18n-react init --fsd`
    Scaffolds a **full, complex** `i18next.config.json` with `includePatterns` for a complete Feature-Sliced Design (FSD) architecture (e.g., `src/features/`, `src/core/`, `src/widgets/`).

#### `npx smart-i18n-react create-feature -n <feature-name>`

A scaffolding tool that generates boilerplate for a new feature slice based on FSD principles.

  * `-n, --name`: The name of the new feature (e.g., `my-new-feature`). [required]
  * `--js`: Optionally generates JavaScript/JSX files instead of TypeScript/TSX.

#### `npx smart-i18n-react generate-config`

This command (which is also part of the `default` task) reads your `i18next.config.json` (the "Single Source of Truth") and regenerates the `src/i18n/generated/config.ts` file.

This React version ensures that React/Next.js-specific values (like `cookieName`) are included in the generated file.

### Inherited Core Commands

All commands from the core `@sayyyat/smart-i18n` package are available and work the same way:

  * **`npx smart-i18n-react`** (Default task)
    Runs the main generation pipeline in order:

    1.  `generate-config` (React version)
    2.  `generate-namespaces`
    3.  `generate-templates`
    4.  `generate-types`

  * **`npx smart-i18n-react generate-translations`**

      * **This is the "killer feature".**
      * Finds all keys where `key === value` (meaning they are not translated yet).
      * Sends the text to RapidAPI for machine translation and caches the results to save API calls.

  * **`npx smart-i18n-react generate-templates`**

  * **`npx smart-i18n-react generate-namespaces`**

  * **`npx smart-i18n-react generate-types`**

  * **`npx smart-i18n-react watch`**

  * **`npx smart-i18n-react help`**

For details on what these core commands do, please refer to the [Core Package Documentation](./docs/DOCUMENTATION.md).

-----

## 🔗 Example Integration

A new Next.js 16 example application that uses this package (`@sayyyat/smart-i18n-react`) is included in this monorepo:

➡️ [**`apps/next-i18n`**](https://github.com/Sayyat/smart-i18n-monorepo/tree/main/apps/next-i18n)

-----

## ⚖️ License

[MIT](LICENSE) © Sayat Raykul