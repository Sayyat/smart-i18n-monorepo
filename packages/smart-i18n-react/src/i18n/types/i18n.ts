/*
 * Copyright (c) 2025. Sayat Raykul
 */

import type { TNamespace, TNamespaceTranslationKeys } from "../generated";

export type TFunction<N extends TNamespace> = <
  K extends TNamespaceTranslationKeys[N],
>(
  key: K,
  options?: Record<string, unknown>,
) => string;
