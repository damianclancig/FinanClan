/*
 * Copyright 2026 Clancig FullstackWeb
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as z from "zod";
import { Translations } from "@/types";

export const getTransactionFormSchema = (translations: Translations) => z.object({
  description: z.string().min(1, { message: translations.descriptionRequired }).max(100, { message: translations.descriptionMaxLength }),
  amount: z
    .number({ message: translations.amountRequired })
    .positive({ message: translations.amountPositive }),
  date: z.date({ message: translations.dateRequired }),
  categoryId: z.string({ message: translations.categoryRequired }),
  type: z.union([z.enum(["income", "expense"]), z.undefined()]),
  paymentMethodId: z.string({ message: translations.paymentMethodRequired }),
  installments: z.number().min(1).max(120).optional(),
});

export type TransactionFormSchemaType = z.infer<ReturnType<typeof getTransactionFormSchema>>;
