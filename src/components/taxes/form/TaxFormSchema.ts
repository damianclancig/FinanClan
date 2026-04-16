import * as z from "zod";
import { Translations } from "@/types";

export const getTaxFormSchema = (translations: Translations) => z.object({
  name: z.string().min(1, { message: translations.taxNameRequired }),
  month: z.number().min(0).max(11),
  year: z.number(),
  amount: z
    .number({ message: translations.amountRequired })
    .positive({ message: translations.amountPositive }),
});

export type TaxFormSchemaType = z.infer<ReturnType<typeof getTaxFormSchema>>;
