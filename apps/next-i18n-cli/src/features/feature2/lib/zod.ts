/*
 * Copyright (c) 2025. Sayat Raykul
 */

import { z } from "zod";
import { TFunction } from "@/i18n";

export const createRegisterSchema = (
	t: TFunction<"my-custom-namespace">,
) => {
	return z
	.object({
		email: z
		.string({
			required_error: t("Email is required"),
		})
		.email(t("Email is invalid")),

		firstname: z
		.string({
			required_error: t("Firstname is required"),
		})
		.min(1, { message: t("Firstname is required") }), // Ensure that it validates `undefined` or empty strings
		lastname: z
		.string({
			required_error: t("Lastname is required"),
		})
		.min(1, { message: t("Lastname is required") }),
		password: z
		.string()
		.min(
			8,
			t("Password must be at least {{symbols}} symbols", {
				symbols: 8,
			}),
		)
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, t("Password is weak")),

		confirm: z.string(),
		agree: z.literal(true, {
			errorMap: () => ({ message: t("You must agree with the terms") }),
		}),
	})
	.refine((data) => data.password === data.confirm, {
		message: t("Password and Confirm mismatch"),
		path: ["confirm"],
	});
};

export const createLoginSchema = (
	t: TFunction<"my-custom-namespace">,
) => {
	return z.object({
		email: z
		.string({
			required_error: t("Email is required"),
		})
		.email(t("Email is invalid")),
		password: z.string().min(
			5,
			t("Password must be at least {{symbols}} symbols", {
				symbols: 5,
			}),
		),
	});
};
