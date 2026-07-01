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

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslations } from "@/contexts/LanguageContext";

import { GoogleIcon } from "@/components/common/GoogleIcon";
import { BackgroundWrapper } from "@/components/layout/BackgroundWrapper";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const { translations } = useTranslations();
  const router = useRouter();

  useEffect(() => {
    // This logic is now handled in AuthProvider,
    // but we keep a fallback just in case.
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-end p-4">
          <div className="flex items-center space-x-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </header>

        <main className="grow flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-2 border-primary/50 shadow-2xl rounded-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center p-8">
              <h1 className="text-6xl font-extrabold">
                <span
                  style={{
                    background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    textShadow: '0 2px 4px rgba(30, 58, 138, 0.4)',
                    WebkitTextStroke: '1px rgba(0,0,0,0.1)',
                  }}
                >
                  Finan
                </span>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #FBBF24, #FDE68A, #F59E0B)',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    textShadow: '0 2px 3px rgba(245, 158, 11, 0.5)',
                    WebkitTextStroke: '1px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  Clan
                </span>
              </h1>
              <p className="text-muted-foreground text-base">
                {translations.signInToContinue}
              </p>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              <Button
                onClick={signInWithGoogle}
                className="w-full text-base py-6 bg-white/90 text-gray-800 hover:bg-white dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80 border-2 border-transparent hover:border-accent transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <GoogleIcon className="mr-3 h-6 w-6" />
                {translations.signInWithGoogle}
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </BackgroundWrapper>
  );
}
