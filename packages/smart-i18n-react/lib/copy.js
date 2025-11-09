import fs from "fs";
import path from "path";
import { getPathFromConsumerRoot, getPathFromLibraryRoot } from "./paths.js";

export function copyDirectoryRecursive(src, dest) {
  if (fs.existsSync(dest)) {
    console.warn(`⚠️ Skipped: ${dest.replace(process.cwd(), ".")} folder already exists in project`);
    return;
  }
  
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function copyFileWithCheck(sourcePath, destPath, fileName) {
  const destFile = path.join(destPath, fileName);
  const srcFile = path.join(sourcePath, fileName);

  if (!fs.existsSync(srcFile)) {
    console.warn(`⚠️ Skipped: Template file ${fileName} not found in library source.`);
    return;
  }

  if (fs.existsSync(destFile)) {
    console.warn(`⚠️ Skipped: ./${fileName} already exists in project`);
    return;
  }

  fs.copyFileSync(srcFile, destFile);
  console.log(`✅ Copied: ./${fileName}`);
}