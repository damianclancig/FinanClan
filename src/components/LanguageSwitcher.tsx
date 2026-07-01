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

import { useTranslations } from "@/contexts/LanguageContext";
import type { Language } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguagesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { language, setLanguage, translations } = useTranslations();

  const onValueChange = (value: string) => {
    setLanguage(value as Language);
  };

  return (
    <Select value={language} onValueChange={onValueChange}>
      <SelectTrigger 
        className="w-10 h-10 p-0 border-2 border-primary" 
        aria-label={translations.selectLanguage}
        showArrow={false}
      >
        <LanguagesIcon className="h-5 w-5 mx-auto" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{translations.english}</SelectItem>
        <SelectItem value="es">{translations.spanish}</SelectItem>
        <SelectItem value="pt">{translations.portuguese}</SelectItem>
      </SelectContent>
    </Select>
  );
}
