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

import { getDb } from '@/lib/actions-helpers';
import { revalidateTag } from 'next/cache';
import { getAuthenticatedUser } from '@/lib/auth-server';
import type { User } from '@/types';

export async function getDbUserAction(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Not authenticated' };
  }
}

export async function deleteUserAccount(): Promise<{ success: boolean; error?: string }> {
  let internalUserId = 'unknown';
  try {
    const { id } = await getAuthenticatedUser();
    internalUserId = id;
    const db = await getDb();
    const {
      usersCollection,
      transactionsCollection,
      taxesCollection,
      categoriesCollection,
      paymentMethodsCollection,
      savingsFundsCollection,
      billingCyclesCollection
    } = db;

    // Step 0: Find the user to get the firebaseUid
    const user = await usersCollection.findOne({ _id: internalUserId } as any);

    if (!user) {
      return { success: false, error: 'User not found in database.' };
    }



    // Step 2: Delete all associated data from MongoDB using internalUserId
    await Promise.all([
      transactionsCollection.deleteMany({ userId: internalUserId }),
      taxesCollection.deleteMany({ userId: internalUserId }),
      categoriesCollection.deleteMany({ userId: internalUserId }),
      paymentMethodsCollection.deleteMany({ userId: internalUserId }),
      savingsFundsCollection.deleteMany({ userId: internalUserId }),
      billingCyclesCollection.deleteMany({ userId: internalUserId }),
      usersCollection.deleteOne({ _id: internalUserId } as any), // Delete the user record itself
    ]);

    // Step 3: Revalidate tags
    const userId = internalUserId; // Alias for consistency
    revalidateTag(`transactions_${userId}`, 'max');
    revalidateTag(`taxes_${userId}`, 'max');
    revalidateTag(`categories_${userId}`, 'max');
    revalidateTag(`paymentMethods_${userId}`, 'max');
    revalidateTag(`savingsFunds_${userId}`, 'max');
    revalidateTag(`billingCycles_${userId}`, 'max');

    return { success: true };

  } catch (error: any) {
    console.error(`Failed to delete user. Attempted on Internal User ID: ${internalUserId}. Raw Error:`, error);

    let errorMessage = 'An unknown error occurred during account deletion.';

    return { success: false, error: `Failed to delete account. Reason: ${errorMessage}` };
  }
}
