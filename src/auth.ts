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

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { syncGoogleUser } from "@/app/actions/authActions"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        const googleId = user.id || profile?.sub || '';
        // Sincronizamos pero el ID real lo capturamos en el JWT para el token
        await syncGoogleUser(googleId, user.email, user.name || '');
        return true;
      }
      return false;
    },
    async jwt({ token, user, account, profile }) {
      // Al iniciar sesión por primera vez con el proveedor
      if (user && account?.provider === "google") {
        const googleId = user.id || profile?.sub || '';
        const syncResult = await syncGoogleUser(googleId, user.email || '', user.name || '');
        
        if (syncResult.success && syncResult.user) {
          // GUARDAMOS EL ID DE MONGODB (UUID o Legacy ID) en el token
          token.id = syncResult.user.id;
        } else {
          token.id = googleId; // Fallback al ID de google si falla la sincronización
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
})
