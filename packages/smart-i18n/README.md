# @sayyyat/smart-i18n

[![npm version](https://img.shields.io/npm/v/@sayyyat/smart-i18n)](https://www.npmjs.com/package/@sayyyat/smart-i18n)
[![npm downloads](https://img.shields.io/npm/dm/@sayyyat/smart-i18n)](https://www.npmjs.com/package/@sayyyat/smart-i18n)
[![License](https://img.shields.io/npm/l/@sayyyat/smart-i18n)](./LICENSE)
[![CI/CD Status](https://img.shields.io/github/actions/workflow/status/Sayyat/smart-i18n-monorepo/publish.yml?branch=main&kill_cache=1)](https://github.com/Sayyat/smart-i18n-monorepo/actions)

> **Core CLI Package.** A Gulp-based CLI toolkit for modular, scalable i18n in JS/TS projects.

This package provides the core, framework-agnostic CLI for the smart-i18n system. It automates namespace generation, key extraction, machine translation, and TypeScript typing.

-----

### ❗️ Note for React / Next.js Users

This is the **core package**. If you are working with **React** or **Next.js**, you should install the **`@sayyyat/smart-i18n-react`** package instead.

The React package includes all commands from this core package, plus React-specific `init` templates and `create-feature` (FSD) scaffolding.

➡️ [**@sayyyat/smart-i18n-react README**](../smart-i18n-react/README.md)

-----

## 🚀 Features

  * ✅ Automatic **namespace detection** and key extraction from your code.
  * 🔄 Seamless **translation file merging** (preserves existing keys).
  * 🌐 On-demand **machine translation** of missing keys via RapidAPI (using `key == value` detection).
  * 🔒 Safe **TypeScript typings** generation (`generate:types`).
  * ⚙️ **Runtime Config Generation** (`generate:config`) from a single source of truth (`i18next.config.json`).
  * 🧱 Modular **Gulp tasks** for fully scriptable and extendable i18n pipelines.

-----

## 💾 Installation

Install this package as a development dependency:

```bash
# pnpm
pnpm add @sayyyat/smart-i18n -D

# yarn
yarn add @sayyyat/smart-i18n -D

# npm
npm install @sayyyat/smart-i18n --save-dev
```

## ⚙️ Configuration & Usage

This package is designed to be run from within a consumer project.

### 1\. Configuration

The entire system is controlled by a single **`i18next.config.json`** file in your project root.

Run the `init` command to automatically create a default config file:

```bash
npx smart-i18n init
```

This will create `i18next.config.json` and a `.demo-env` file. The CLI reads all settings (languages, paths, etc.) from this JSON file.

### 2\. Core CLI Commands

All commands are available via `npx` or `package.json` scripts.

  * **`npx smart-i18n`** (Default task)

      * Runs the main generation pipeline in order:

    <!-- end list -->

    1.  `generate-config` (Updates `src/i18n/lib/config.ts` from `i18next.config.json`)
    2.  `generate-namespaces` (Scans code for new namespaces)
    3.  `generate-templates` (Scans code for new keys)
    4.  `generate-types` (Generates TypeScript types from keys)

  * **`npx smart-i18n generate-translations`**

      * **This is the "killer feature".**
      * Scans all locale files (e.g., `kk/common.json`).
      * Finds all keys where `key === value` (meaning they are not translated yet).
      * Sends the `key` (which is the full English text) to RapidAPI for translation.
      * Caches requests to avoid duplicate API calls and save costs.

  * **`npx smart-i18n watch`**

      * Runs the `default` task automatically when your source files change.

  * **`npx smart-i18n help`**

      * Displays a full list of all available commands.

-----

## 🔗 Example Integration

A Next.js 16 example application that uses this tooling is available in the monorepo:

➡️ [**`apps/next-i18n`**](https://github.com/Sayyat/smart-i18n-monorepo/tree/main/apps/next-i18n)

-----

## ⚖️ License

[MIT](LICENSE) © Sayat Raykul