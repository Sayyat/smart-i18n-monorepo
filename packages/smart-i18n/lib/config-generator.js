import fs from "fs/promises";
import { AUTOGENERATION_COMMENT } from "./comment.js";
import { configs } from "./config.js";
import { getPathFromConsumerRoot } from "./paths.js";
import path from "path";

export async function generateConfigs(autogenerationComment = AUTOGENERATION_COMMENT) {
  const configPath = getPathFromConsumerRoot(configs.configFilePath);

  const content = `
${autogenerationComment}

export const languages = ${JSON.stringify(configs.languages)} as const;
export type TLanguage = (typeof languages)[number];
export const FALLBACK_LANGUAGE: TLanguage = "${configs.fallbackLanguage}";
export const defaultNS = "${configs.defaultNS}";
`.trim();

  const dir = path.dirname(configPath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  await fs.writeFile(configPath, content, "utf8");
  console.log(`✅ smart-i18n runtime config generated at: ${configPath}`);
}