import { auth } from '@/auth';
import { getDb, mapMongoDocumentUser } from '@/lib/actions-helpers';
import { ValidationError } from '@/lib/validation-helpers';
import type { User } from '@/types';

/**
 * Retrieves the authenticated user from the current session.
 * 
 * Flow:
 * 1. Request session from Auth.js natively.
 * 2. Queries MongoDB for the user with the matching ID.
 * 3. Returns the User object (with internal ID).
 * 
 * @throws {ValidationError} If no session exists or user is not found.
 */
export async function getAuthenticatedUser(): Promise<User> {
    const session = await auth();

    if (!session?.user?.id) {
        throw new ValidationError('Unauthorized: No session found');
    }

    try {
        const userId = session.user.id;
        const email = session.user.email;
        const { usersCollection } = await getDb();
        
        // Estrategia de búsqueda triple:
        // 1. Por ID interno (_id) - EL IDEAL
        // 2. Por firebaseUid (Google sub) - COMPATIBILIDAD
        // 3. Por email - RESPALDO FINAL
        const userDoc = await usersCollection.findOne({ 
            $or: [
                { _id: userId as any },
                { firebaseUid: userId },
                { email: email || '____NOMATCH____' }
            ]
        });

        if (!userDoc) {
            console.error(`[AUTH-SERVER] User not found in DB. Session ID: ${userId}, Email: ${email}`);
            throw new ValidationError('Unauthorized: User not found');
        }

        return mapMongoDocumentUser(userDoc);
    } catch (error) {
        if (error instanceof ValidationError) throw error;
        console.error('Error verifying session:', error);
        throw new ValidationError('Unauthorized: Invalid session');
    }
}
