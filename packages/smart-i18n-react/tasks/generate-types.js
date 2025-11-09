import { AUTOGENERATION_COMMENT } from "../lib/comment.js";
import { generateTypes } from "@sayyyat/smart-i18n/lib";

export function generateTypesTask(gulp) {
  gulp.task("generate-types", async function () {
    await generateTypes(AUTOGENERATION_COMMENT);
  });
}
