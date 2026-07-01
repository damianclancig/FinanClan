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
import { IncomeExpenseChart } from '@/components/transactions/IncomeExpenseChart';
import { BarChart } from 'lucide-react';
import { useTranslations } from '@/contexts/LanguageContext';

interface ChartData {
    name: string;
    current: number;
    previous: number;
}

interface IncomeExpenseChartCardProps {
    chartData: ChartData[];
}

export function IncomeExpenseChartCard({ chartData }: IncomeExpenseChartCardProps) {
    const { translations } = useTranslations();
    
    return (
        <div className="md:col-span-1">
            <Card className="shadow-xl border-2 border-primary h-full">
            <CardHeader className="p-4">
                <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-primary dark:text-accent" />
                {translations.incomeVsExpense}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <IncomeExpenseChart chartData={chartData} />
            </CardContent>
            </Card>
        </div>
    );
}
