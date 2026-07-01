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

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank } from 'lucide-react';
import { useTranslations } from '@/contexts/LanguageContext';
import type { SavingsFund } from '@/types';
import { SavingsFundsProgressChart } from '@/components/transactions/SavingsFundsProgressChart';
import { SeeDetailsButton } from '@/components/common/SeeDetailsButton';

interface SavingsFundsCardProps {
    funds: SavingsFund[];
}

export function SavingsFundsCard({ funds }: SavingsFundsCardProps) {
    const { translations } = useTranslations();
    const fundsWithTarget = funds.filter(fund => fund.targetAmount > 0);

    return (
        <Card className="shadow-xl border-2 border-primary h-full">
            <CardHeader className="p-4">
                 <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                        <PiggyBank className="h-5 w-5 mr-2 text-primary dark:text-accent" />
                        {translations.savingsFunds}
                    </CardTitle>
                    <SeeDetailsButton href="/savings-funds" />
                 </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 h-full">
                {fundsWithTarget.length > 0 ? (
                    <SavingsFundsProgressChart funds={fundsWithTarget} />
                ) : (
                    <div className="flex h-full min-h-[250px] flex-col items-center justify-center text-muted-foreground text-center p-4">
                        <PiggyBank className="w-10 h-10 mb-4" />
                        <p className="text-base font-semibold mb-2">{translations.noSavingsFundsProgressTitle}</p>
                        <p className="text-sm">
                            {translations.noSavingsFundsProgressDesc}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
