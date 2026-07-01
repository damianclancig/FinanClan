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

import { getDb } from '@/lib/actions-helpers';
import { validateUserId } from '@/lib/validation-helpers';
import type { InstallmentProjection } from '@/types';
import { addMonths, startOfMonth, endOfMonth, format } from 'date-fns';

import { getAuthenticatedUser } from '@/lib/auth-server';

export async function getInstallmentProjections(): Promise<InstallmentProjection[]> {
  const { id: userId } = await getAuthenticatedUser();
  if (!userId) return [];
  try {
    const { transactionsCollection } = await getDb();
    const now = new Date();

    // Calculate range: 6 months back and 6 months forward from current month
    const rangeStart = startOfMonth(addMonths(now, -6));
    const rangeEnd = endOfMonth(addMonths(now, 6));

    const query = {
      userId,
      type: 'expense',
      groupId: { $exists: true },
      date: {
        $gte: rangeStart,
        $lte: rangeEnd
      }
    };

    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, month: "$_id", total: "$total" } }
    ];

    const result = await transactionsCollection.aggregate(pipeline).toArray() as unknown as InstallmentProjection[];

    const projectionMap = new Map(result.map((item: any) => [item.month, item.total]));
    const finalProjection: InstallmentProjection[] = [];

    // Generate 12 months: from -6 to +5 months relative to current month
    for (let i = -6; i <= 5; i++) {
      const monthDate = addMonths(startOfMonth(now), i);
      const monthKey = format(monthDate, 'yyyy-MM');
      finalProjection.push({
        month: monthKey,
        total: projectionMap.get(monthKey) || 0
      });
    }
    return finalProjection;
  } catch (error) {
    console.error('Error fetching installment projections:', error);
    return [];
  }
}
