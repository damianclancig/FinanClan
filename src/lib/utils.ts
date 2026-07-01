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

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { enUS, es, pt } from "date-fns/locale";
import type { Language } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as a currency string (e.g., $1,234.56).
 * Always uses USD for consistent formatting, as the currency symbol can be changed via CSS or UI.
 * @param value The number to format.
 * @returns The formatted currency string.
 */
export function formatCurrency(value: number): string {
  if (typeof value !== 'number') {
    return '$0.00';
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

/**
 * Formats a number into a compact "K" format for large numbers (e.g., $1.2k).
 * @param value The number to format.
 * @returns The compact formatted currency string.
 */
export function formatCurrencyK(value: number): string {
    if (typeof value !== 'number') {
      return '$0';
    }
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return formatCurrency(value);
};

/**
 * Formats a numeric string for display in an input, adding thousand separators.
 * Handles decimal points correctly.
 * @param numStr The numeric string to format.
 * @returns The formatted string for display.
 */
export function formatNumberForDisplay(numStr: string): string {
  if (!numStr) return '';
  const [integerPart, decimalPart] = numStr.split('.');
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  if (decimalPart !== undefined) {
    return `${formattedIntegerPart}.${decimalPart}`;
  }
  
  if (numStr.slice(-1) === '.') {
    return `${formattedIntegerPart}.`;
  }
  
  return formattedIntegerPart;
};

/**
 * Retorna el locale de date-fns correspondiente al idioma de la aplicación.
 * Centraliza la resolución del locale para evitar duplicación en componentes.
 * @param language El idioma activo de la aplicación.
 * @returns El objeto Locale de date-fns.
 */
export function getDateLocale(language: Language) {
  const locales = { en: enUS, es, pt };
  return locales[language] ?? enUS;
};

export const TRANSACTION_TYPE_COLORS: Record<string, string> = {
  income: 'text-green-600 dark:text-green-400',
  expense: 'text-red-600 dark:text-red-400',
  deposit: 'text-blue-600 dark:text-blue-400',
  withdrawal: 'text-orange-600 dark:text-orange-400',
  transfer: 'text-gray-600 dark:text-gray-400',
};
