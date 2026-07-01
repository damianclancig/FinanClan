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

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatNumberForDisplay } from "@/lib/utils";
import { useTranslations } from "@/contexts/LanguageContext";
import { getTaxFormSchema, TaxFormSchemaType } from "./TaxFormSchema";

interface UseTaxFormProps {
  onSubmit: (values: TaxFormSchemaType) => void;
  initialData?: any;
  existingTaxNames?: string[];
}

export function useTaxForm({
  onSubmit,
  initialData,
  existingTaxNames = [],
}: UseTaxFormProps) {
  const { translations } = useTranslations();
  const [displayAmount, setDisplayAmount] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const formSchema = getTaxFormSchema(translations);

  const form = useForm<TaxFormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      month: initialData?.month ?? new Date().getMonth(),
      year: initialData?.year ?? currentYear,
      amount: initialData?.amount,
    },
  });

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync initialData
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        month: initialData.month ?? new Date().getMonth(),
        year: initialData.year ?? currentYear,
        amount: initialData.amount,
      });
      if (initialData.amount) {
        setDisplayAmount(formatNumberForDisplay(String(initialData.amount.toFixed(2))));
      }
    }
  }, [initialData, form, currentYear]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("name", value);
    if (value) {
      const filtered = existingTaxNames.filter(name =>
        name.toLowerCase().includes(value.toLowerCase()) && name.toLowerCase() !== value.toLowerCase()
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    form.setValue("name", name);
    setShowSuggestions(false);
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

    const valueForForm = numericValue.endsWith('.') ? numericValue.slice(0, -1) : numericValue;
    const parsedNumber = parseFloat(valueForForm);

    if (!isNaN(parsedNumber)) {
      form.setValue('amount', parsedNumber, { shouldValidate: true });
    } else {
      form.setValue('amount', 0, { shouldValidate: true });
    }
  };

  const handleAmountBlur = () => {
    const value = form.getValues('amount');
    if (value) {
      setDisplayAmount(formatNumberForDisplay(String(value.toFixed(2))));
    } else {
      setDisplayAmount('');
    }
  };

  return {
    form,
    years,
    suggestionsRef,
    states: {
      displayAmount,
      suggestions,
      showSuggestions,
    },
    handlers: {
      handleNameChange,
      handleSuggestionClick,
      handleAmountChange,
      handleAmountBlur,
      onSubmit: form.handleSubmit(onSubmit),
    }
  };
}
