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

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatNumberForDisplay } from "@/lib/utils";
import { 
  TransactionFormValues, 
  Category, 
  PaymentMethod 
} from "@/types";
import { useTranslations } from "@/contexts/LanguageContext";
import { getTransactionFormSchema, TransactionFormSchemaType } from "./TransactionFormSchema";

interface UseTransactionFormProps {
  onSubmit: (values: TransactionFormValues) => void;
  onSaveAndAddAnother?: (values: TransactionFormValues) => void;
  initialData?: Partial<TransactionFormValues> & { id?: string };
  paymentMethods: PaymentMethod[];
}

export function useTransactionForm({
  onSubmit,
  onSaveAndAddAnother,
  initialData,
  paymentMethods,
}: UseTransactionFormProps) {
  const { translations } = useTranslations();
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [displayAmount, setDisplayAmount] = useState<string>('');
  const [showInstallments, setShowInstallments] = useState(false);
  const [installments, setInstallments] = useState(initialData?.installments || 1);
  const [isManualInstallments, setIsManualInstallments] = useState(false);

  const formSchema = getTransactionFormSchema(translations);

  const form = useForm<TransactionFormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || "",
      amount: initialData?.amount,
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      categoryId: initialData?.categoryId || undefined,
      type: (initialData?.type === 'income' || initialData?.type === 'expense') ? initialData.type : undefined,
      paymentMethodId: initialData?.paymentMethodId || undefined,
      installments: initialData?.installments || 1,
      isExtraordinary: initialData?.isExtraordinary || false,
    },
  });

  // Sync initialData
  useEffect(() => {
    if (initialData?.amount) {
      setDisplayAmount(formatNumberForDisplay(String(initialData.amount.toFixed(2))));
    }

    const initialInstallments = initialData?.installments || 1;
    setInstallments(initialInstallments);
    setIsManualInstallments(initialInstallments > 24);

    form.reset({
      description: initialData?.description || "",
      amount: initialData?.amount,
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      categoryId: initialData?.categoryId || undefined,
      type: (initialData?.type === 'income' || initialData?.type === 'expense') ? initialData.type : undefined,
      paymentMethodId: initialData?.paymentMethodId || undefined,
      installments: initialInstallments,
      isExtraordinary: initialData?.isExtraordinary || false,
    });
  }, [initialData, form]);

  const selectedPaymentMethodId = form.watch("paymentMethodId");
  const transactionType = form.watch("type");

  // Logic for installments visibility
  useEffect(() => {
    const paymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethodId);
    if (paymentMethod && paymentMethod.type === 'Credit Card' && transactionType === 'expense') {
      setShowInstallments(true);
    } else {
      setShowInstallments(false);
      setInstallments(1);
      form.setValue('installments', 1);
      setIsManualInstallments(false);
    }
  }, [selectedPaymentMethodId, transactionType, paymentMethods, form]);

  const prepareValues = (values: TransactionFormSchemaType): TransactionFormValues | null => {
    if (!values.type) {
      form.setError('type', { message: translations.typeRequired });
      return null;
    }
    return {
      ...values,
      type: values.type,
      date: values.date.toISOString(),
    };
  };

  const handleFormSubmit = (values: TransactionFormSchemaType) => {
    const formValues = prepareValues(values);
    if (formValues) onSubmit(formValues);
  };

  const handleSaveAndAddAnother = (values: TransactionFormSchemaType) => {
    if (onSaveAndAddAnother) {
      const formValues = prepareValues(values);
      if (formValues) onSaveAndAddAnother(formValues);
    }
  };

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
    form.setValue('amount', isNaN(parsedNumber) ? 0 : parsedNumber, { shouldValidate: true });
  };

  const handleInstallmentsChange = (value: number[]) => {
    const newInstallmentValue = value[0];
    if (newInstallmentValue >= 25) {
      setIsManualInstallments(true);
      if (installments < 25) {
        form.setValue('installments', undefined);
      }
    } else {
      setIsManualInstallments(false);
      setInstallments(newInstallmentValue);
      form.setValue('installments', newInstallmentValue);
    }
  };

  const handleManualInstallmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value, 10);

    if (value === '') {
      form.setValue('installments', undefined);
      setInstallments(25);
    } else if (!isNaN(numValue) && numValue >= 2 && numValue <= 120) {
      form.setValue('installments', numValue);
      setInstallments(numValue);
    } else if (value.length <= 3) {
      form.setValue('installments', undefined, { shouldValidate: true });
    }
  };

  return {
    form,
    states: {
      isCalendarOpen,
      setCalendarOpen,
      displayAmount,
      showInstallments,
      installments,
      isManualInstallments,
    },
    handlers: {
      handleFormSubmit,
      handleSaveAndAddAnother,
      handleAmountChange,
      handleInstallmentsChange,
      handleManualInstallmentChange,
    }
  };
}
