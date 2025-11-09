import {
    cleanTask,
    generateConfigsTask,
    generateNamespacesTask,
    generateTemplatesTask,
    generateTranslationsTask,
    generateTypesTask,
    helpTask,
    initTask,
    watchTask
} from "./tasks";

export function registerTasks(gulp) {
    cleanTask(gulp);
    generateConfigsTask(gulp);
    generateNamespacesTask(gulp);
    generateTemplatesTask(gulp);
    generateTranslationsTask(gulp);
    generateTypesTask(gulp);
    helpTask(gulp);
    initTask(gulp);
    watchTask(gulp);

    gulp.task("default", gulp.series(
        "generate-configs",
        "generate-namespaces",
        "generate-templates",
        "generate-types"
    ));
}