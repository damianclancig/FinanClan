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


import { MongoClient, type WithId, type Document, type Collection } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { CacheTag, revalidateUserTag, revalidateUserTags } from './cache-helpers';
import type { Transaction, Tax, Category, PaymentMethod, SavingsFund, BillingCycle, User } from '@/types';

// Helper function to get the database and collection
export async function getDb() {
  const client: MongoClient = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || 'ledger_lite');
  return {
    db,
    transactionsCollection: db.collection('transactions'),
    taxesCollection: db.collection('taxes'),
    categoriesCollection: db.collection('categories'),
    paymentMethodsCollection: db.collection('paymentMethods'),
    savingsFundsCollection: db.collection('savingsFunds'),
    billingCyclesCollection: db.collection('billingCycles'),
    usersCollection: db.collection('users'),
  };
}

export function mapMongoDocumentUser(doc: WithId<Document>): User {
  const baseDoc = mapBaseDocument<Omit<User, 'createdAt' | 'lastLogin'>>(doc as any);
  return {
    ...baseDoc,
    createdAt: new Date(doc.createdAt).toISOString(),
    lastLogin: new Date(doc.lastLogin).toISOString(),
  };
}

function mapBaseDocument<T>(doc: WithId<Document>): T {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest } as T;
}

// Map MongoDB's _id and other fields to a serializable object
export function mapMongoDocument(doc: WithId<Document>): Transaction {
  const baseDoc = mapBaseDocument<Omit<Transaction, 'date'>>(doc as any);
  return {
    ...baseDoc,
    date: new Date(doc.date).toISOString(), // Standardize to ISO string
  };
}

export function mapMongoDocumentTax(doc: WithId<Document>): Tax {
  const baseDoc = mapBaseDocument<Omit<Tax, 'date'>>(doc as any);
  return {
    ...baseDoc,
    date: doc.date ? new Date(doc.date).toISOString() : undefined,
  };
}

export function mapMongoDocumentCategory(doc: WithId<Document>): Category {
  const mapped = mapBaseDocument<Category>(doc);
  if (mapped.includeInDailyExpenses === undefined) {
    mapped.includeInDailyExpenses = !mapped.isSystem;
  }
  return mapped;
}

export function mapMongoDocumentPaymentMethod(doc: WithId<Document>): PaymentMethod {
  return mapBaseDocument<PaymentMethod>(doc);
}

export function mapMongoDocumentSavingsFund(doc: WithId<Document>): SavingsFund {
  const baseDoc = mapBaseDocument<Omit<SavingsFund, 'targetDate'>>(doc as any);
  return {
    ...baseDoc,
    targetDate: doc.targetDate ? new Date(doc.targetDate).toISOString() : undefined,
  };
}

export function mapMongoDocumentBillingCycle(doc: WithId<Document>): BillingCycle {
  const baseDoc = mapBaseDocument<Omit<BillingCycle, 'startDate' | 'endDate'>>(doc as any);
  return {
    ...baseDoc,
    startDate: new Date(doc.startDate).toISOString(),
    endDate: doc.endDate ? new Date(doc.endDate).toISOString() : undefined,
  };
}

/**
 * Helper function to insert a document and return the mapped result.
 * Avoids the "insert then find" anti-pattern (N+1 database queries).
 */
export async function insertAndReturn<T>(
  collection: Collection<Document>,
  document: any,
  mapper: (doc: WithId<Document>) => T,
  userId: string,
  cacheTags: CacheTag | CacheTag[]
): Promise<T> {
  const result = await collection.insertOne(document);
  
  if (!result.insertedId) {
    throw new Error('Database operation failed: Insert returned no ID');
  }

  // Revalidate relevant cache tags
  if (Array.isArray(cacheTags)) {
    revalidateUserTags(userId, cacheTags);
  } else {
    revalidateUserTag(userId, cacheTags);
  }

  // Return the mapped document with the new ID without extra fetch
  const insertedDoc = { ...document, _id: result.insertedId } as WithId<Document>;
  return mapper(insertedDoc);
}

