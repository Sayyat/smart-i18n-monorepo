import { AUTOGENERATION_COMMENT } from "../lib/comment.js";
import { generateTypes } from "../lib/type.js";

export function generateTypesTask(gulp) {
  gulp.task("generate-types", async function () {
    await generateTypes(AUTOGENERATION_COMMENT);
  });
}
