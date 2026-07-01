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

import { ObjectId } from 'mongodb';
import { getDb, mapMongoDocumentPaymentMethod, insertAndReturn } from '@/lib/actions-helpers';
import { validateObjectId } from '@/lib/validation-helpers';
import { handleActionError } from '@/lib/error-helpers';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { revalidateUserTag, CacheTag } from '@/lib/cache-helpers';
import type { PaymentMethod, PaymentMethodFormValues, Translations } from '@/types';


async function seedDefaultPaymentMethods(userId: string) {
  const { paymentMethodsCollection } = await getDb();
  const defaultMethods = [
    { name: 'Cash', type: 'Cash', isEnabled: true, userId },
    { name: 'Main Credit Card', type: 'Credit Card', bank: 'Default Bank', closingDay: 25, isEnabled: true, userId },
    { name: 'Main Debit Card', type: 'Debit Card', isEnabled: true, userId },
  ];
  await paymentMethodsCollection.insertMany(defaultMethods);
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { id } = await getAuthenticatedUser();
  return getInternalPaymentMethods(id);
}

export async function getInternalPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  if (!userId) return [];
  try {
    const { paymentMethodsCollection } = await getDb();
    const userMethodsCount = await paymentMethodsCollection.countDocuments({ userId });

    if (userMethodsCount === 0) {
      await seedDefaultPaymentMethods(userId);
    }

    const methods = await paymentMethodsCollection.find({ userId }).sort({ name: 1 }).toArray();
    return methods.map(mapMongoDocumentPaymentMethod);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
}

export async function getPaymentMethodById(id: string): Promise<PaymentMethod | null> {
  const { id: userId } = await getAuthenticatedUser();
  if (!ObjectId.isValid(id) || !userId) {
    return null;
  }
  try {
    const { paymentMethodsCollection } = await getDb();
    const paymentMethod = await paymentMethodsCollection.findOne({ _id: new ObjectId(id), userId });
    return paymentMethod ? mapMongoDocumentPaymentMethod(paymentMethod) : null;
  } catch (error) {
    console.error('Error fetching payment method by ID:', error);
    return null;
  }
}

export async function addPaymentMethod(data: PaymentMethodFormValues): Promise<PaymentMethod | { error: string }> {
  try {
    const { id: userId } = await getAuthenticatedUser();
    const { paymentMethodsCollection } = await getDb();
    const documentToInsert = { ...data, userId };
    return await insertAndReturn(
      paymentMethodsCollection,
      documentToInsert,
      mapMongoDocumentPaymentMethod,
      userId,
      CacheTag.PAYMENT_METHODS
    );
  } catch (error) {
    return handleActionError(error, 'add payment method');
  }
}

export async function updatePaymentMethod(id: string, data: PaymentMethodFormValues, translations: Translations): Promise<PaymentMethod | { error: string }> {
  try {
    const { id: userId } = await getAuthenticatedUser();
    validateObjectId(id, 'payment method ID');
    const { paymentMethodsCollection } = await getDb();

    const updateData: Partial<PaymentMethodFormValues> = { ...data };
    if (data.type !== 'Credit Card') {
      updateData.closingDay = undefined;
    }

    const result = await paymentMethodsCollection.updateOne(
      { _id: new ObjectId(id), userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return { error: translations.notFoundOrNoPermission };
    }

    revalidateUserTag(userId, CacheTag.PAYMENT_METHODS);
    const updatedMethod = await paymentMethodsCollection.findOne({ _id: new ObjectId(id) });
    if (!updatedMethod) {
      throw new Error('Could not find the updated payment method.');
    }
    return mapMongoDocumentPaymentMethod(updatedMethod);
  } catch (error) {
    return handleActionError(error, 'update payment method');
  }
}
