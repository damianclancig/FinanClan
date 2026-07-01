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


'use server';

import { getDb, mapMongoDocumentBillingCycle, insertAndReturn } from '@/lib/actions-helpers';
import { validateUserId } from '@/lib/validation-helpers';
import { handleActionError } from '@/lib/error-helpers';
import { revalidateUserTag, revalidateUserTags, CacheTag, TagGroups } from '@/lib/cache-helpers';
import { getAuthenticatedUser } from '@/lib/auth-server';
import type { BillingCycle, Translations } from '@/types';
import { type Collection, type Document, type WithId, type Filter } from 'mongodb';

export async function getBillingCycles(): Promise<BillingCycle[]> {
  const { id: userId } = await getAuthenticatedUser();
  if (!userId) return [];
  try {
    const { billingCyclesCollection } = await getDb();
    const cycles = await billingCyclesCollection.find({ userId }).sort({ startDate: -1 }).toArray();
    return cycles.map(mapMongoDocumentBillingCycle);
  } catch (error) {
    console.error('Error fetching billing cycles:', error);
    return [];
  }
}


export async function getCurrentBillingCycle(): Promise<BillingCycle | null> {
  const { id } = await getAuthenticatedUser();
  return getInternalCurrentBillingCycle(id);
}

async function repairActiveBillingCycles(userId: string, activeCycles: WithId<Document>[], billingCyclesCollection: Collection<Document>): Promise<BillingCycle> {
  const mostRecentCycle = activeCycles[0];
  const cyclesToCloseIds = activeCycles.slice(1).map(c => c._id);

  const newStartDate = new Date(mostRecentCycle.startDate);
  const endDateForOldCycle = new Date(newStartDate.getTime() - 1);

  await billingCyclesCollection.updateMany(
    { _id: { $in: cyclesToCloseIds } },
    { $set: { endDate: endDateForOldCycle } }
  );

  revalidateUserTag(userId, CacheTag.BILLING_CYCLES);
  return mapMongoDocumentBillingCycle(mostRecentCycle);
}

export async function getInternalCurrentBillingCycle(userId: string): Promise<BillingCycle | null> {
  if (!userId) return null;
  try {
    const { billingCyclesCollection } = await getDb();

    const query: Filter<Document> = {
      userId,
      $or: [{ endDate: { $exists: false } }, { endDate: null }]
    };

    const activeCycles = await billingCyclesCollection.find(query).sort({ startDate: -1 }).toArray();

    if (activeCycles.length > 1) {
      return await repairActiveBillingCycles(userId, activeCycles, billingCyclesCollection);
    } else if (activeCycles.length === 1) {
      return mapMongoDocumentBillingCycle(activeCycles[0]);
    }

    const totalCyclesCount = await billingCyclesCollection.countDocuments({ userId });
    if (totalCyclesCount === 0) {
      return null;
    }

    const lastClosedCycle = await billingCyclesCollection.findOne({ userId }, { sort: { endDate: -1 } });
    return lastClosedCycle ? mapMongoDocumentBillingCycle(lastClosedCycle) : null;

  } catch (error) {
    console.error('Error fetching current billing cycle:', error);
    return null;
  }
}

export async function startNewCycle(startDate: Date, translations: Translations): Promise<BillingCycle | { error: string }> {
  try {
    const { id: userId } = await getAuthenticatedUser();
    const newCycleStartDate = startDate;
    const endDateForOldCycles = new Date(newCycleStartDate.getTime() - 1);
    const { billingCyclesCollection } = await getDb();

    const activeCycles = await billingCyclesCollection.find({
      userId,
      $or: [{ endDate: { $exists: false } }, { endDate: null }]
    }).toArray();

    if (activeCycles.length > 0) {
      const mostRecentActiveCycle = activeCycles.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
      if (new Date(mostRecentActiveCycle.startDate) >= newCycleStartDate) {
        return { error: translations.billingCycleDateError };
      }

      const activeCycleIds = activeCycles.map(c => c._id);
      await billingCyclesCollection.updateMany(
        { _id: { $in: activeCycleIds } },
        { $set: { endDate: endDateForOldCycles } }
      );
    }

    const newCycleDocument = {
      userId,
      startDate: newCycleStartDate,
    };

    return await insertAndReturn(
      billingCyclesCollection,
      newCycleDocument,
      mapMongoDocumentBillingCycle,
      userId,
      TagGroups.BILLING_CYCLE_MUTATION as unknown as CacheTag[]
    );

  } catch (error) {
    return handleActionError(error, 'add billing cycle');
  }
}
