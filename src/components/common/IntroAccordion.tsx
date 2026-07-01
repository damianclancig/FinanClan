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

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info, Forward } from "lucide-react";
import { useTranslations } from "@/contexts/LanguageContext";

interface IntroAccordionProps {
  titleKey: string;
  contentKeys: string[];
  storageKey: string;
}

export function IntroAccordion({ titleKey, contentKeys, storageKey }: IntroAccordionProps) {
  const { translations } = useTranslations();
  const [openAccordion, setOpenAccordion] = useState<string[]>([]);

  useEffect(() => {
    const savedState = localStorage.getItem(storageKey);
    // Default to open ('true') if no preference is saved
    if (savedState === 'false') {
      setOpenAccordion([]);
    } else {
      setOpenAccordion(['intro-item']);
    }
  }, [storageKey]);

  const handleAccordionChange = (value: string[]) => {
    setOpenAccordion(value);
    localStorage.setItem(storageKey, String(value.includes('intro-item')));
  };

  return (
    <Accordion type="multiple" value={openAccordion} onValueChange={handleAccordionChange} className="w-full">
      <AccordionItem value="intro-item" className="border-dashed border-primary shadow-lg rounded-lg mb-8 border">
        <Card>
          <AccordionTrigger className="w-full p-4 hover:no-underline">
            <CardHeader className="p-0 flex-1">
              <CardTitle className="flex items-center text-primary text-left">
                <Info className="h-5 w-5 mr-3" />
                {translations[titleKey]}
              </CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="pt-0">
              <ul className="space-y-3 list-none text-base text-muted-foreground">
                {contentKeys.map((key) => (
                  <li key={key} className="flex items-start">
                    <Forward className="h-5 w-5 mr-3 mt-1 text-primary/80 shrink-0" />
                    <span>{translations[key]}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
}
