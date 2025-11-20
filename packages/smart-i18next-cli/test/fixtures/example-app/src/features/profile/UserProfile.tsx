import { useTranslation } from "@/i18n/client";

export function UserProfile() {
	const {t} = useTranslation(); // No arguments
	return <div>{t("Profile Page Title")}</div>;
}
    