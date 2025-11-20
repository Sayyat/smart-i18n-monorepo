import { TFunction } from "@/i18n";
// We are using a namespace (UserProfile) from another file here (Generic Type, not Reuse)
// But if the file does not have useTranslation, the plugin will bind it to the filename.
// If your goal is reuse, then it should be in namespaces.ts.

// In this test, we will simply check if the filename (shared.utils.validation) is bound
export const getErrorMessage = (t: TFunction) => {
	return t("Validation Error");
};
    