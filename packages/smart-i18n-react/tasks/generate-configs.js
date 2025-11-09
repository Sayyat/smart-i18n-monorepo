import { generateConfigs } from "../lib/config-generator.js";

export default function generateConfigTask(gulp) {
  const task = async () => {
    await generateConfigs();
  };
  
  gulp.task("generate-config", task);
}