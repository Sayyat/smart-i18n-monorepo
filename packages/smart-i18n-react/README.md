# Smart-i18n React

[![npm version](https://img.shields.io/npm/v/@sayyyat/smart-i18n-react)](https://www.npmjs.com/package/@sayyyat/smart-i18n-react)
[![npm downloads](https://img.shields.io/npm/dm/@sayyyat/smart-i18n-react)](https://www.npmjs.com/package/@sayyyat/smart-i18n-react)
[![License](https://img.shields.io/npm/l/@sayyyat/smart-i18n-react)](./LICENSE)
[![Node.js CI](https://img.shields.io/github/actions/workflow/status/Sayyat/smart-i18n-react/npm-publish.yml?branch=master&kill_cache=1)](https://github.com/Sayyat/smart-i18n-react/actions)

> React/Next.js boilerplate installer for Smart-i18n CLI with feature scaffolding and project structure setup

**smart-i18n-react** is a project-specific integration package built on top of [@sayyyat/smart-i18n](https://www.npmjs.com/package/@sayyyat/smart-i18n). It provides enhanced developer tooling for **Next.js**, **React**, and similar frontend frameworks, focusing on structured file layout and automated i18n setup via Gulp tasks.

---

## ⚙️ Features

* 📁 Installs a ready-to-use i18n folder structure for React/Next.js
* 📄 Auto-generates `i18next.config.json` and `.demo-env`
* 🧩 Scaffolds new features in Feature-Sliced Design format
* ⚙️ Powered by [smart-i18n](https://www.npmjs.com/package/@sayyyat/smart-i18n) under the hood

---

## 📁 Documentation

* 📚 [Gulp Task Structure](./docs/gulp.md) — breakdown of CLI tasks and file layout
* ℹ️ Uses [`@sayyyat/smart-i18n`](https://www.npmjs.com/package/@sayyyat/smart-i18n) internally — see its [Getting Started](https://github.com/Sayyat/smart-i18n/blob/master/docs/getting-started.md) guide for translation workflows.

---

## 🧪 Example Usage

👉 See [next-i18n-auth](https://github.com/Sayyat/next-i18n-auth) for real-world usage in a Next.js + TypeScript project with strict modular translation and typed i18n keys.

---

## ⚖️ License

[MIT](LICENSE) © Sayat Raykul

## 📚 Related Projects

* [`@sayyyat/smart-i18n`](https://www.npmjs.com/package/@sayyyat/smart-i18n) — The core CLI engine that provides scanning, merging, and type generation.
* [`next-i18n-auth`](https://github.com/Sayyat/next-i18n-auth) — Real-world example integrating both smart-i18n and smart-i18n-react with feature-sliced architecture and multilingual auth flows.
