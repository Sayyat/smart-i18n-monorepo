export async function registerTasks(gulp) {
    const helpTask = (await import("./tasks/help.js")).default;
    const initTask = (await import("./tasks/init.js")).default;
    const createFeature = (await import("./tasks/create-feature.js")).default;

    helpTask(gulp);
    initTask(gulp);
    createFeature(gulp);
}
