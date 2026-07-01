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


"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useTranslations } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";
import { BackgroundWrapper } from "./BackgroundWrapper";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  useProtectedRoute();
  const pathname = usePathname();
  const { loading: authLoading, user } = useAuth();
  const { loading: langLoading } = useTranslations();
  
  const loading = authLoading || langLoading;

  const publicPagesWithLayout = ['/terms', '/privacy'];
  const pagesWithOwnLayout = ['/', '/goodbye', '/welcome', '/login'];
  
  const isPublicPageWithLayout = publicPagesWithLayout.includes(pathname);
  const hasOwnLayout = pagesWithOwnLayout.includes(pathname);

  // While loading auth state, show a full-screen loader
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render pages with completely custom layouts
  if (hasOwnLayout) {
    return <main>{children}</main>;
  }

  // If user is authenticated, or if it's a public page that uses the main layout
  if (user || isPublicPageWithLayout) {
    return (
      <>
        <Header />
        <BackgroundWrapper>
          <div className="min-h-screen flex flex-col pt-4">
            <main className="grow container max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 mx-auto">
              {children}
            </main>
            <Footer />
          </div>
        </BackgroundWrapper>
      </>
    );
  }

  // If we are on a protected page but there is no user, show a loader.
  // The AuthProvider's useEffect will handle the redirection to the login page.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
