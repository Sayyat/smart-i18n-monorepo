/*
 * Copyright (c) 2025. Sayat Raykul
 */
import path from "path";
import fs from "fs";
import chalk from "chalk";
import { getPathFromConsumerRoot } from "@sayyyat/smart-i18n/lib";

export function getTemplates(name, useJs) {
  const Name = name.charAt(0).toUpperCase() + name.slice(1);
  const ext = useJs ? "js" : "ts";
  const extx = useJs ? "jsx" : "tsx";

  return {
    [`components/${Name}.${extx}`]: `export function ${Name}() {
  return (
    <>${Name} component</>
  );
}
`,
    [`hooks/use${Name}.${ext}`]: `export function use${Name}() {
  
}
`,
    [`lib/zod.${ext}`]: "",
    [`services/client.${ext}`]: "",
    [`services/server.${ext}`]: "",
    [`types/${name.toLowerCase()}.d.${ext}`]: "",
    [`index.${ext}`]: "",
  };
}


export function generateFeatureStructure(featureName, useJs = false) {
  const basePath = getPathFromConsumerRoot("src", "features", featureName);

  const folders = [
    "components",
    "hooks",
    "lib",
    "providers",
    "services",
    "store",
    "types",
  ];

  const templates = getTemplates(featureName, useJs);

  folders.forEach((folder) => {
    const dirPath = path.join(basePath, folder);
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(chalk.gray("📁 Created:"), dirPath);
  });

  Object.entries(templates).forEach(([relativePath, content]) => {
    const filePath = path.join(basePath, relativePath);
    fs.writeFileSync(filePath, content, "utf8");
    console.log(chalk.green("📝 File created:"), filePath);
  });

  console.log(
    chalk.blueBright(`✨ Feature "${featureName}" scaffolded successfully.`),
  );
}
