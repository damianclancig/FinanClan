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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Search } from 'lucide-react';
import { useTranslations } from '@/contexts/LanguageContext';

interface SeeDetailsButtonProps {
    href?: string;
    onClick?: () => void;
}

export function SeeDetailsButton({ href, onClick }: SeeDetailsButtonProps) {
    const { translations } = useTranslations();

    const buttonContent = (
        <Search className="h-5 w-5 text-primary group-hover:text-white" />
    );

    const buttonElement = href ? (
        <Button asChild variant="ghost" size="icon" className="group h-8 w-8">
            <Link href={href} aria-label={translations.seeDetails}>
                {buttonContent}
            </Link>
        </Button>
    ) : (
        <Button variant="ghost" size="icon" className="group h-8 w-8" onClick={onClick} aria-label={translations.seeDetails}>
            {buttonContent}
        </Button>
    );

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {buttonElement}
                </TooltipTrigger>
                <TooltipContent>
                    <p>{translations.seeDetails}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
