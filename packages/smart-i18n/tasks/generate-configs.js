import { AUTOGENERATION_COMMENT } from "../lib/comment.js";
import { generateConfigs } from "../lib/config-generator.js";

export function generateConfigsTask(gulp) {
  const task = async () => {
    await generateConfigs(AUTOGENERATION_COMMENT);
  };

  gulp.task("generate-configs", task);
}