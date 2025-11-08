# Gulp Scripts File Structure


## Overview

The **Gulp** scripts in the **smart-i18n-react** project automate various tasks related to translations, including key extraction, namespace generation, type generation, and translation fetching from external services like **RapidAPI**.

This file structure is organized into **`lib/`** for reusable utilities and **`tasks/`** for the individual Gulp tasks. The files inside **`lib/`** contain the core logic used by the tasks, while the **`tasks/`** folder contains the actual tasks that will be executed via Gulp.

> ⚠️ This package (`smart-i18n-react`) is a **wrapper**. For the full translation pipeline (key scanning, merging, types), see [`@sayyyat/smart-i18n`](https://www.npmjs.com/package/@sayyyat/smart-i18n).

---

## File Structure

```plaintext
smart-i18n/
├── lib/
│   ├── feature.js                  // Logic for the create-feature Gulp task to generate new features
│   ├── init.js                     // Project initialization
│   └── paths.js                    // Path operations
├── src/                            // Optional test folder for local development
├── tasks/
│   ├── create-feature.js           // Gulp task for generating boilerplate code for a new feature
│   ├── help.js                     // Gulp task to display available tasks and their descriptions
│   └── init.js                     // Gulp task to init the project. Adds i18next.config.json and .demo-env
├── gulpfile.js                     // Main Gulp configuration file that imports and runs tasks
├── i18next.config.json             // Custom i18next configuration used by Gulp scripts
└── package.json                    // Defines project dependencies, including Gulp-related packages
```

---

## Explanation of Files

### /lib/

Reusable logic shared between all Gulp tasks:

- **feature.js** — Logic for creating a new feature folder with initial boilerplate.
- **init.js** — Initializes project with i18n.config.json, .demo-env files and src/i18n/ folder.
- **paths.js** — Locates consumer root or internal root, and resolves paths accordingly.

### /tasks/

Each file is a self-contained Gulp task:

- **create-feature.js** — Generates new feature folder boilerplate.
- **help.js** — Outputs list of all CLI tasks and usage.
- **init.js** — Initializes config files (`i18next.config.json`, `.demo-env`) in a consumer project.

---

## How to Use the Gulp Tasks

Each task can be run via CLI using the `smart-i18n-react` binary:

```bash
  smart-i18n init
  smart-i18n create-feature -n my-feature
```

For full task details, run:

```bash
  smart-i18n help
```

## 📚 Related Projects

* [`@sayyyat/smart-i18n`](https://www.npmjs.com/package/@sayyyat/smart-i18n) — The core CLI engine that provides scanning, merging, and type generation.
* [`next-i18n-auth`](https://github.com/Sayyat/next-i18n-auth) — Real-world example integrating both smart-i18n and smart-i18n-react with feature-sliced architecture and multilingual auth flows.
