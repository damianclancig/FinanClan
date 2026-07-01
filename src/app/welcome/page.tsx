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

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/contexts/LanguageContext";
import { startNewCycle } from "@/app/actions/billingCycleActions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Rocket, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getDateLocale } from "@/lib/utils";
import { BackgroundWrapper } from "@/components/layout/BackgroundWrapper";
import { Footer } from "@/components/layout/Footer";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Link from "next/link";
import Image from "next/image";

export default function WelcomePage() {
    const { user, dbUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { translations, language } = useTranslations();
    const [isStartingNewCycle, setIsStartingNewCycle] = useState(false);
    const [newCycleStartDate, setNewCycleStartDate] = useState<Date | undefined>(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const currentLocale = getDateLocale(language);

    const handleStartNewCycle = async () => {
        if (!dbUser || !newCycleStartDate) {
            toast({ title: translations.errorTitle, description: translations.dateRequired, variant: "destructive" });
            return;
        };
        setIsStartingNewCycle(true);

        // Create the date object representing midnight in the user's local timezone
        const localDate = new Date(newCycleStartDate);
        localDate.setHours(0, 0, 0, 0);

        const result = await startNewCycle(localDate, translations);
        if ('error' in result) {
            toast({ title: translations.errorTitle, description: result.error, variant: "destructive" });
            setIsStartingNewCycle(false);
        } else {
            toast({ title: translations.newCycleStartedTitle, description: translations.newCycleStartedDesc });
            router.push('/dashboard');
        }
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

                <main className="grow flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl shadow-2xl border-2 border-primary/50 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="text-center p-8">
                            <CardTitle className="text-3xl">{translations.welcomeTitle}</CardTitle>
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
                            <CardDescription className="text-base pt-2 text-foreground/80">
                                {translations.welcomeSubtitle}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-8 pt-0">
                            <p className="text-muted-foreground text-center">
                                {translations.welcomeDesc}
                            </p>
                            <div className="space-y-2">
                                <p className="font-semibold text-center">{translations.selectStartDate}</p>
                                <div className="flex justify-center">
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[280px] justify-start text-left font-normal",
                                                    !newCycleStartDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {newCycleStartDate ? format(newCycleStartDate, "PPP", { locale: currentLocale }) : <span>{translations.date}</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="center">
                                            <Calendar
                                                mode="single"
                                                locale={currentLocale}
                                                weekStartsOn={0}
                                                selected={newCycleStartDate}
                                                onSelect={(date) => {
                                                    setNewCycleStartDate(date);
                                                    setIsCalendarOpen(false);
                                                }}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleStartNewCycle}
                                disabled={isStartingNewCycle || !newCycleStartDate}
                                className="w-full text-lg py-6 mt-4"
                            >
                                <Rocket className="mr-3 h-5 w-5" />
                                {isStartingNewCycle ? translations.starting : translations.startFirstCycle}
                            </Button>
                            <p className="text-center text-xs text-muted-foreground px-4">
                                {translations.welcomeTermsText1}{' '}
                                <Link href="/terms" className="underline hover:text-primary">
                                    {translations.termsAndConditions}
                                </Link>
                                .
                            </p>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        </BackgroundWrapper>
    );
}
