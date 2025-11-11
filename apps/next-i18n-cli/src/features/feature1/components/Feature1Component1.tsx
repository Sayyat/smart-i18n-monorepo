import { useTranslation } from "@/i18n/client"

export function Feature1Component1() {
    const {t} = useTranslation("features.feature1.components.Feature1Component1")

    return <div>{t("This is awesome text from {{name}}", {name: "Feature1Component1"})}</div>
}