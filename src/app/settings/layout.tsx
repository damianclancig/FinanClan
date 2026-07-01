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

import React, { useCallback } from "react";
import { useTranslations } from "@/contexts/LanguageContext";
import { Settings, List, CreditCard, Plus, User, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FloatingActionButton } from "@/components/common/FloatingActionButton";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { translations } = useTranslations();
  const pathname = usePathname();
  const router = useRouter();

  const handleFabClick = useCallback(() => {
    if (pathname.includes('/settings/categories')) {
      router.push('/settings/categories/add');
    }
    if (pathname.includes('/settings/payment-methods')) {
      router.push('/settings/payment-methods/add');
    }
  }, [pathname, router]);

  const getFabLabel = () => {
    if (pathname.includes('/settings/categories')) {
      return translations.newCategory;
    }
    if (pathname.includes('/settings/payment-methods')) {
      return translations.newPaymentMethod;
    }
    return translations.new;
  }

  const showTabs = ['/settings/account', '/settings/categories', '/settings/payment-methods', '/settings/telegram'].includes(pathname);
  const showFab = ['/settings/categories', '/settings/payment-methods'].includes(pathname);

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center">
          <Settings className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">{translations.options}</h1>
        </div>
        
        {showTabs && (
          <Tabs value={pathname} className="w-full">
            <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <TabsList className="inline-flex h-auto w-max">
                 <TabsTrigger value="/settings/account" asChild className="text-base flex-1">
                    <Link href="/settings/account" className="flex items-center justify-center gap-2 py-2">
                    <User className="h-5 w-5"/>
                    <span>{translations.account}</span>
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="/settings/categories" asChild className="text-base flex-1">
                    <Link href="/settings/categories" className="flex items-center justify-center gap-2 py-2">
                    <List className="h-5 w-5"/>
                    <span>{translations.manageCategories}</span>
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="/settings/payment-methods" asChild className="text-base flex-1">
                    <Link href="/settings/payment-methods" className="flex items-center justify-center gap-2 py-2">
                    <CreditCard className="h-5 w-5"/>
                    <span>{translations.managePaymentMethods}</span>
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="/settings/telegram" asChild className="text-base flex-1">
                    <Link href="/settings/telegram" className="flex items-center justify-center gap-2 py-2">
                    <MessageCircle className="h-5 w-5"/>
                    <span>Telegram</span>
                    </Link>
                </TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Tabs>
        )}

        <div>
          {children}
        </div>
      </div>

      {showFab && (
        <FloatingActionButton
          onClick={handleFabClick}
          label={getFabLabel()}
          icon={Plus}
        />
      )}
    </>
  );
}
