# @sayyyat/smart-i18n

[![npm version](https://img.shields.io/npm/v/@sayyyat/smart-i18n)](https://www.npmjs.com/package/@sayyyat/smart-i18n)
[![npm downloads](https://img.shields.io/npm/dm/@sayyyat/smart-i18n)](https://www.npmjs.com/package/@sayyyat/smart-i18n)
[![License](https://img.shields.io/npm/l/@sayyyat/smart-i18n)](./LICENSE)
[![CI/CD Status](https://img.shields.io/github/actions/workflow/status/Sayyat/smart-i18n-monorepo/publish.yml?branch=main&kill_cache=1)](https://github.com/Sayyat/smart-i18n-monorepo/actions)

> A Gulp-based CLI toolkit for modular, scalable i18n in JS/TS projects

Smart-i18n is a framework-agnostic internationalization (i18n) CLI toolkit that automates translation workflows in JavaScript and TypeScript projects. It is based on **Gulp** and designed to integrate seamlessly into apps built with **Next.js**, **React**, **Vue**, or other frontend/backend stacks.

-----

### ❗️ Note for React / Next.js Users

This is the **core package** for the `smart-i18n` system.

If you are working with **React** or **Next.js**, you should install the **`@sayyyat/smart-i18n-react`** package instead. It includes all features from this core package, plus additional React-specific `init` and `create-feature` (FSD) commands.

➡️ [**@sayyyat/smart-i18n-react README**](../smart-i18n-react/README.md)

-----

## 🚀 Features

  * ✅ Automatic **namespace detection** and key extraction from your code.
  * 🔄 Seamless **translation file merging** (preserves existing keys and structure).
  * 🌐 On-demand **machine translation** of missing keys via Deep Translate (RapidAPI).
  * 🔒 Safe **TypeScript typings** generation for all i18n keys.
  * 🧱 Modular **Gulp tasks** for fully scriptable and extendable i18n pipelines.
  * 🧰 CLI-based, works via `npx @sayyyat/smart-i18n`.

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

## ⚙️ Usage

The package can be invoked via `package.json` scripts or `npx`:

```bash
npx smart-i18n <command> [options]
```

A full list of available commands and their options is available in the documentation.

-----

## 📁 Documentation

  * 📚 [**Documentation**](./docs/DOCUMENTATION.md) — Full setup, configuration, and **command list**.

-----

## 🔗 Example Integration

A new Next.js 16 example application is included in this monorepo under the `apps/example-next16` directory.

The previous example (`next-i18n-auth`) is now archived, as it used an older version of this package.

-----

## ⚖️ License

[MIT](LICENSE) © Sayat Raykul