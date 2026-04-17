import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatNumberForDisplay } from "@/lib/utils";
import { useTranslations } from "@/contexts/LanguageContext";
import { getSavingsFundFormSchema, SavingsFundFormSchemaType } from "./SavingsFundFormSchema";

interface UseSavingsFundFormProps {
  onSubmit: (values: SavingsFundFormSchemaType) => void;
  initialData?: any;
}

export function useSavingsFundForm({
  onSubmit,
  initialData,
}: UseSavingsFundFormProps) {
  const { translations } = useTranslations();
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [displayAmount, setDisplayAmount] = useState<string>('');

  const formSchema = getSavingsFundFormSchema(translations);

  const form = useForm<SavingsFundFormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      targetAmount: initialData?.targetAmount,
      targetDate: initialData?.targetDate ? new Date(initialData.targetDate) : undefined,
    },
  });

  useEffect(() => {
    if (initialData?.targetAmount) {
      setDisplayAmount(formatNumberForDisplay(String(initialData.targetAmount.toFixed(2))));
    }
    form.reset({
      name: initialData?.name || "",
      description: initialData?.description || "",
      targetAmount: initialData?.targetAmount,
      targetDate: initialData?.targetDate ? new Date(initialData.targetDate) : undefined,
    });
  }, [initialData, form]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    let numericValue = rawValue.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');

    if (parts.length > 2) {
      numericValue = `${parts[0]}.${parts.slice(1).join('')}`;
    }

    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2);
      numericValue = parts.join('.');
    }

    setDisplayAmount(formatNumberForDisplay(numericValue));

    const valueForForm = numericValue.replace(/,/g, '');
    const parsedNumber = parseFloat(valueForForm);
    form.setValue('targetAmount', isNaN(parsedNumber) ? 0 : parsedNumber, { shouldValidate: true });
  };

  return {
    form,
    states: {
      isCalendarOpen,
      setCalendarOpen,
      displayAmount,
    },
    handlers: {
      handleAmountChange,
      onSubmit: form.handleSubmit(onSubmit),
    }
  };
}
