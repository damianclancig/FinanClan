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

import type { TransactionType } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslations } from "@/contexts/LanguageContext";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SeeDetailsButton } from '@/components/common/SeeDetailsButton';

interface TotalsDisplayProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsNet?: number;
  pocketBalance?: number;
  onSetSelectedType: (type: TransactionType | "all") => void;
}

export function TotalsDisplay({ totalIncome, totalExpenses, balance, savingsNet = 0, pocketBalance, onSetSelectedType }: TotalsDisplayProps) {
  const { translations } = useTranslations();

  const handleFilterClick = (type: TransactionType) => {
    onSetSelectedType(type);
    const filterCard = document.querySelector('[data-testid="filters-card"]');
    filterCard?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
      <Card className="shadow-xl border-2 border-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="font-medium flex items-center text-xl">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            {translations.totalIncome}
          </div>
          <SeeDetailsButton onClick={() => handleFilterClick('income')} />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-center text-green-600 dark:text-green-400 font-mono">
            {formatCurrency(totalIncome)}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-xl border-2 border-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="font-medium flex items-center text-xl">
            <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
            {translations.totalExpenses}
          </div>
           <SeeDetailsButton onClick={() => handleFilterClick('expense')} />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-center text-red-600 dark:text-red-400 font-mono">
            {formatCurrency(totalExpenses)}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-xl border-2 border-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="font-medium flex items-center text-xl">
             <DollarSign className={`h-5 w-5 mr-2 ${(pocketBalance ?? balance) >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
             {savingsNet !== 0 ? translations.pocketBalance : "Balance"}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`text-xl md:text-2xl font-bold text-center ${(pocketBalance ?? balance) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'} font-mono`}>
            {formatCurrency(pocketBalance ?? balance)}
          </div>
          {savingsNet !== 0 && (
            <div className="pt-2 border-t border-dashed text-xs text-muted-foreground space-y-1 font-mono">
              <div className="flex justify-between">
                <span>{translations.cycleBalance}:</span>
                <span className="font-semibold">{formatCurrency(balance)}</span>
              </div>
              <div className="flex justify-between text-orange-600 dark:text-orange-400">
                <span>{translations.savingsNet}:</span>
                <span className="font-semibold">-{formatCurrency(savingsNet)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
