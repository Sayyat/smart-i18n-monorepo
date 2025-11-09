import {
    registerTasks as registerCoreTasks
} from '@sayyyat/smart-i18n/tasks';

export async function registerTasks(gulp) {
    await registerCoreTasks(gulp);

    const helpTask = (await import("./tasks/help.js")).default;
    const initTask = (await import("./tasks/init.js")).default;
    const generateConfigsTask = (await import("./tasks/generate-configs.js")).default;
    const createFeature = (await import("./tasks/create-feature.js")).default;

    helpTask(gulp);
    initTask(gulp);
    generateConfigsTask(gulp);
    createFeature(gulp);

    gulp.task("default", gulp.series(
        "generate-config",
        "generate-namespaces",
        "generate-templates",
        "generate-types"
    ));
}
