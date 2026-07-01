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


import { useMemo } from 'react';
import { parseISO, differenceInDays, startOfDay, format as formatDate, startOfToday, subDays } from 'date-fns';
import type { BudgetInsights, Translations } from '@/types';

interface DailyExpenseData {
    name: string;
    amount: number;
    isToday: boolean;
}

export const useDailyExpensesChartData = (
    budgetInsights: BudgetInsights | null,
    translations: Translations
): DailyExpenseData[] => {
    return useMemo(() => {
        if (!budgetInsights?.dailyExpenses || !translations) return [];

        const now = new Date();
        const userLocale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

        const dailyTotals = new Map<string, number>();
        for (let i = 0; i < 7; i++) {
            const date = subDays(startOfToday(), i);
            const dayKey = formatDate(date, 'yyyy-MM-dd');
            dailyTotals.set(dayKey, 0);
        }

        budgetInsights.dailyExpenses.forEach(expense => {
            const expenseDateUTC = parseISO(expense.date);
            const localDayKey = formatDate(expenseDateUTC, 'yyyy-MM-dd');
            if (dailyTotals.has(localDayKey)) {
                dailyTotals.set(localDayKey, dailyTotals.get(localDayKey)! + expense.total);
            }
        });

        const getDayName = (date: Date): string => {
            const dayOfWeek = formatDate(date, 'EEEE'); // "Monday", "Tuesday", etc.
            return translations[dayOfWeek as keyof Translations] || dayOfWeek;
        };

        return Array.from(dailyTotals.entries())
            .map(([dayKey, total]) => {
                const itemDate = parseISO(dayKey + 'T12:00:00Z');
                let dayLabel: string;
                const diff = differenceInDays(startOfDay(now), startOfDay(itemDate));

                if (diff === 0) dayLabel = translations.today;
                else if (diff === 1) dayLabel = translations.yesterday;
                else dayLabel = getDayName(itemDate);

                return {
                    name: dayLabel,
                    amount: total,
                    isToday: diff === 0,
                };
            })
            .reverse();
    }, [budgetInsights?.dailyExpenses, translations]);
};
