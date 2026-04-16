import * as z from "zod";
import { Translations } from "@/types";

export const getSavingsFundFormSchema = (translations: Translations) => z.object({
  name: z.string().min(1, { message: translations.savingsFundNameRequired }),
  description: z.string().min(1, { message: translations.savingsFundDescriptionRequired }),
  targetAmount: z.number({ message: translations.savingsFundTargetAmountRequired }).positive({ message: translations.savingsFundTargetAmountPositive }),
  targetDate: z.date().optional(),
});

export type SavingsFundFormSchemaType = z.infer<ReturnType<typeof getSavingsFundFormSchema>>;
