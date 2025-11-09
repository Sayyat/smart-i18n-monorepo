import { AUTOGENERATION_COMMENT } from "../lib/comment.js";
import { generateNamespaces } from "../lib/namespaces.js";

export function generateNamespacesTask(gulp) {
  gulp.task("generate-namespaces", async function () {
    await generateNamespaces(AUTOGENERATION_COMMENT);
  });
}
