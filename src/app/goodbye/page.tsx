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

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslations } from "@/contexts/LanguageContext";
import { BackgroundWrapper } from "@/components/layout/BackgroundWrapper";
import Link from "next/link";
import Image from "next/image";
import { Heart, Share2, Home, Check } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";

export default function GoodbyePage() {
    const { translations } = useTranslations();
    const { signOut } = useAuth();
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        // This is the crucial step: explicitly sign out on the client-side.
        // This clears any lingering user state in the AuthContext.
        // The noRedirect flag prevents it from navigating away from this page.
        signOut(undefined, { noRedirect: true });
    }, [signOut]);

    const handleShare = () => {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        navigator.clipboard.writeText(appUrl).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <BackgroundWrapper>
             <div className="flex min-h-screen flex-col">
                <header className="flex items-center justify-end p-4">
                    <div className="flex items-center space-x-2">
                        <ThemeSwitcher />
                        <LanguageSwitcher />
                    </div>
                </header>

                <main className="grow flex items-center justify-center p-4 text-center">
                    <Card className="w-full max-w-lg border-2 border-primary/50 shadow-2xl rounded-2xl bg-card/80 backdrop-blur-sm">
                        <CardHeader className="p-8">
                            <div className="flex justify-center mb-4">
                                <Heart className="h-16 w-16 text-primary animate-pulse" />
                            </div>
                            <CardTitle className="text-3xl">{translations.goodbyeTitle}</CardTitle>
                            <div className="flex justify-center -mt-2 mb-2">
                                <Image 
                                    src="/logo-full.webp" 
                                    alt="FinanClan" 
                                    width={300} 
                                    height={80} 
                                    priority
                                    className="w-auto h-16 sm:h-20 object-contain"
                                    style={{ height: 'auto' }}
                                />
                            </div>
                            <CardDescription className="text-base text-muted-foreground pt-2">
                                {translations.goodbyeMessage1}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <p className="text-base">{translations.goodbyeMessage2}</p>
                            <p className="text-base">{translations.goodbyeMessage3}</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button onClick={handleShare} variant="secondary" className="w-full text-base py-6" disabled={isCopied}>
                                    {isCopied ? (
                                        <>
                                            <Check className="mr-2 h-5 w-5 text-green-500" />
                                            {translations.copied}
                                        </>
                                    ) : (
                                        <>
                                            <Share2 className="mr-2 h-5 w-5" />
                                            {translations.goodbyeShare}
                                        </>
                                    )}
                                </Button>
                                <Button asChild className="w-full text-base py-6">
                                    <Link href="/">
                                        <Home className="mr-2 h-5 w-5" />
                                        {translations.goodbyeBackHome}
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        </BackgroundWrapper>
    );
}
