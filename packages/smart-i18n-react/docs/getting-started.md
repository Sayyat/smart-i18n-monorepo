# Getting Started with smart-i18n-react

## 📦 Installation

To begin using `smart-i18n-react` in your project:

```bash
  yarn add -D @sayyyat/smart-i18n-react
```

> Note: `@sayyyat/smart-i18n` is a peer dependency and must be installed manually if not already present.

---

## 🔧 Initialization

Run the following command to set up the required configuration files and folder structure:

```bash
  yarn smart-i18n-react init
```

This will:

* Copy `i18next.config.json` into your project root
* Copy `.demo-env` into your project root (used for API key setup)
* Scaffold `src/i18n/` folder structure with example files (types, settings, locales, etc.)

---

## 📁 Generated Structure

After `init`, your project will include:

```plaintext
src/
├── i18n/
│   ├── generated/          // Generated files for namespaces and translation types
│   │   ├── index.ts.       // public api
│   │   ├── namespaces.ts   // Client-side i18next initialization
│   │   └── types.ts        // Type-safe wrapper for translation functions
│   ├── lib/
│   │   ├── client.ts       // Client-side i18next initialization
│   │   ├── config.ts       // Configuration file for languages and fallback
│   │   ├── safety.ts       // Type-safe wrapper for translation functions
│   │   └── server.ts       // Server-side i18next initialization
│   ├── locales/            // Translation files per language (JSON)
│   ├── types/
│   │   └── i18n.ts         // Type definitions for translation functions
│   └── index.ts            // Exports i18n utilities for the project
```

See [i18n-structure](./i18n-structure.md) for more information

---

## 🧰 Other Available Commands

```bash
  yarn smart-i18n-react help
```

Displays all available CLI tasks with descriptions.

```bash
  yarn smart-i18n-react create-feature -n your-feature-name
```

Scaffolds a feature folder based on your custom Feature-Sliced Design.

---

## ✅ Next Steps

* Explore [docs/gulp.md](./gulp.md) for internal structure and task design
* Check out the [next-i18n-auth](https://github.com/Sayyat/next-i18n-auth) repo for integration example

---

## 🧠 Tips

* You can customize patterns and paths via `i18next.config.json`
* You can automate everything via CI/CD with the `release` script
* Namespaces and type generation are safe to commit in your Git repo

---

## 📚 Related Projects

* [`@sayyyat/smart-i18n`](https://www.npmjs.com/package/@sayyyat/smart-i18n) — The core CLI engine that provides
  scanning, merging, and type generation.
* [`next-i18n-auth`](https://github.com/Sayyat/next-i18n-auth) — Real-world example integrating both smart-i18n and
  smart-i18n-react with feature-sliced architecture and multilingual auth flows.
