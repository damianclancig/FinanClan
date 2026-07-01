"use client";

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

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "./LanguageContext";
import { SessionProvider, signIn, signOut as nextAuthSignOut, useSession } from "next-auth/react";
import { getDbUserAction } from "@/app/actions/userActions";
import type { User } from "@/types";

interface AuthContextType {
  user: { name?: string | null; email?: string | null; image?: string | null; id?: string } | null;
  dbUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: (redirectPath?: string, options?: { noRedirect?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { translations } = useTranslations();
  
  const loading = status === "loading" || (isSyncing && !dbUser);

  useEffect(() => {
    const fetchDbUser = async () => {
      if (session?.user) {
        setIsSyncing(true);
        try {
          const dbResult = await getDbUserAction();
          if (dbResult.success && dbResult.user) {
            setDbUser(dbResult.user);
          } else {
            console.error("No database user mapped.");
            setDbUser(null);
          }
        } catch (err) {
          console.error("Sync user error:", err);
        } finally {
          setIsSyncing(false);
        }
      } else if (status === "unauthenticated") {
        setDbUser(null);
      }
    };

    fetchDbUser();
  }, [session, status]);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signIn("google");
    } catch (error: any) {
      toast({ title: translations.errorTitle, description: error.message || "Login failed", variant: "destructive" });
    }
  }, [toast, translations]);

  const customSignOut = useCallback(async (redirectPath: string = '/', options: { noRedirect?: boolean } = {}) => {
    try {
      setDbUser(null);
      if (options.noRedirect) {
        await nextAuthSignOut({ redirect: false, callbackUrl: redirectPath });
      } else {
        await nextAuthSignOut({ redirect: true, callbackUrl: redirectPath });
      }
    } catch (error) {
      console.error("Error signing out", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user: session?.user as any || null, dbUser, loading, signInWithGoogle, signOut: customSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
