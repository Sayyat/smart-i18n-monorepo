import { init } from "../lib/init.js";

export function initTask(gulp) {
    const task = () => {
        const isFsd = process.argv.includes('--fsd');
        init(isFsd);
    };

    gulp.task("init", task);
}
