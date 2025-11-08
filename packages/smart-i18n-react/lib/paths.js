/*
 * Copyright (c) 2025. Sayat Raykul
 */
import {findLibraryRoot} from "@sayyyat/smart-i18n/lib";
import path from "path";

const LIBRARY_NAME = "@sayyyat/smart-i18n-react"

export function getPathFromLibraryRoot(...segments) {
    return path.join(findLibraryRoot(LIBRARY_NAME), ...segments);
}