"use client"
import { useTranslation } from "@/i18n/client";
import {Trans, } from "react-i18next"

export default function Home() {
	const {t} = useTranslation("my custom namespace")
	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
				<h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
					{t("To get started, edit the page.tsx file.", {
						context: {
							customName: "bla"
						}
					})}
				</h1>

				<Trans i18nKey={"This is Trans key"}>
					This is Trans value
				</Trans>
			</div>
		</div>
	);
}
