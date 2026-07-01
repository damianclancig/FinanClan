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


"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "@/contexts/LanguageContext"
import { ArrowLeft, Lock } from "lucide-react"

export default function PrivacyPage() {
  const { translations } = useTranslations()

  if (!translations) return null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl min-h-screen">
      <Card className="shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b pb-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-primary">
              {translations.privacyPolicy || "Política de Privacidad"}
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            {translations.termsLastUpdated?.replace("{date}", "01/07/2026") || "Última actualización: 01/07/2026"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 text-muted-foreground leading-relaxed pb-10">
          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {translations.privacyDataRecollection}
            </h3>
            <p>{translations.privacyDataRecollectionText}</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {translations.privacyUseOfInformation}
            </h3>
            <p>{translations.privacyUseOfInformationText}</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {translations.privacyCookies}
            </h3>
            <p>{translations.privacyCookiesText}</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {translations.privacyUserRights}
            </h3>
            <p>{translations.privacyUserRightsText}</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              {translations.privacyChanges}
            </h3>
            <p>{translations.privacyChangesText}</p>
          </section>

          <div className="pt-6 border-t">
            <Link href="/" passHref>
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {translations.back || "Volver"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
