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
import Image from "next/image";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTranslations } from "@/contexts/LanguageContext";
import { LogOut, Menu, Home, PlusCircle, Landmark, Settings, Layers, PiggyBank, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";

export function Header() {
  const { translations } = useTranslations();
  const { user, signOut } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-7xl px-2 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="mr-3 sm:mr-4 border-2 border-primary" aria-label={translations.home}>
                  <Menu className="h-6 w-6" strokeWidth={2.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <span>{translations.home}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/taxes">
                    <Landmark className="mr-2 h-4 w-4" />
                    <span>{translations.taxes}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/installments">
                    <Layers className="mr-2 h-4 w-4" />
                    <span>{translations.installments}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/savings-funds">
                    <PiggyBank className="mr-2 h-4 w-4" />
                    <span>{translations.savingsFunds}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/card-summaries">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>{translations.cardSummaries}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/add-transaction">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>{translations.addTransaction}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/add-tax">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>{translations.newTax}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/account">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{translations.options}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{translations.signOut}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center no-underline">
            <Image 
              src="/logo-full.webp" 
              alt="FinanClan" 
              width={160} 
              height={40} 
              priority
              className="h-8 sm:h-10 w-auto object-contain"
              style={{ height: 'auto' }}
            />
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-base font-medium leading-none">{user.name}</p>
                    <p className="text-sm leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{translations.signOut}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

    