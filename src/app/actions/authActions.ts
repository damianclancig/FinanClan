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

import { getDb, mapMongoDocumentUser } from '@/lib/actions-helpers';
import type { User } from '@/types';
import { randomUUID } from 'crypto';

interface SyncUserResult {
    success: boolean;
    user?: User;
    error?: string;
    isNewUser?: boolean;
}

export async function syncGoogleUser(googleId: string, email: string, name: string): Promise<SyncUserResult> {
    if (!googleId) {
        return { success: false, error: 'No user ID provided' };
    }

    try {
        const { usersCollection, transactionsCollection, taxesCollection, categoriesCollection, paymentMethodsCollection, savingsFundsCollection, billingCyclesCollection } = await getDb();

        const googleSub = googleId;
        console.log(`[AUTH-SYNC] Attempting to sync user: ${email} (GoogleSub: ${googleSub})`);

        // 1. Intentamos buscar por firebaseUid (ID de Google/Sub)
        let userDoc = await usersCollection.findOne({ firebaseUid: googleSub });

        // 2. Si no existe por ID, buscamos por E-mail (Muy importante para persistencia entre migraciones)
        if (!userDoc && email) {
            console.log(`[AUTH-SYNC] User not found by ID, searching by email: ${email}`);
            userDoc = await usersCollection.findOne({ email });
            
            if (userDoc) {
                // Si lo encontramos por mail, le actualizamos el firebaseUid para futuras búsquedas rápidas
                console.log(`[AUTH-SYNC] User found by email. Linking GoogleSub to internal user: ${userDoc._id}`);
                await usersCollection.updateOne(
                    { _id: userDoc._id },
                    { $set: { firebaseUid: googleSub, lastLogin: new Date() } }
                );
            }
        }

        if (userDoc) {
            console.log(`[AUTH-SYNC] Existing user authenticated. Internal DB ID: ${userDoc._id}`);
            // Actualizar último login
            await usersCollection.updateOne(
                { _id: userDoc._id },
                { $set: { lastLogin: new Date() } }
            );
            return { success: true, user: mapMongoDocumentUser(userDoc) };
        }

        // 3. NUEO USUARIO (Si llegamos aquí, no existe ni por ID ni por Mail)
        console.log(`[AUTH-SYNC] Creating NEW user for: ${email}`);
        
        const newUserId = randomUUID();
        const now = new Date();
        
        let firstName = name;
        let lastName = '';
        if (name) {
            const nameParts = name.split(' ');
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ');
        }

        const newUser: any = {
            _id: newUserId,
            firebaseUid: googleSub,
            email,
            firstName,
            lastName,
            createdAt: now.toISOString(),
            lastLogin: now.toISOString(),
        };

        await usersCollection.insertOne(newUser);
        console.log(`[AUTH-SYNC] New user record created with ID: ${newUserId}`);

        // 4. Verificamos si hay datos huérfanos con el googleSub (casos de migración manual)
        const legacyDataCount = await transactionsCollection.countDocuments({ userId: googleSub });
        if (legacyDataCount > 0) {
            console.log(`[AUTH-SYNC] Migrating ${legacyDataCount} legacy data entries to new ID: ${newUserId}`);
            await Promise.all([
                transactionsCollection.updateMany({ userId: googleSub }, { $set: { userId: newUserId } }),
                taxesCollection.updateMany({ userId: googleSub }, { $set: { userId: newUserId } }),
                categoriesCollection.updateMany({ userId: googleSub }, { $set: { userId: newUserId } }),
                paymentMethodsCollection.updateMany({ userId: googleSub }, { $set: { userId: newUserId } }),
                savingsFundsCollection.updateMany({ userId: googleSub }, { $set: { userId: newUserId } }),
                billingCyclesCollection.updateMany({ userId: googleSub }, { $set: { userId: newUserId } }),
            ]);
        }

        return { success: true, user: mapMongoDocumentUser(newUser), isNewUser: true };

    } catch (error) {
        console.error("Error syncing user:", error);
        return { success: false, error: 'Authentication failed' };
    }
}
