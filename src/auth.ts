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
