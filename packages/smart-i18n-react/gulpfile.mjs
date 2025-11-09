import {
    cleanTask,
    generateNamespacesTask,
    generateTranslationsTask,
    watchTask
} from '@sayyyat/smart-i18n/tasks';

import {
    generateTemplatesTask,
    generateTypesTask,
    helpTask,
    initTask,
    generateConfigsTask,
    createFeatureTask,
} from './tasks/index.js';

export async function registerTasks(gulp) {
    cleanTask(gulp);
    generateNamespacesTask(gulp);
    generateTemplatesTask(gulp);
    generateTranslationsTask(gulp);
    generateTypesTask(gulp);
    watchTask(gulp);

    helpTask(gulp);
    initTask(gulp);
    generateConfigsTask(gulp);
    createFeatureTask(gulp);

    gulp.task("default", gulp.series(
        "generate-configs",
        "generate-namespaces",
        "generate-templates",
        "generate-types"
    ));
}
