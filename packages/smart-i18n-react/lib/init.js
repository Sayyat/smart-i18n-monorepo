import fs from "fs";
// ❗️ Өзінің жергілікті (local) helper-лерін импорттайды
import { copyDirectoryRecursive, copyFileWithCheck } from "./copy.js";
import { getPathFromConsumerRoot, getPathFromLibraryRoot } from "./paths.js";

export function init(isFsd = false) {
  
  // 1. ❗️ Дұрыс шаблон папкасын таңдау
  const templateDirName = isFsd ? "fsd" : "default";
  const configSourceDir = getPathFromLibraryRoot("configs", templateDirName);
  
  const consumerRootDir = getPathFromConsumerRoot();

  console.log(`🚀 Initializing with ${isFsd ? 'FSD' : 'default'} template...`);

  // 2. ❗️ 'i18next.config.json' файлын таңдалған папкадан көшіру
  copyFileWithCheck(
    configSourceDir, 
    consumerRootDir, 
    "i18next.config.json"
  );

  // 3. ❗️ '.demo-env' файлын көшіру (ол 'configs' ішінде емес, негізгі (root) папкада деп есептейміз)
  const demoEnvSourceDir = getPathFromLibraryRoot(); // Кітапхананың түбірі
  copyFileWithCheck(
    demoEnvSourceDir, 
    consumerRootDir, 
    ".demo-env"
  );

  // 4. ❗️ 'src/i18n' шаблондарын көшіру (бұл бұрынғыдай)
  const libraryTemplatePath = getPathFromLibraryRoot("src", "i18n");
  const consumerSrcPath = getPathFromConsumerRoot("src", "i18n");
  
  // 'copyDirectoryRecursive' өз тексерулерін (checks) өзі жасайды
  copyDirectoryRecursive(libraryTemplatePath, consumerSrcPath);
}