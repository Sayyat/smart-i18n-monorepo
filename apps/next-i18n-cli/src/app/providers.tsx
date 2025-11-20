/*
 * Copyright (c) 2025. Sayat Raykul
 */

"use client";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { defaultNS, i18n } from "@/i18n/client";

export function ClientProvidersWrapper({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<I18nextProvider i18n={i18n} defaultNS={defaultNS}>
			{children}
		</I18nextProvider>
	);
}
