import { useTranslation } from "@/i18n/client";

export default function Page() {
	const {t} = useTranslation("features.auth.Login");
	return <button>{t("Submit Button")}</button>;
}
    