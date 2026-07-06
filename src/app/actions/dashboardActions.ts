'use server';

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

import { getTransactions, getInstallmentProjections } from './transactions';
import { getCategories } from './categoryActions';
import { getPaymentMethods } from './paymentMethodActions';
import { getSavingsFunds } from './savingsFundActions';
import { getCurrentBillingCycle, getBillingCycles } from './billingCycleActions';
import { endOfMonth, isPast, differenceInDays, startOfDay, format, startOfToday, subDays, addMonths } from 'date-fns';
import type { Transaction, BudgetInsights, BillingCycle, InstallmentProjection } from '@/types';
import { getDb } from '@/lib/actions-helpers';
import { validateUserId } from '@/lib/validation-helpers';
import { type ErrorResponse, isErrorResponse } from '@/lib/error-types';
import { handleActionError } from '@/lib/error-helpers';
import { getAuthenticatedUser } from '@/lib/auth-server';

export async function getBudgetInsights(
  startDate: Date,
  endDate: Date
): Promise<Pick<BudgetInsights, 'dailyAverage7Days' | 'weeklyExpensesTotal' | 'weeklyAverage28Days' | 'dailyExpenses'> | ErrorResponse> {
  try {
    const { id: userId } = await getAuthenticatedUser();
    const { transactionsCollection } = await getDb();
    const twentyEightDaysAgoStart = subDays(startOfToday(), 27);

    // Fetch expenses for the last 28 days to calculate both 7-day and 28-day metrics
    // Perform lookup with categories to respect includeInDailyExpenses setting and exclude extraordinary expenses
    const last28DaysExpenses = await transactionsCollection.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          isCardPayment: { $ne: true }, // Exclude unpaid card expenses
          isExtraordinary: { $ne: true }, // Exclude extraordinary transactions
          date: {
            $gte: twentyEightDaysAgoStart,
            $lte: endDate
          }
        }
      },
      {
        $addFields: {
          categoryIdObj: { $toObjectId: '$categoryId' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryIdObj',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: {
          path: '$categoryInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          $or: [
            { 'categoryInfo.includeInDailyExpenses': { $ne: false } },
            { 'categoryInfo': { $exists: false } }
          ]
        }
      },
      {
        $project: {
          date: 1,
          amount: 1,
          _id: 0
        }
      }
    ]).toArray() as unknown as { date: Date; amount: number }[];

    // Calculate 28-day average
    const totalExpenses28Days = last28DaysExpenses.reduce((sum, t) => sum + t.amount, 0);
    const weeklyAverage28Days = totalExpenses28Days > 0 ? totalExpenses28Days / 4 : 0;

    // Filter for last 7 days from the 28-day data
    const last7DaysExpenses = last28DaysExpenses.filter(t => new Date(t.date) >= startDate);

    const weeklyExpensesTotal = last7DaysExpenses.reduce((sum, t) => sum + t.amount, 0);
    const dailyAverage7Days = weeklyExpensesTotal > 0 ? weeklyExpensesTotal / 7 : 0;

    const dailyExpenses = last7DaysExpenses.map(t => ({
      date: new Date(t.date).toISOString(),
      total: t.amount,
    }));

    return { dailyAverage7Days, weeklyExpensesTotal, weeklyAverage28Days, dailyExpenses };

  } catch (error) {
    return handleActionError(error, 'fetch budget insights');
  }
}

async function getExpensesByCategory(
  startDate: Date,
  endDate: Date
): Promise<Array<{ categoryId: string; name: string; isSystem: boolean; total: number; icon?: string }> | ErrorResponse> {
  try {
    const { id: userId } = await getAuthenticatedUser();
    const { transactionsCollection } = await getDb();
    const pipeline = [
      {
        $match: {
          userId: userId,
          type: 'expense',
          isCardPayment: { $ne: true }, // Exclude unpaid card expenses
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $addFields: {
          categoryIdObj: { $toObjectId: "$categoryId" }
        }
      },
      {
        $group: {
          _id: "$categoryIdObj",
          total: { $sum: "$amount" }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: {
          path: "$categoryInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          name: { $ifNull: ["$categoryInfo.name", "Uncategorized"] },
          isSystem: { $ifNull: ["$categoryInfo.isSystem", false] },
          icon: "$categoryInfo.icon",
          total: "$total"
        }
      }
    ];

    const result = await transactionsCollection.aggregate(pipeline).toArray();
    return result.map(item => ({
      categoryId: item.categoryId.toString(),
      name: item.name as string,
      isSystem: item.isSystem as boolean,
      icon: item.icon as string | undefined,
      total: item.total as number,
    }));

  } catch (error) {
    return handleActionError(error, 'fetch expenses by category');
  }
}

const calculateCycleBudgetInsights = (transactions: Transaction[], currentCycle: BillingCycle | null): Pick<BudgetInsights, 'totalIncome' | 'totalExpenses' | 'balance' | 'weeklyBudget' | 'dailyBudget' | 'isHistoric' | 'cycleDailyAverage' | 'cycleWeeklyAverage' | 'previousCycleIncome' | 'previousCycleExpenses'> => {
  const now = new Date();

  const relevantTransactions = transactions.filter(t => t.type === 'income' || t.type === 'expense');

  const income = relevantTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  // Exclude credit card purchases from expenses (they're counted when the summary is paid)
  const expenses = relevantTransactions.filter(t => t.type === 'expense' && t.isCardPayment !== true).reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;

  let weeklyBudget = 0;
  let dailyBudget = 0;
  let isHistoric = false;
  let cycleDailyAverage = 0;
  let cycleWeeklyAverage = 0;

  if (currentCycle && currentCycle.id !== 'all') {
    const cycleStart = new Date(currentCycle.startDate);

    if (currentCycle.endDate && isPast(new Date(currentCycle.endDate))) {
      isHistoric = true;
      const cycleEnd = new Date(currentCycle.endDate);
      const cycleDurationDays = Math.max(1, differenceInDays(cycleEnd, cycleStart) + 1);

      cycleDailyAverage = expenses > 0 ? expenses / cycleDurationDays : 0;
      cycleWeeklyAverage = cycleDailyAverage * 7;
    } else {
      isHistoric = false;
      // Proyectar el fin de ciclo sumando 1 mes a la fecha de inicio del ciclo, normalizado al inicio del día
      const cycleStartNormalized = startOfDay(new Date(currentCycle.startDate));
      const projectedCycleEnd = addMonths(cycleStartNormalized, 1);
      const daysLeft = Math.max(1, differenceInDays(projectedCycleEnd, startOfDay(now)));

      if (balance > 0) {
        dailyBudget = balance / daysLeft;
        // El presupuesto semanal disponible no puede ser mayor que el balance real disponible para este ciclo
        weeklyBudget = Math.min(balance, dailyBudget * 7);
      }
    }
  }

  return {
    totalIncome: income,
    totalExpenses: expenses,
    balance,
    weeklyBudget,
    dailyBudget,
    isHistoric,
    cycleDailyAverage,
    cycleWeeklyAverage,
    previousCycleIncome: 0, 
    previousCycleExpenses: 0, 
  };
};

function resolveActiveCycle(
  cycleId: string | null | undefined, 
  currentCycle: BillingCycle | null, 
  billingCycles: BillingCycle[],
  userId: string
): BillingCycle | null {
  if (!cycleId) return currentCycle;
  if (cycleId === 'all') {
    return { id: 'all', userId, startDate: new Date(0).toISOString() };
  }
  return billingCycles.find(c => c.id === cycleId) || null;
}

function getCycleDateRange(activeCycle: BillingCycle | null) {
  const cycleStartDate = activeCycle ? new Date(activeCycle.startDate) : new Date(0);
  let cycleEndDate: Date;

  if (activeCycle?.endDate) {
    cycleEndDate = new Date(activeCycle.endDate);
  } else if (activeCycle?.id === 'all') {
    cycleEndDate = new Date();
  } else {
    cycleEndDate = endOfMonth(new Date());
  }

  return { cycleStartDate, cycleEndDate };
}

async function getPreviousCycleComparison(
  activeCycle: BillingCycle,
  billingCycles: BillingCycle[]
): Promise<{ income: number; expenses: number } | null> {
  const selectedCycleIndex = billingCycles.findIndex(c => c.id === activeCycle.id);
  if (selectedCycleIndex > -1 && selectedCycleIndex + 1 < billingCycles.length) {
    const previousCycle = billingCycles[selectedCycleIndex + 1];
    const transactionsForPreviousCycle = await getTransactions({ cycle: previousCycle });
    const prevIncome = transactionsForPreviousCycle
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    // Exclude credit card purchases from previous cycle expenses
    const prevExpenses = transactionsForPreviousCycle
      .filter(t => t.type === 'expense' && t.isCardPayment !== true)
      .reduce((sum, t) => sum + t.amount, 0);

    return { income: prevIncome, expenses: prevExpenses };
  }
  return null;
}

export async function getDashboardData(cycleId?: string | null) {
  const { id: userId } = await getAuthenticatedUser();

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const sevenDaysAgoStart = subDays(startOfToday(), 6);

  const [
    paymentMethods,
    savingsFunds,
    currentCycle,
    billingCycles,
    categories,
    weeklyInsightsResult,
    installmentProjection,
  ] = await Promise.all([
    getPaymentMethods(),
    getSavingsFunds(),
    getCurrentBillingCycle(),
    getBillingCycles(),
    getCategories(),
    getBudgetInsights(sevenDaysAgoStart, todayEnd),
    getInstallmentProjections(),
  ]);

  const weeklyInsights = isErrorResponse(weeklyInsightsResult)
    ? { dailyAverage7Days: 0, weeklyExpensesTotal: 0, weeklyAverage28Days: 0, dailyExpenses: [] }
    : weeklyInsightsResult;

  const activeCycle = resolveActiveCycle(cycleId, currentCycle, billingCycles, userId);
  const { cycleStartDate, cycleEndDate } = getCycleDateRange(activeCycle);

  const [transactionsForCycle, expensesByCategoryResult] = await Promise.all([
    getTransactions({ cycle: activeCycle }),
    getExpensesByCategory(cycleStartDate, cycleEndDate)
  ]);

  const expensesByCategory = isErrorResponse(expensesByCategoryResult) ? [] : expensesByCategoryResult;

  let budgetInsights = calculateCycleBudgetInsights(transactionsForCycle, activeCycle);

  if (activeCycle && activeCycle.id !== 'all') {
    const prevComparison = await getPreviousCycleComparison(activeCycle, billingCycles);
    if (prevComparison) {
      budgetInsights.previousCycleIncome = prevComparison.income;
      budgetInsights.previousCycleExpenses = prevComparison.expenses;
    }
  }

  return {
    transactionsForCycle,
    categories,
    paymentMethods,
    savingsFunds,
    currentCycle,
    billingCycles,
    totalCyclesCount: billingCycles.length,
    budgetInsights: { ...budgetInsights, ...weeklyInsights },
    expensesByCategory,
    installmentProjection,
  };
}
