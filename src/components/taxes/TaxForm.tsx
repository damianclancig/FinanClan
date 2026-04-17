"use client";

import React from "react";
import { DollarSign, Landmark, Calendar } from "lucide-react";
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

import type { Tax, Translations } from "@/types";
import { MONTHS } from "@/types";
import { useTranslations } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

import { useTaxForm } from "./form/useTaxForm";
import { TaxFormSchemaType } from "./form/TaxFormSchema";

interface TaxFormProps {
  onSubmit: (values: TaxFormSchemaType) => void;
  onClose: () => void;
  initialData?: Partial<Tax>;
  existingTaxNames?: string[];
}

export function TaxForm(props: TaxFormProps) {
  const { translations, translateMonth } = useTranslations();
  
  const { form, years, suggestionsRef, states, handlers } = useTaxForm({
    onSubmit: props.onSubmit,
    initialData: props.initialData,
    existingTaxNames: props.existingTaxNames,
  });

  const { displayAmount, suggestions, showSuggestions } = states;
  const { 
    handleNameChange, handleSuggestionClick, handleAmountChange, 
    handleAmountBlur, onSubmit 
  } = handlers;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem ref={suggestionsRef} className="relative">
              <FormLabel><Landmark className="inline-block mr-2 h-4 w-4" />{translations.taxName}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={translations.newTax}
                  onChange={handleNameChange}
                  autoComplete="off"
                />
              </FormControl>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute w-full mt-1 bg-background border border-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {suggestions.map(suggestion => (
                    <button
                      type="button"
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 text-base hover:bg-accent"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel><Calendar className="inline-block mr-2 h-4 w-4" />{translations.year}</FormLabel>
              <FormControl>
                <div className="grid grid-cols-3 gap-2">
                  {years.map(year => (
                    <Button
                      key={year}
                      type="button"
                      variant={field.value === year ? "default" : "outline"}
                      onClick={() => field.onChange(year)}
                      className={cn(
                        "text-base transition-colors duration-200",
                        field.value === year ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel><Calendar className="inline-block mr-2 h-4 w-4" />{translations.month}</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={translations.month} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={month} value={String(index)}>
                        {translateMonth(index)}
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
                    onBlur={() => {
                      field.onBlur();
                      handleAmountBlur();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="outline" onClick={props.onClose} className="text-base">
            {translations.cancel}
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-base">
            {translations.save}
          </Button>
        </div>
      </form>
    </Form>
  );
}
