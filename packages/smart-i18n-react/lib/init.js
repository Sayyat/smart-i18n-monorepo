/*
 * Copyright (c) 2025. Sayat Raykul
 */

import fs from "fs";
import {getPathFromLibraryRoot} from "./paths.js";
import {copyDirectoryRecursive, getPathFromConsumerRoot} from "@sayyyat/smart-i18n/lib";

export function copyBaseInitFiles() {
    const fileList = ["./i18next.config.json", "./.demo-env"];

    for (const file of fileList) {
        const src = getPathFromLibraryRoot(file);
        const dest = getPathFromConsumerRoot(file);

        if (!fs.existsSync(src)) {
            console.warn(`⚠️ Skipped: ${file} not found in library`);
            continue;
        }

        if (fs.existsSync(dest)) {
            console.warn(`⚠️ Skipped: ${file} already exists in project`);
            continue;
        }

        fs.copyFileSync(src, dest);
        console.log(`✅ Copied: ${file}`);
    }
}

export function init() {
    copyBaseInitFiles();

    const libraryTemplatePath = getPathFromLibraryRoot("src", "i18n");
    const consumerSrc = getPathFromConsumerRoot("src", "i18n");
    copyDirectoryRecursive(libraryTemplatePath, consumerSrc);
}
