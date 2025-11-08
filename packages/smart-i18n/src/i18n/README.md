# i18n Architecture and Implementation

## Overview

The **i18n** system in this project is designed for **internationalization** (i18n) with type-safety and efficient
handling of translations. The system integrates **i18next** with **React** and **Next.js**, while leveraging *
*TypeScript** for strict typing and **Gulp** for automated tasks.

This documentation covers the **file structure**, **translation functions**, and key components of the i18n system,
including how translation keys are handled, how translations are loaded, and how server-side translation functions are
utilized.

---

## **File Structure**

Here is the layout of the **i18n** system files:

```plaintext
src/
├── i18n/
│   ├── generated/          // Generated files for namespaces and translation types
│   │   ├── index.ts        // public api
│   │   ├── namespaces.ts   // Client-side i18next initialization
│   │   └── types.ts        // Type-safe wrapper for translation functions
│   ├── lib/
│   │   ├── config.ts       // Configuration file for languages and fallback
│   │   └── safety.ts       // Type-safe wrapper for translation functions
│   ├── locales/            // Translation files per language (JSON)
│   ├── types/
│   │   └── i18n.ts         // Type definitions for translation functions
│   └── index.ts            // Exports common i18n utilities for the project
```

---

## **Key Components**

### **1. `/src/i18n/index.ts`**

This file serves as the **centralized entry point** for accessing translation functionality throughout the project. It
exports the following:

* **Types and Constants**: Exports types like `TFunction` and constants like `languages` and `FALLBACK_LANGUAGE` for
  consistent usage across the app.
* **`NAMESPACES`**: A constant that holds the namespaces used in the translation files.

```ts
export {
    NAMESPACES,
    type TNamespace,
    type TNamespaceTranslationKeys,
    type TAllTranslationKeys,
} from "./generated";
export {
    languages,
    FALLBACK_LANGUAGE,
    defaultNS,
    type TLanguage,
} from "./lib/config";

```

---

### **2. Translation Function Wrapping (`safeT`)**

The **`safeT`** function is used to create a **type-safe translation function**. It ensures that when calling `t()`
inside client-side or server-side code, the translation keys are validated and suggestions are available in your IDE.

**Key Code Example**:

```ts
export function safeT(t: i18n["t"]): TFunction {
   ...
}
```

This adds strict typing for the translation function, improving developer experience by providing autocompletion for
translation keys and namespaces in the IDE.

---

### **3. `i18n/lib/config.ts`**

This file contains basic configuration related to **languages** and **fallback language**. It defines:

* **`languages`**: A constant array of supported languages (e.g., `en`, `kk`, `ru`).
* **`FALLBACK_LANGUAGE`**: The default language used when a translation is unavailable for the selected language.

```ts
export const languages = ["kk", "ru", "en"] as const;
export type TLanguage = (typeof languages)[number];
export const FALLBACK_LANGUAGE: TLanguage = "en";
export const defaultNS = "translation";
```

---

## **Translation Key Management**

### **Static Keys with Placeholders**

As part of the i18n system design, we follow a philosophy inspired by **Django gettext**, where translation keys are *
*static** and **placeholders** are used for variables (e.g., `{{username}}`).

**Example**:

```js
{
    t("Welcome, {{username}}", {username: data?.firstname ?? ""})
}
```

This approach ensures that:

* Translation keys are static and reusable across languages.
* The translation system can handle dynamic content (e.g., user names, dates) using placeholders.
* Translations are easily processed and auto-generated, even with placeholders.

---

### **Generated Types for Translation Keys**

The translation keys and namespaces are generated using **Gulp** scripts. The **`types.ts`** file ensures that the
translation keys are strictly typed and prevents errors in accessing the wrong keys.

```ts
export type TFunction<N extends TNamespace> = <
  K extends TNamespaceTranslationKeys[N],
>(
  key: K,
  options?: Record<string, unknown>,
) => string;
```

This ensures that developers only use valid translation keys and namespaces, further improving the development
experience and reducing potential bugs.

---

## Conclusion

The **i18n system** in this project is designed to be scalable, maintainable, and type-safe. With **i18next**, *
*TypeScript**, and custom utilities like `safeT`, the system provides a powerful and developer-friendly
environment for managing translations. The modular approach, with a dedicated focus on static translation keys and
placeholders, ensures that translations remain consistent across languages and easy to maintain as the project grows.
