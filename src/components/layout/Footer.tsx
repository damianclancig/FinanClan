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

import Link from "next/link";
import { useTranslations } from "@/contexts/LanguageContext";
import { SupportDialog } from "./SupportDialog";

export function Footer() {
  const { translations } = useTranslations();

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          <p>{translations.footerRights}</p>
          <p>
            {translations.footerAuthor}{' '}
            <a 
                href="https://clancig.com.ar" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-medium underline underline-offset-4 hover:text-primary"
            >
                clancig.com.ar
            </a>
          </p>
        </div>
        <div className="text-sm text-muted-foreground text-center space-x-4">
             <Link href="/terms" className="font-medium underline underline-offset-4 hover:text-primary">
                {translations.termsAndConditions}
             </Link>
             <Link href="/privacy" className="font-medium underline underline-offset-4 hover:text-primary">
                {translations.privacyPolicy}
             </Link>
        </div>
        <SupportDialog />
      </div>
    </footer>
  );
}
