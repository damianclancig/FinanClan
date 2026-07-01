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
import { es, pt, enUS } from "date-fns/locale";
import { CalendarIcon, DollarSign, PiggyBank, Edit3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import type { SavingsFund } from "@/types";
import { useTranslations } from "@/contexts/LanguageContext";

import { useSavingsFundForm } from "./form/useSavingsFundForm";
import { SavingsFundFormSchemaType } from "./form/SavingsFundFormSchema";

interface SavingsFundFormProps {
  onSubmit: (values: SavingsFundFormSchemaType) => void;
  onClose: () => void;
  initialData?: Partial<SavingsFund>;
}

export function SavingsFundForm(props: SavingsFundFormProps) {
  const { translations, language } = useTranslations();
  
  const { form, states, handlers } = useSavingsFundForm({
    onSubmit: props.onSubmit,
    initialData: props.initialData,
  });

  const { isCalendarOpen, setCalendarOpen, displayAmount } = states;
  const { handleAmountChange, onSubmit } = handlers;

  const locales = { en: enUS, es, pt };
  const currentLocale = locales[language] || enUS;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel><PiggyBank className="inline-block mr-2 h-4 w-4" />{translations.savingsFundName}</FormLabel>
              <FormControl>
                <Input placeholder={translations.savingsFundName} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel><Edit3 className="inline-block mr-2 h-4 w-4" />{translations.savingsFundDescription}</FormLabel>
              <FormControl>
                <Textarea placeholder={translations.savingsFundDescription} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel><DollarSign className="inline-block mr-2 h-4 w-4" />{translations.savingsFundTargetAmount}</FormLabel>
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
          name="targetDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel><CalendarIcon className="inline-block mr-2 h-4 w-4" />{translations.savingsFundTargetDate}</FormLabel>
              <FormControl>
                <Button
                  type="button"
                  variant={"outline"}
                  className={cn("w-full pl-3 text-left font-normal text-base", !field.value && "text-muted-foreground")}
                  onClick={() => setCalendarOpen(true)}
                >
                  {field.value instanceof Date ? format(field.value, "PPP", { locale: currentLocale }) : <span>{translations.savingsFundTargetDate}</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
              <Dialog open={isCalendarOpen} onOpenChange={setCalendarOpen}>
                <DialogContent className="w-auto p-0">
                  <DialogHeader className="sr-only"><DialogTitle>{translations.date}</DialogTitle></DialogHeader>
                  <Calendar
                    locale={currentLocale}
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) field.onChange(date);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </DialogContent>
              </Dialog>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={props.onClose}>
            {translations.cancel}
          </Button>
          <Button type="submit">{translations.save}</Button>
        </div>
      </form>
    </Form>
  );
}
