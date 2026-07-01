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

export const getSavingsFundFormSchema = (translations: Translations) => z.object({
  name: z.string().min(1, { message: translations.savingsFundNameRequired }),
  description: z.string().min(1, { message: translations.savingsFundDescriptionRequired }),
  targetAmount: z.number({ message: translations.savingsFundTargetAmountRequired }).positive({ message: translations.savingsFundTargetAmountPositive }),
  targetDate: z.date().optional(),
});

export type SavingsFundFormSchemaType = z.infer<ReturnType<typeof getSavingsFundFormSchema>>;
