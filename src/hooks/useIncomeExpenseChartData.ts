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
import type { BudgetInsights } from '@/types';

interface IncomeExpenseChartData {
    name: string;
    current: number;
    previous: number;
}

export const useIncomeExpenseChartData = (
    budgetInsights: BudgetInsights | null,
    incomeLabel: string,
    expenseLabel: string
): IncomeExpenseChartData[] => {
    return useMemo(() => {
        if (!budgetInsights) {
            return [
                { name: incomeLabel, current: 0, previous: 0 },
                { name: expenseLabel, current: 0, previous: 0 },
            ];
        }
        return [
            {
                name: incomeLabel,
                current: budgetInsights.totalIncome,
                previous: budgetInsights.previousCycleIncome
            },
            {
                name: expenseLabel,
                current: budgetInsights.totalExpenses,
                previous: budgetInsights.previousCycleExpenses
            },
        ];
    }, [budgetInsights, incomeLabel, expenseLabel]);
};
