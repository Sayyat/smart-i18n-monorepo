import fs from "fs/promises";
import path from "path";
import { configs, getPathFromConsumerRoot } from "@sayyyat/smart-i18n/lib";
import { AUTOGENERATION_COMMENT } from "../lib/comment.js";

export async function generateConfigs(autogenerationComment = AUTOGENERATION_COMMENT) {
  const configPath = getPathFromConsumerRoot(configs.configFilePath);
  
  const content = `
${autogenerationComment}

export const languages = ${JSON.stringify(configs.languages)} as const;
export type TLanguage = (typeof languages)[number];
export const FALLBACK_LANGUAGE: TLanguage = "${configs.fallbackLanguage}";
export const defaultNS = "${configs.defaultNS}";
export const COOKIE_NAME = "${configs.cookieName}";
`.trim();

  const dir = path.dirname(configPath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  await fs.writeFile(configPath, content, "utf8");
  console.log(`✅ smart-i18n-react runtime config generated at: ${configPath}`);
}