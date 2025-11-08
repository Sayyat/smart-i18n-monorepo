# **smart-i18n-react**

## **Automation Scripts Documentation**

## **Overview**

The smart-i18n-react system is a comprehensive internationalization (i18n) toolkit that streamlines translation management in large-scale js/ts applications. It automates namespace generation, key extraction, translation updates, and TypeScript typing — all powered by a Gulp-based workflow.

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

---

## **Configuration**

## **i18next.config.json**

This is the configuration file used by the **smart-i18n-react** system to define how translations should be managed. It will be created in consumer project automatically via `smart-i18n-react init` command.

```json
{
  // Path to your i18n configuration file
  "configFilePath": "src/i18n/lib/config.ts",

  // Directory where all translation files are stored
  "localesDirectory": "src/i18n/locales",

  // Path for generated namespaces
  "generatedNamespacesPath": "src/i18n/generated/namespaces.ts",

  // Path for generated TypeScript types
  "generatedTypesPath": "src/i18n/generated/types.ts",

  // Whether to preserve or remove unused keys
  "keepUnusedKeys": true,

  // Patterns for files to include in the translation process
  "includePatterns": [
    "src/app/**/*.{jsx,tsx}",
    "src/core/components/**/*.{js,jsx,ts,tsx}",
    "src/core/hooks/**/*.{js,jsx,ts,tsx}",
    "src/shared/components/**/*.{js,jsx,ts,tsx}",
    "src/shared/hooks/**/*.{js,jsx,ts,tsx}",
    "src/shared/services/api.{js,ts}", // look this file to specify dynamic backend error codes
    "src/features/*/components/**/*.{js,jsx,ts,tsx}",
    "src/features/*/hooks/**/*.{js,jsx,ts,tsx}",
    "src/features/*/lib/zod.{js,ts}"
  ],

  // Patterns for files to exclude from the translation process
  "excludePatterns": [
    "src/**/*.d.ts",   // Exclude TypeScript definition files
    "**/node_modules/**", // Exclude dependencies in node_modules
    "src/i18n/**",  // Exclude existing i18n files (we're handling these separately)
    "src/app/api/**", // Exclude API files
    "src/shared/components/ui/**", // Exclude UI component files
    "src/shared/hooks/**", // Exclude shared hooks
    "src/shared/data/**" // Exclude data files
  ]
}
```

---

### **Key Explanations for the Config File**:

* **`configFilePath`**: The path to the TypeScript configuration file that defines language settings and other
  i18n-related configuration parameters.
* **`localesDirectory`**: The directory where translation files (in various languages) will be stored. Each language
  will have its own folder inside this directory.
* **`generatedNamespacesPath`**: The path where the generated namespace definitions are stored. This helps group
  translation keys under specific namespaces.
* **`generatedTypesPath`**: The path where TypeScript types for translation keys are generated. This helps ensure type
  safety when accessing translation keys in the codebase.
* **`keepUnusedKeys`**: A flag to indicate whether to keep unused translation keys in the files. When set to `true`,
  even keys that are no longer used in the code will remain in the translation files.
* **`includePatterns`**: These are the patterns that tell the system where to look for files containing translation
  keys. The system will scan these files and extract the necessary translation data.
* **`excludePatterns`**: These patterns define which files should be excluded from translation scanning. For example,
  `src/**/*.d.ts` excludes TypeScript definition files, which do not contain translations.

  
### ⚠️ Note on Running Inside `smart-i18n-react`

> The Gulp tasks are **not executable inside the `smart-i18n-react` library itself**.
> They are designed to be installed and executed **from within a consumer project** (e.g., Next.js, React, or Vue projects).
>
> In your consumer project, install `smart-i18n-react` and run commands like:

```bash
  yarn smart-i18n-react generate-templates
  # or
  npx smart-i18n-react generate-types
```

> The library will detect your project root and apply all operations based on your own `i18next.config.json`.

-----

## **Key Features**

### 1. **Automatic Namespace and Key Generation**

* The system automatically generates namespaces and translation keys by scanning the source code, ensuring easy
  maintenance and scalability without manually defining each translation key.

### 2. **Translation File Management**

* **Translation Files**: Stores translations for each language in JSON files (e.g.,
  `src/i18n/locales/{language}/{namespace}.json`).
* **Automatic Merging**: New translation keys are automatically merged with existing ones, preserving previously added translations.
* **Configurable Cleanup**: By default, unused keys are removed during scanning. To retain explicitly declared but unused keys — such as backend error messages — set `"keepUnusedKeys": true` in the config.

### 3. **Dynamic Translation Generation**

![Deep Translate API](../public/assets/deep-translate.png)

* Missing translations are detected and fetched using the *
  *[Deep Translate API](https://rapidapi.com/gatzuma/api/deep-translate1)** from **[RapidAPI](https://rapidapi.com/)**.
  This ensures that even new translations are automatically populated without manual intervention.

### 4. **TypeScript Integration**

* The system integrates TypeScript to provide type safety for translations. The generated types ensure that only valid
  keys are used in the codebase, preventing errors and increasing code reliability.

---

## **CLI Commands**

### 1. **`smart-i18n-react` (default task)**

* Runs the following tasks **in order**:

    * `generate-namespaces`: Scans the codebase and generates namespace definitions.
    * `generate-templates`: Extracts translation keys and updates the translation files.
    * `generate-types`: Generates TypeScript types for translations.

### 2. **`smart-i18n-react generate-namespaces`**

* Scans the codebase for translation keys and generates namespace definitions.
* **Output**: `src/i18n/generated/namespaces.ts`

### 3. **`smart-i18n-react generate-templates`**

* Extracts translation keys from source files and creates or updates translation files for all languages.
* **Output**: `src/i18n/locales/{{lng}}/{{ns}}.json`

* **Features**:

    * Avoids data loss by preserving old translations.
    * Ensures the safe addition of new translations without removing existing ones.

### 4. **`smart-i18n-react generate-types`**

* Generates TypeScript types for your translations.
* **Output**: `src/i18n/generated/types.ts`

### 5. **`smart-i18n-react generate-translations [-l, --lang <language>]`**

* Translates only the missing keys using the Deep Translate API from RapidAPI.
* **Parameters**:

    * `-l, --lang`: Specifies the language to translate (Default: all).
* **Example**:

    * `smart-i18n-react generate-translations -l kk` - Translates only the Kazakh language.
    * `smart-i18n-react generate-translations` - Translates all languages.


### 6. **`smart-i18n-react watch`**

* Automatically runs the following tasks when source files or translation files change:

    * `generate-namespaces`
    * `generate-templates`
    * `generate-types`
* Watches for changes in:

    * Source files (e.g., JSX/TSX files in the codebase).
    * Translation files in `src/i18n/locales`.

### 7. **`smart-i18n-react create-feature [-n, --name <feature-name>] [--js]`**

* Generates boilerplate for a new feature in your application.
* **Parameters**:

    * `-n, --name`: The name of the new feature (in camelCase or kebab-case). \[required]
    * `--js`: Optionally generates JavaScript/JSX files instead of TypeScript/TSX. (Default: false)
* **Example**:

    * `smart-i18n-react create-feature -n new-feature` - Generates a new feature with TypeScript/TSX files.
    * `smart-i18n-react create-feature -n new-feature --js` - Generates the feature with JavaScript/JSX files.

### 8. **`smart-i18n-react help`**

* Displays the available tasks and their descriptions.

---

> 💡 **Tip**: It's recommended to run `smart-i18n-react` (default task) before each deployment to ensure that your namespaces, templates, and types are fully synced.

## **Workflow**

1. **Namespace Generation**: Run `smart-i18n-react generate-namespaces` to scan your codebase and update namespace definitions.
2. **Key Extraction**: Run `smart-i18n-react generate-templates` to extract new translation keys from your codebase.
3. **Type Generation**: Run `smart-i18n-react generate-types` to generate TypeScript types for the translations.
4. **Translation**: Run `smart-i18n-react generate-translations` to automatically translate missing keys.
5. **Watching**: Use `smart-i18n-react watch` to monitor file changes and regenerate namespaces, templates, and types automatically.
6. **Feature Creation**: Use `smart-i18n-react create-feature` to create a new feature with the necessary boilerplate.

## Architecture (Gulp Scripts File Structure)

This package (`smart-i18n-react`) acts as a "superset" and extension of the core `@sayyyat/smart-i18n` package.

* **Core Logic (`lib/`, `tasks/`):**
    This package contains only the logic unique to React:
    * `lib/feature.js`: Logic for FSD feature scaffolding.
    * `lib/init.js`: Logic for scaffolding React-specific provider files.
    * `tasks/create-feature.js`: The Gulp task for `smart-i18n-react create-feature`.
    * `tasks/init.js`: The Gulp task for `smart-i18n-react init`.

* **Inherited Logic:**
    All other translation tasks (`generate-templates`, `translate`, `sync`, `generate-types`, `watch`) are **imported directly** from the core `@sayyyat/smart-i18n` package, which is included as a dependency.
