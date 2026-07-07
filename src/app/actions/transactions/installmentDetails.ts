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

import { getDb, mapMongoDocument, mapMongoDocumentPaymentMethod } from '@/lib/actions-helpers';
import { parseInstallmentDescription } from '@/lib/installment-helpers';
import type { InstallmentDetail, CompletedInstallmentDetail, PaymentMethod, Transaction } from '@/types';
import { isFuture, isSameMonth, isPast } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { getAuthenticatedUser } from '@/lib/auth-server';

async function getPaymentMethodsForInstallments(): Promise<PaymentMethod[]> {
  const { id: userId } = await getAuthenticatedUser();
  if (!userId) return [];
  try {
    const { paymentMethodsCollection } = await getDb();
    const methods = await paymentMethodsCollection.find({ userId }).sort({ name: 1 }).toArray();
    return methods.map(mapMongoDocumentPaymentMethod);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
}

export async function getInstallmentDetails(): Promise<{ pendingDetails: InstallmentDetail[], completedDetails: CompletedInstallmentDetail[], totalPending: number, totalForCurrentMonth: number }> {
  const { id: userId } = await getAuthenticatedUser();
  if (!userId) return { pendingDetails: [], completedDetails: [], totalPending: 0, totalForCurrentMonth: 0 };

  try {
    const { transactionsCollection, usersCollection } = await getDb();
    const userDoc = await usersCollection.findOne({ _id: userId as any });
    const timezone = userDoc?.timezone || 'America/Argentina/Buenos_Aires';

    const paymentMethods = await getPaymentMethodsForInstallments();
    const paymentMethodMap = new Map(paymentMethods.map(pm => [pm.id, pm]));

    const installmentTransactions = await transactionsCollection.find({
      userId,
      type: 'expense',
      groupId: { $exists: true }
    }).sort({ date: 1 }).toArray();

    if (installmentTransactions.length === 0) {
      return { pendingDetails: [], completedDetails: [], totalPending: 0, totalForCurrentMonth: 0 };
    }

    const groupedInstallments = new Map<string, Transaction[]>();

    for (const trans of installmentTransactions) {
      const key = trans.groupId;
      if (!groupedInstallments.has(key)) {
        groupedInstallments.set(key, []);
      }
      groupedInstallments.get(key)!.push(mapMongoDocument(trans));
    }

    const pendingDetails: InstallmentDetail[] = [];
    const completedDetails: CompletedInstallmentDetail[] = [];
    let totalPending = 0;
    let totalForCurrentMonth = 0;
    const now = toZonedTime(new Date(), timezone);

    groupedInstallments.forEach((group) => {
      group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstInstallment = group[0];
      const lastInstallment = group[group.length - 1];
      const totalInstallments = group.length;
      const purchaseAmount = group.reduce((sum, item) => sum + item.amount, 0);

      // Use installment helper to parse description
      const parsed = parseInstallmentDescription(firstInstallment.description);
      const baseDescription = parsed ? parsed.baseDescription : firstInstallment.description;

      const paymentMethod = paymentMethodMap.get(firstInstallment.paymentMethodId);
      const paymentMethodName = paymentMethod ? `${paymentMethod.name} ${paymentMethod.bank ? `(${paymentMethod.bank})` : ''}`.trim() : 'Unknown';

      const pendingInstallments = group.filter(item => {
        const itemDateZoned = toZonedTime(new Date(item.date), timezone);
        return isFuture(itemDateZoned) || isSameMonth(itemDateZoned, now);
      });

      if (pendingInstallments.length > 0) {
        const pendingAmount = pendingInstallments.reduce((sum, item) => sum + item.amount, 0);
        totalPending += pendingAmount;

        const currentMonthInstallment = pendingInstallments.find(item => isSameMonth(toZonedTime(new Date(item.date), timezone), now));
        if (currentMonthInstallment) {
          totalForCurrentMonth += currentMonthInstallment.amount;
        }

        pendingDetails.push({
          id: firstInstallment.id,
          description: baseDescription,
          totalAmount: purchaseAmount,
          installmentAmount: firstInstallment.amount,
          currentInstallment: totalInstallments - pendingInstallments.length + 1,
          totalInstallments: totalInstallments,
          pendingAmount: pendingAmount,
          paymentMethodName: paymentMethodName,
          purchaseDate: firstInstallment.date,
          lastInstallmentDate: lastInstallment.date,
        });
      } else {
        if (isPast(toZonedTime(new Date(lastInstallment.date), timezone))) {
          completedDetails.push({
            id: firstInstallment.id,
            description: baseDescription,
            totalAmount: purchaseAmount,
            totalInstallments: totalInstallments,
            paymentMethodName: paymentMethodName,
            purchaseDate: firstInstallment.date,
            lastInstallmentDate: lastInstallment.date,
          });
        }
      }
    });

    return {
      pendingDetails: pendingDetails.sort((a, b) => b.pendingAmount - a.pendingAmount),
      completedDetails: completedDetails.sort((a, b) => new Date(b.lastInstallmentDate).getTime() - new Date(a.lastInstallmentDate).getTime()),
      totalPending,
      totalForCurrentMonth
    };

  } catch (error) {
    console.error('Error fetching installment details:', error);
    return { pendingDetails: [], completedDetails: [], totalPending: 0, totalForCurrentMonth: 0 };
  }
}
