"use client";

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

import React from "react";
import { format } from "date-fns";
import { 
  CalendarIcon, DollarSign, Edit3, Type, ListTree, CreditCard, 
  TrendingUp, TrendingDown, Layers 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

import { cn, getDateLocale } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/icon-utils";
import { useTranslations } from "@/contexts/LanguageContext";
import type { Category, PaymentMethod, TransactionFormValues } from "@/types";

import { useTransactionForm } from "./form/useTransactionForm";

interface TransactionFormProps {
  onSubmit: (values: TransactionFormValues) => void;
  onSaveAndAddAnother?: (values: TransactionFormValues) => void;
  initialData?: Partial<TransactionFormValues> & { id?: string };
  onClose: () => void;
  isTaxPayment?: boolean;
  categories: Category[];
  paymentMethods: PaymentMethod[];
}

export function TransactionForm(props: TransactionFormProps) {
  const { categories, paymentMethods, onClose, isTaxPayment, initialData } = props;
  const { translations, language, translateCategory } = useTranslations();
  
  const { form, states, handlers } = useTransactionForm({
    onSubmit: props.onSubmit,
    onSaveAndAddAnother: props.onSaveAndAddAnother,
    initialData: props.initialData,
    paymentMethods: props.paymentMethods,
  });

  const { 
    isCalendarOpen, setCalendarOpen, displayAmount, 
    showInstallments, installments, isManualInstallments 
  } = states;

  const transactionType = form.watch("type");
  const selectedCategoryId = form.watch("categoryId");
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const showExtraordinaryField = 
    transactionType === "expense" && 
    (selectedCategory?.includeInDailyExpenses !== false);

  const { 
    handleFormSubmit, handleSaveAndAddAnother, handleAmountChange, 
    handleInstallmentsChange, handleManualInstallmentChange 
  } = handlers;

  const currentLocale = getDateLocale(language);

  const getCategoryDisplay = (cat: Category) => {
    const IconComponent = getCategoryIcon(cat.icon);
    return (
      <div className="flex items-center gap-2">
        {IconComponent && <IconComponent size={16} className="text-muted-foreground" />}
        <span>{translateCategory(cat)}</span>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel><Edit3 className="inline-block mr-2 h-4 w-4" />{translations.description}</FormLabel>
              <FormControl>
                <Textarea placeholder={translations.description} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel><DollarSign className="inline-block mr-2 h-4 w-4" />{translations.amount}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={displayAmount}
                    onChange={handleAmountChange}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel><CalendarIcon className="inline-block mr-2 h-4 w-4" />{translations.date}</FormLabel>
                <FormControl>
                  <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal text-base",
                      !field.value && "text-muted-foreground"
                    )}
                    onClick={() => setCalendarOpen(true)}
                  >
                    {field.value instanceof Date ? (
                      format(field.value, "PPP", { locale: currentLocale })
                    ) : (
                      <span>{translations.date}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
                <Dialog open={isCalendarOpen} onOpenChange={setCalendarOpen}>
                  <DialogContent className="w-auto p-0">
                    <DialogHeader className="sr-only">
                      <DialogTitle>{translations.date}</DialogTitle>
                    </DialogHeader>
                    <Calendar
                      locale={currentLocale}
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) field.onChange(date);
                        setCalendarOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </DialogContent>
                </Dialog>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel><Type className="inline-block mr-2 h-4 w-4" />{translations.type}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-4"
                  disabled={isTaxPayment}
                >
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="income" id="income" className="sr-only" />
                    </FormControl>
                    <FormLabel
                      htmlFor="income"
                      className={cn(
                        "flex flex-col items-center justify-center rounded-md border-2 p-2 cursor-pointer transition-colors duration-300 text-base",
                        field.value === 'income'
                          ? "bg-green-800 border-green-800 text-white font-semibold dark:bg-green-600 dark:border-green-600 dark:text-white"
                          : "font-normal bg-green-100 border-green-600 text-green-800 hover:bg-green-200 dark:bg-green-950 dark:border-green-950 dark:hover:bg-green-900 dark:text-green-300"
                      )}
                    >
                      <TrendingUp className={cn("mb-1 h-5 w-5", field.value === 'income' ? 'text-white' : 'text-green-500')} />
                      {translations.income}
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="expense" id="expense" className="sr-only" />
                    </FormControl>
                    <FormLabel
                      htmlFor="expense"
                      className={cn(
                        "flex flex-col items-center justify-center rounded-md border-2 p-2 cursor-pointer transition-colors duration-300 text-base",
                        field.value === 'expense'
                          ? "bg-red-800 border-red-800 text-white font-semibold dark:bg-red-600 dark:border-red-600 dark:text-white"
                          : "font-normal bg-red-100 border-red-600 text-red-800 hover:bg-red-200 dark:bg-red-950 dark:border-red-950 dark:hover:bg-red-900 dark:text-red-300"
                      )}
                    >
                      <TrendingDown className={cn("mb-1 h-5 w-5", field.value === 'expense' ? 'text-white' : 'text-red-500')} />
                      {translations.expense}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel><ListTree className="inline-block mr-2 h-4 w-4" />{translations.category}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isTaxPayment}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={translations.category}>
                        {field.value && categories.find(c => c.id === field.value) && (
                          getCategoryDisplay(categories.find(c => c.id === field.value)!)
                        )}
                        {!field.value && translations.category}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.filter(c => c.isEnabled).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {getCategoryDisplay(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethodId"
            render={({ field }) => (
              <FormItem>
                <FormLabel><CreditCard className="inline-block mr-2 h-4 w-4" />{translations.paymentType}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={translations.paymentType} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentMethods.filter(pm => pm.isEnabled).map((pm) => (
                      <SelectItem key={pm.id} value={pm.id}>
                        {pm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showExtraordinaryField && (
          <FormField
            control={form.control}
            name="isExtraordinary"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{translations.isExtraordinary}</FormLabel>
                  <div className="text-xs text-muted-foreground max-w-[280px]">
                    {translations.isExtraordinaryDescription}
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {showInstallments && (
          <div className="space-y-4 rounded-lg border p-4 shadow-sm">
            <FormField
              control={form.control}
              name="installments"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-1">
                    <FormLabel className="flex items-center mb-2">
                      <Layers className="inline-block mr-2 h-4 w-4" />
                      {translations.installments}: {isManualInstallments ? (form.getValues('installments') || '...') : installments}
                    </FormLabel>
                    <FormControl>
                      <Slider
                        value={[isManualInstallments ? 25 : installments]}
                        min={1}
                        max={25}
                        step={1}
                        onValueChange={handleInstallmentsChange}
                        className="w-full"
                      />
                    </FormControl>
                  </div>
                  {isManualInstallments && (
                    <div className="pt-2 md:grid md:grid-cols-2 md:gap-4 md:items-start">
                      <div className="md:col-start-2">
                        <FormLabel>{translations.manualInstallments}</FormLabel>
                        <Input
                          type="number"
                          placeholder="2-120"
                          min="2"
                          max="120"
                          onChange={handleManualInstallmentChange}
                          defaultValue={installments > 24 ? installments : ''}
                        />
                        <FormMessage className="mt-2" />
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="pt-2 flex flex-col md:flex-row md:justify-end gap-3">
          {props.onSaveAndAddAnother && !initialData?.id && (
            <Button
              type="button"
              variant="secondary"
              onClick={form.handleSubmit(handleSaveAndAddAnother)}
              className="w-full md:w-auto md:order-2 text-base"
            >
              {translations.saveAndAddAnother}
            </Button>
          )}
          <div className="flex w-full md:w-auto gap-3 order-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 md:flex-initial text-base">
              {translations.cancel}
            </Button>
            <Button type="button" onClick={form.handleSubmit(handleFormSubmit)} className="bg-primary hover:bg-primary/90 flex-1 md:flex-initial text-base">
              {translations.save}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
