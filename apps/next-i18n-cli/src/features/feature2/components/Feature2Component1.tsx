import { useTranslation } from "@/i18n/client"

export function Feature1Component1() {
    const {t} = useTranslation("features.feature2.components.Feature2Component1")

    return <div>{t("This is another text from {{name}}", {name: "Feature2Component1"})}</div>
}