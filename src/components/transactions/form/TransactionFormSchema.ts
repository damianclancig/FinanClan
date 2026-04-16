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
